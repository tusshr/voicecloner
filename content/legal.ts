// English only. Written to ASD-STE100 rules. Placeholders: {site}, {email}, {legal}, {updated}
export type LegalDoc = { title: string; description: string; intro: string; sections: { h: string; p: string[] }[] }

export const PRIVACY: LegalDoc = {
  title: 'Privacy policy',
  description: 'What the free voice clone tool collects, what it does not collect, and the choices that you have.',
  intro: 'Last update: {updated}. This policy tells you how {site} uses information. In summary: your voice recordings and scripts do not leave your device.',
  sections: [
    {
      h: 'Your recordings and scripts',
      p: [
        'Your browser processes the audio that you record, upload or select. It also processes your script. The tool does not send them to our servers or to other persons. We cannot see, keep or recover them. When you close the tab or load it again, they are deleted.',
        'Your browser saves the files that you download, for example WAV files, on your device.',
      ],
    },
    {
      h: 'Model files and sample voices',
      p: [
        'Your browser downloads the voice model, its engine and the sample voices from Hugging Face and from the jsDelivr network. These services get your IP address and browser data when your browser asks for the files. Their privacy policies apply.',
        'Your browser keeps these files in its cache. Thus, it does not download them again. To delete them, clear the site data in your browser.',
      ],
    },
    {
      h: 'Analytics and cookies',
      p: [
        'If analytics are on, we use Google Analytics. It counts visits and shows which pages and languages people use. Google Analytics sets cookies only after you push Accept. If you push Decline, it sets no analytics cookies. Your browser keeps your choice, so we do not ask again.',
        'Google Analytics does not get your recordings, your scripts or the audio that you make.',
      ],
    },
    {
      h: 'Hosting',
      p: [
        'Our hosting company keeps usual server logs. These logs include IP addresses, pages and times. The company uses them to supply the site and to protect it from attacks. It keeps the logs for a limited time.',
      ],
    },
    {
      h: 'Email',
      p: [
        'If you send us an email, we get your address and your message. We use them only to reply. We delete messages when we do not need them.',
      ],
    },
    {
      h: 'Children',
      p: [
        'The tool is not for children who are younger than 13. We do not collect information from them on purpose.',
      ],
    },
    {
      h: 'Your rights',
      p: [
        'The law in your country can give you rights over your personal data. For example, you can ask to see, correct or delete it. We do not keep your recordings. Thus, most requests are about analytics or email. Send your request to {email}. We reply in the time that the law gives.',
      ],
    },
    {
      h: 'Changes',
      p: ['If we change this policy, we change the date at the top of this page.'],
    },
  ],
}

export const TERMS: LegalDoc = {
  title: 'Terms of use',
  description: 'The rules for the free voice clone tool, including consent and prohibited uses.',
  intro: 'Last update: {updated}. When you use {site}, you agree to these terms. If you do not agree, do not use the tool.',
  sections: [
    {
      h: 'Consent',
      p: [
        'Clone only your voice, or a voice that you have permission to use. Before you use a recording of a different person, get their agreement. They must agree to the clone and to how you will use it.',
      ],
    },
    {
      h: 'Prohibited uses',
      p: [
        'Do not use the tool or its audio for these purposes:',
        'To act as a real person without their consent.',
        'To trick or defraud people, for example with scam calls or false endorsements.',
        'To harass, threaten or defame a person.',
        'To make sexual content with the voice of a real person without their consent.',
        'To give false information about elections or public persons.',
        'For a different action that is illegal in your country or in the country of the person that it affects.',
      ],
    },
    {
      h: 'Your responsibility',
      p: [
        'You are responsible for the recordings that you supply, the scripts that you write and the audio that you use. All the work occurs on your device. Thus, we cannot see or control what you make.',
      ],
    },
    {
      h: 'Licenses from other persons',
      p: [
        'The tool uses the Pocket TTS model from Kyutai (CC BY 4.0). It uses browser code adapted from pocket-tts-web (Apache 2.0). The sample voices have the CC BY 4.0 license (Alba MacKenna) or the CC0 license (Voice-Zero).',
        'If you publish audio that you made with a CC BY 4.0 sample voice, you must give credit to the speaker.',
      ],
    },
    {
      h: 'No warranty',
      p: [
        'The tool is free and we supply it "as is". The result changes with your device and your recording. The tool can stop or change at any time. We do not guarantee that it is correct for a specified purpose.',
      ],
    },
    {
      h: 'Limit of liability',
      p: [
        'As far as the law permits, we are not liable for indirect losses. We are also not liable for losses that come from how people use audio from the tool.',
      ],
    },
    {
      h: 'Report misuse',
      p: ['Do you think that a person uses a cloned voice to cause harm? Send an email to {legal}.'],
    },
    {
      h: 'Changes',
      p: ['We can change these terms. The date at the top shows the latest version. When you continue to use the tool, you agree to the new version.'],
    },
  ],
}
