import type { HomeContent } from './types'

// Written to ASD-STE100 rules: short sentences, active voice, one instruction per sentence.
export const en: HomeContent = {
  title: 'Free Text to Voice Generator & AI Voice Clone Online',
  description: 'Free AI text to voice generator and voice cloning online. Type text, pick a voice or clone yours from 10 seconds of audio, then download it. No sign-up.',
  sections: [
    {
      h: 'Free AI text to voice generator',
      p: [
        'Type or paste up to 700 characters, select a voice and push Generate. The tool turns your text into natural speech in English, Spanish, Portuguese, German or Italian.',
        'You do not need your own recording. Select a sample voice, or keep the default voice, and use the tool as a free text to speech generator.',
        'It also works as a text to voice app: install it from the footer, and it opens like an app on your phone or computer.',
      ],
    },
    {
      h: 'Free AI voice clone from 10 seconds of audio',
      p: [
        'This free tool makes a voice clone from a short recording. You record or upload approximately 10 seconds of speech. Then you type a script, and the tool speaks the script in that voice.',
        'You can download the result as a WAV file. Use it in a video, a podcast, a game prototype or a voicemail message.',
        'Most voice clone services send your recording to a server. Many of them also tell you to make an account first. This tool does not do this. The AI model downloads into your browser one time. After that, all the work occurs on your computer or phone. There is no account, no upload and no usage limit.',
      ],
    },
    {
      h: 'How to clone your voice with AI for free',
      steps: [
        'Add a voice. Push Record and read the text on the screen. You can also upload an audio file or select a sample voice.',
        'Write the script. You can type a maximum of 700 characters.',
        'Push Generate. The tool speaks your script in the cloned voice.',
        'Listen to the result. If you like it, push the download button to save a WAV file.',
      ],
    },
    {
      h: 'Your audio stays on your device',
      p: [
        'A voice is personal data. For this reason, the tool does not send your voice to a server. The browser tab decodes your recording, cleans it and makes a voice profile from it. Your script also stays in the tab. When you close the tab, the voice profile is deleted.',
        'Your browser downloads only the model files and the sample voices that you select. The browser keeps these files in its cache. Thus, the next time you use the tool, it starts more quickly and uses less data.',
      ],
    },
    {
      h: 'How to get a clean voice clone',
      p: [
        'The quality of the clone depends on the quality of the sample. Use these instructions to make a good recording:',
      ],
      steps: [
        'Record in a quiet room. Stay away from fans, traffic and other people.',
        'Hold the microphone approximately 15 cm (6 in) from your mouth.',
        'Speak at your usual speed and volume.',
        'Read full sentences, not single words. The model learns rhythm and intonation from sentences.',
        'Do not include music, echo or other voices in the clip.',
        'If you upload a file, cut it to the clearest part.',
      ],
    },
    {
      h: 'Moods, pauses and speed',
      p: [
        'One sample gives one way of speaking. To get more range, record the same voice again in a different mood. The tool has five moods: happy, sad, excited, calm and whisper.',
        'Then mark text with an effect. For example, [😊: Great news!] says those words with the happy recording. Typing [happy: …] also works and turns into the emoji. [slow: …], [fast: …], [soft: …] and [loud: …] change the speed and volume of the text inside, and [pause 1s] adds one second of silence. Select text and tap an effect to wrap it.',
      ],
    },
    {
      h: 'Five languages',
      p: [
        'The tool speaks English, Spanish, Portuguese, German and Italian. Each language has its own model. The tool selects the model from the language of the page. You can record a sample in one language and generate speech in a different language. But the result is more natural when the sample and the script use the same language.',
      ],
    },
    {
      h: 'What you can use it for',
      p: [
        'Video creators use it to correct one bad line without a new recording of the full take. Podcasters use it to make a draft of an intro before they record it. Game and app teams use it for temporary dialogue.',
        'Some people have a medical condition that will change their speech. They can use the tool to keep a copy of their voice while it is clear. Other people only want to hear their voice say something new.',
      ],
    },
    {
      h: 'Use it responsibly',
      p: [
        'Clone only your voice, or a voice that you have permission to use. Do not use a cloned voice to act as a different person, trick people, commit fraud or harass people. In many countries, these actions are illegal.',
        'Before the tool uses your own recordings, it asks you to confirm that you have consent. The terms of use give the full rules.',
      ],
    },
  ],
  faqTitle: 'Text to voice and voice clone questions',
  faq: [
    {
      q: 'Is this text to voice generator free?',
      a: 'Yes. Text to voice and voice cloning are free, with no account and no usage limit. The AI runs in your browser, so the tool costs nothing to run per generation.',
    },
    {
      q: 'Is there a text to voice app for my phone?',
      a: 'Yes. Open the site on your phone and push Install app in the footer. The tool then opens like an app, and the voice model stays on your phone after the first run.',
    },
    {
      q: 'How do I clone someone else’s voice with AI?',
      a: 'Only with their permission. Ask the person to record approximately 10 seconds of clear speech, or to send you a recording. Then upload it under My voice and confirm that you have consent.',
    },
    {
      q: 'How much audio is needed to clone a voice?',
      a: 'You need a minimum of 5 seconds of speech. Approximately 10 seconds of clear speech gives the best result. The tool uses a maximum of 20 seconds. It cuts longer recordings to 20 seconds.',
    },
    {
      q: 'How do I clone my voice with AI for free?',
      a: 'Push Record and read the text on the screen for approximately 10 seconds. Type your script and push Generate. The tool is free and you do not need an account.',
    },
    {
      q: 'How do I clone my voice for YouTube videos?',
      a: 'Record a clean sample in a quiet room. Write your narration in short parts, because each script has a maximum of 700 characters. Generate each part and download the WAV files. Then put the files in your video editor.',
    },
    {
      q: 'How do I clone a voice for a podcast?',
      a: 'Use the same steps as for a video. For a podcast intro or a short correction, generate the text and download the WAV file. Then put the file into your audio editor.',
    },
    {
      q: 'Does the tool upload my recording?',
      a: 'No. Your browser processes your audio and your script. The tool does not send them to a server. The browser downloads only the model files and the sample voices that you select.',
    },
    {
      q: 'Is voice cloning legal?',
      a: 'It is usually legal to clone your own voice, or a voice that you have permission to use. It can be illegal to use a voice without consent to trick people, commit fraud or sell products. This is not legal advice. Examine the laws in your country.',
    },
    {
      q: 'Why is the first run slow?',
      a: 'At the first run, your browser downloads the voice model. The model is approximately 150 MB. The browser keeps the model in its cache, so the next runs start more quickly.',
    },
    {
      q: 'Does the tool work on a phone?',
      a: 'Yes. Use a recent version of Chrome, Safari, Edge or Firefox. Old phones and phones with little memory can be slow. A laptop gives the fastest results.',
    },
    {
      q: 'Which AI model does the tool use?',
      a: 'The tool uses Pocket TTS from Kyutai. It is a small, open AI model that operates on usual computer processors. The sample voices are from speakers who gave their recordings with open licenses.',
    },
  ],
}
