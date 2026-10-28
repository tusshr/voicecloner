"""Serve the static build like Vercel's clean URLs: /about -> about.html, no directory redirects.

python3 tools/serve.py            # http://localhost:4000, serves out/
Plain `python3 -m http.server` redirects /voice-to-text to /voice-to-text/, which breaks client navigation.
"""
import http.server, os, sys

ROOT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(os.path.dirname(__file__), '..', 'out')

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs): super().__init__(*args, directory=ROOT, **kwargs)
    def send_head(self):
        path = self.path.split('?')[0].rstrip('/')
        if path and '.' not in os.path.basename(path) and os.path.isfile(os.path.join(ROOT, path.lstrip('/') + '.html')):
            self.path = path + '.html'
        return super().send_head()

http.server.ThreadingHTTPServer(('', 4000), Handler).serve_forever()
