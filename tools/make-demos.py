"""
Make the voice demos in public/demos/<lang>/<preset id>.mp3.

Each sample voice reads DEMO_LINES (lib/demos.ts) in each language, with the tool's own engine in a headless browser,
so the demos sound like what people get after the model downloads.

  npm run build && npx serve out -l 4000      # in one terminal
  pip install playwright && playwright install chromium
  python3 tools/make-demos.py                 # all languages; or: python3 tools/make-demos.py de,it

Needs ffmpeg. Existing files are kept; delete one to make it again. About a minute per demo on a laptop.
"""
import os, re, subprocess, sys, tempfile, time
from playwright.sync_api import sync_playwright

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
URL = os.environ.get('DEMO_URL', 'http://localhost:4000/')

src = open(os.path.join(ROOT, 'lib/demos.ts'), encoding='utf-8').read()
LINES = dict(re.findall(r"^  (\w\w): '((?:[^'\\]|\\.)*)',$", src, re.M))
langs = sys.argv[1].split(',') if len(sys.argv) > 1 else list(LINES)

with sync_playwright() as p, tempfile.TemporaryDirectory() as tmp:
    browser = p.chromium.launch()
    for lang in langs:
        page = browser.new_page(viewport={'width': 1440, 'height': 1000}, accept_downloads=True)
        page.on('dialog', lambda dialog: dialog.accept())
        page.goto(URL)
        page.select_option('.pane-text select', lang)
        page.locator('.editor-input').fill(LINES[lang].replace("\\'", "'"))
        if page.locator('.btn-more').count():
            page.locator('.btn-more').click()
        presets = page.evaluate("() => [...document.querySelectorAll('.preset')].length")
        for i in range(presets):
            row = page.locator('.preset').nth(i)
            preset_id = row.get_attribute('data-id')
            out = os.path.join(ROOT, 'public/demos', lang, f'{preset_id}.mp3')
            if os.path.exists(out):
                continue
            os.makedirs(os.path.dirname(out), exist_ok=True)
            if page.locator('#latest-take').count():
                page.locator('.topbar-actions button', has_text='Start again').click()
                page.wait_for_function("() => !document.querySelector('#latest-take')", timeout=30_000)
            if row.locator('button', has_text='Use').count():
                row.locator('button', has_text='Use').click()
                page.wait_for_function(f"() => document.querySelectorAll('.preset')[{i}].classList.contains('is-selected')", timeout=120_000)
            started = time.time()
            before = page.evaluate("() => (document.querySelector('#latest-take') ? 1 : 0) + document.querySelectorAll('.history-item').length")
            button = page.locator('.pane-foot .btn-primary')
            button.wait_for(state='visible', timeout=900_000)
            button.click()
            page.wait_for_function(f"() => ((document.querySelector('#latest-take') ? 1 : 0) + document.querySelectorAll('.history-item').length) > {before} && !document.querySelector('.pane-foot .ring')", timeout=1_800_000, polling=1000)
            with page.expect_download() as download:
                page.locator('#latest-take button[aria-label*="ownload"]').first.click()
            wav = os.path.join(tmp, 'take.wav')
            download.value.save_as(wav)
            subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', wav, '-ac', '1', '-ar', '24000', '-c:a', 'libmp3lame', '-b:a', '48k', out], check=True)
            print(f'{lang}/{preset_id}.mp3  {time.time() - started:.0f}s', flush=True)
        page.close()
    browser.close()
