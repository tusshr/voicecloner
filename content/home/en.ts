import type { HomeContent } from './types'

// Written to ASD-STE100 rules: short sentences, active voice, one instruction per sentence.
export const en: HomeContent = {
  title: 'Free Voice Clone: Clone a Voice with AI in Your Browser',
  description: 'Clone a voice from a 10-second recording. Then type text and the voice speaks it. Free, no account, and your audio stays on your device.',
  sections: [
    {
      h: 'A voice clone tool that works on your device',
      p: [
        'This free tool makes a voice clone from a short recording. You record or upload approximately 10 seconds of speech. Then you type a script, and the tool speaks the script in that voice.',
        'You can download the result as a WAV file. Use it in a video, a podcast, a game prototype or a voicemail message.',
        'Most voice clone services send your recording to a server. Many of them also tell you to make an account first. This tool does not do this. The AI model downloads into your browser one time. After that, all the work occurs on your computer or phone. There is no account, no upload and no usage limit.',
      ],
    },
    {
      h: 'How to clone a voice with AI',
      steps: [
        'Add a voice. Push Record and read the text on the screen. You can also upload an audio file or select a sample voice.',
        'Write the script. You can type a maximum of 700 characters.',
        'Push Continue, then push Generate. The tool speaks your script in the cloned voice.',
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
        'Then put tags in your script. For example, [happy] makes the text after it use the happy recording. The tag [pause 1s] adds one second of silence. The tags [slow], [fast], [soft] and [loud] change speed and volume. The tag [normal] sets all of these back to the default.',
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
  faqTitle: 'Voice clone questions',
  faq: [
    {
      q: 'How much audio is needed to clone a voice?',
      a: 'You need a minimum of 5 seconds of speech. Approximately 10 seconds of clear speech gives the best result. The tool uses a maximum of 20 seconds. It cuts longer recordings to 20 seconds.',
    },
    {
      q: 'How do I clone my voice with AI for free?',
      a: 'Push Record and read the text on the screen for approximately 10 seconds. Push Continue. Type your script and push Generate. The tool is free and you do not need an account.',
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
