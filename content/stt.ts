import type { Locale } from '@/lib/i18n'

/** Voice to text: interface text and the page content (title, article, FAQ) for each language. */
export type SttContent = {
  title: string
  description: string
  headline: string
  lede: string
  ui: {
    placeholder: string; record: string; recordMore: string; stop: string
    microphone: string; listening: string; loading: string; finishing: string; transcribing: string
    copy: string; copied: string; readAloud: string; downloadTxt: string; downloadSrt: string; moreActions: string
    words: string; transcripts: string; emptyHistory: string; justNow: string; minAgo: string; remove: string; open: string
    speechLanguage: string; noMic: string; failed: string; unsupported: string; newTranscript: string
  }
  sections: { h: string; p: string[] }[]
  faqTitle: string
  faq: { q: string; a: string }[]
}

const en: SttContent = {
  title: 'Free Voice to Text Online: Speech to Text in Your Browser',
  description: 'Free voice to text online. Speak or upload audio and get the text in seconds, in English, Spanish, Portuguese, German or Italian. Copy it or download subtitles.',
  headline: 'Free voice to text online',
  lede: 'Speak or upload a recording, and get the text in seconds. Copy it, download it as text or subtitles, or have it read aloud.',
  ui: {
    placeholder: 'Tap Record and start speaking. Your words appear here as you talk.',
    record: 'Record', recordMore: 'Record more', stop: 'Stop',
    microphone: 'Microphone', listening: 'Listening', loading: 'Loading', finishing: 'Finishing', transcribing: 'Transcribing',
    copy: 'Copy', copied: 'Copied', readAloud: 'Read aloud', downloadTxt: 'Download text (.txt)', downloadSrt: 'Download subtitles (.srt)', moreActions: 'More actions',
    words: '{n} words', transcripts: 'Your transcripts', emptyHistory: 'Your transcripts appear here.', justNow: 'Just now', minAgo: '{n} min ago', remove: 'Remove', open: 'Open',
    speechLanguage: 'Speech language',
    noMic: 'The microphone is not available. Allow it in the browser, or upload a recording.',
    failed: 'The transcription failed: {error}',
    unsupported: 'This browser cannot run the speech model. Try a recent Chrome, Edge, Firefox or Safari.',
    newTranscript: 'New transcript',
  },
  sections: [
    { h: 'Voice to text online, free and without an account', p: [
      'Push Record and talk. The words appear while you speak, and the full text is ready when you stop. You can also upload a voice note, an interview or the audio of a video.',
      'The tool understands English, Spanish, Portuguese, German and Italian. There is no sign-up and no usage limit.',
    ] },
    { h: 'A voice to text app for your phone and computer', p: [
      'The page works on phones, tablets and computers. Push Install app in the footer to open it like an app. After the first use, the speech model stays on your device, so it starts quickly.',
    ] },
    { h: 'Copy the text, download subtitles or hear it read aloud', p: [
      'Copy the transcript with one tap, download it as a text file, or download subtitles (.srt) with timings for a video editor. Read aloud sends the text to the text to voice tool, where any voice can say it.',
    ] },
    { h: 'How to get an accurate transcript', p: [
      'Speak at your usual speed, close to the microphone, in a quiet room. Select the language you speak before you start. You can correct any word in the text box after the transcription.',
    ] },
  ],
  faqTitle: 'Voice to text questions',
  faq: [
    { q: 'Is this voice to text tool free?', a: 'Yes. Voice to text is free, with no account and no limit. The speech model runs in your browser, so each transcription costs nothing.' },
    { q: 'Is there a voice to text app for my phone?', a: 'Yes. Open this page on your phone and push Install app in the footer. It then opens like an app and works on Android and iPhone.' },
    { q: 'How do I turn on voice to text on Android?', a: 'On most Android phones, tap the microphone key on the Gboard keyboard and speak. To transcribe a recording or a longer talk, use this page: it gives you text you can copy and subtitles you can download.' },
    { q: 'How do I use voice to text on an iPhone?', a: 'Turn on Dictation in Settings > General > Keyboard, then tap the microphone key on the keyboard. For recordings and longer audio, upload the file on this page instead.' },
    { q: 'How do I do voice to text in Google Docs?', a: 'In Google Docs on a computer, open Tools > Voice typing (in Chrome). For an existing recording, transcribe it here, then copy the text into your document.' },
    { q: 'Does my audio go to a server?', a: 'No. The recording and the transcription stay on your device. Only the speech model downloads, once.' },
    { q: 'Which AI model does the tool use?', a: 'Whisper base from OpenAI (MIT license), run in the browser with transformers.js.' },
  ],
}

const es: SttContent = {
  title: 'Voz a Texto Gratis Online: Transcribir Audio en el Navegador',
  description: 'Voz a texto gratis online. Habla o sube un audio y recibe el texto en segundos, en español, inglés, portugués, alemán o italiano. Cópialo o descarga subtítulos.',
  headline: 'Voz a texto gratis online',
  lede: 'Habla o sube una grabación y recibe el texto en segundos. Cópialo, descárgalo como texto o subtítulos, o haz que lo lea una voz.',
  ui: {
    placeholder: 'Pulsa Grabar y empieza a hablar. Tus palabras aparecen aquí mientras hablas.',
    record: 'Grabar', recordMore: 'Grabar más', stop: 'Parar',
    microphone: 'Micrófono', listening: 'Escuchando', loading: 'Cargando', finishing: 'Terminando', transcribing: 'Transcribiendo',
    copy: 'Copiar', copied: 'Copiado', readAloud: 'Leer en voz alta', downloadTxt: 'Descargar texto (.txt)', downloadSrt: 'Descargar subtítulos (.srt)', moreActions: 'Más acciones',
    words: '{n} palabras', transcripts: 'Tus transcripciones', emptyHistory: 'Tus transcripciones aparecen aquí.', justNow: 'Ahora mismo', minAgo: 'Hace {n} min', remove: 'Quitar', open: 'Abrir',
    speechLanguage: 'Idioma de la voz',
    noMic: 'El micrófono no está disponible. Permítelo en el navegador o sube una grabación.',
    failed: 'La transcripción falló: {error}',
    unsupported: 'Este navegador no puede ejecutar el modelo de voz. Prueba un Chrome, Edge, Firefox o Safari reciente.',
    newTranscript: 'Nueva transcripción',
  },
  sections: [
    { h: 'Voz a texto online, gratis y sin cuenta', p: [
      'Pulsa Grabar y habla. Las palabras aparecen mientras hablas y el texto completo está listo cuando paras. También puedes subir una nota de voz, una entrevista o el audio de un vídeo.',
      'La herramienta entiende español, inglés, portugués, alemán e italiano. No hay registro ni límite de uso.',
    ] },
    { h: 'Una app de voz a texto para el móvil y el ordenador', p: [
      'La página funciona en móviles, tabletas y ordenadores. Pulsa Instalar app en el pie de página para abrirla como una app. Después del primer uso, el modelo de voz se queda en tu dispositivo y arranca rápido.',
    ] },
    { h: 'Copia el texto, descarga subtítulos o escúchalo', p: [
      'Copia la transcripción con un toque, descárgala como archivo de texto o descarga subtítulos (.srt) con tiempos para un editor de vídeo. Leer en voz alta envía el texto a la herramienta de texto a voz.',
    ] },
    { h: 'Cómo conseguir una transcripción precisa', p: [
      'Habla a tu ritmo normal, cerca del micrófono y en un lugar tranquilo. Elige el idioma antes de empezar. Puedes corregir cualquier palabra en el cuadro de texto después.',
    ] },
  ],
  faqTitle: 'Preguntas sobre voz a texto',
  faq: [
    { q: '¿Esta herramienta de voz a texto es gratis?', a: 'Sí. La voz a texto es gratis, sin cuenta y sin límite. El modelo de voz funciona en tu navegador, así que cada transcripción no cuesta nada.' },
    { q: '¿Hay una app de voz a texto para el móvil?', a: 'Sí. Abre esta página en el móvil y pulsa Instalar app en el pie de página. Se abre como una app en Android y iPhone.' },
    { q: '¿Cómo activo la voz a texto en Android?', a: 'En la mayoría de los Android, toca la tecla del micrófono del teclado Gboard y habla. Para transcribir una grabación o una charla larga, usa esta página: te da texto para copiar y subtítulos para descargar.' },
    { q: '¿Cómo uso la voz a texto en el iPhone?', a: 'Activa el Dictado en Ajustes > General > Teclado y toca la tecla del micrófono del teclado. Para grabaciones y audios largos, sube el archivo en esta página.' },
    { q: '¿Cómo hago voz a texto en Google Docs?', a: 'En Google Docs en el ordenador, abre Herramientas > Escribir por voz (en Chrome). Para una grabación existente, transcríbela aquí y copia el texto en tu documento.' },
    { q: '¿Mi audio se envía a un servidor?', a: 'No. La grabación y la transcripción se quedan en tu dispositivo. Solo se descarga el modelo de voz, una vez.' },
    { q: '¿Qué modelo de IA usa la herramienta?', a: 'Whisper base de OpenAI (licencia MIT), ejecutado en el navegador con transformers.js.' },
  ],
}

const pt: SttContent = {
  title: 'Voz para Texto Grátis Online: Transcrever Áudio no Navegador',
  description: 'Voz para texto grátis online. Fale ou envie um áudio e receba o texto em segundos, em português, inglês, espanhol, alemão ou italiano. Copie ou baixe legendas.',
  headline: 'Voz para texto grátis online',
  lede: 'Fale ou envie uma gravação e receba o texto em segundos. Copie, baixe como texto ou legendas, ou ouça o texto em voz alta.',
  ui: {
    placeholder: 'Toque em Gravar e comece a falar. Suas palavras aparecem aqui enquanto você fala.',
    record: 'Gravar', recordMore: 'Gravar mais', stop: 'Parar',
    microphone: 'Microfone', listening: 'Ouvindo', loading: 'Carregando', finishing: 'Finalizando', transcribing: 'Transcrevendo',
    copy: 'Copiar', copied: 'Copiado', readAloud: 'Ler em voz alta', downloadTxt: 'Baixar texto (.txt)', downloadSrt: 'Baixar legendas (.srt)', moreActions: 'Mais ações',
    words: '{n} palavras', transcripts: 'Suas transcrições', emptyHistory: 'Suas transcrições aparecem aqui.', justNow: 'Agora mesmo', minAgo: 'Há {n} min', remove: 'Remover', open: 'Abrir',
    speechLanguage: 'Idioma da fala',
    noMic: 'O microfone não está disponível. Permita no navegador ou envie uma gravação.',
    failed: 'A transcrição falhou: {error}',
    unsupported: 'Este navegador não consegue rodar o modelo de voz. Tente um Chrome, Edge, Firefox ou Safari recente.',
    newTranscript: 'Nova transcrição',
  },
  sections: [
    { h: 'Voz para texto online, grátis e sem conta', p: [
      'Toque em Gravar e fale. As palavras aparecem enquanto você fala e o texto completo fica pronto quando você para. Você também pode enviar uma mensagem de voz, uma entrevista ou o áudio de um vídeo.',
      'A ferramenta entende português, inglês, espanhol, alemão e italiano. Não há cadastro nem limite de uso.',
    ] },
    { h: 'Um app de voz para texto para celular e computador', p: [
      'A página funciona em celulares, tablets e computadores. Toque em Instalar app no rodapé para abrir como um app. Depois do primeiro uso, o modelo de voz fica no seu dispositivo e inicia rápido.',
    ] },
    { h: 'Copie o texto, baixe legendas ou ouça em voz alta', p: [
      'Copie a transcrição com um toque, baixe como arquivo de texto ou baixe legendas (.srt) com tempos para um editor de vídeo. Ler em voz alta envia o texto para a ferramenta de texto para voz.',
    ] },
    { h: 'Como conseguir uma transcrição precisa', p: [
      'Fale no seu ritmo normal, perto do microfone e em um lugar silencioso. Escolha o idioma antes de começar. Depois, você pode corrigir qualquer palavra na caixa de texto.',
    ] },
  ],
  faqTitle: 'Perguntas sobre voz para texto',
  faq: [
    { q: 'Esta ferramenta de voz para texto é grátis?', a: 'Sim. A voz para texto é grátis, sem conta e sem limite. O modelo de voz roda no seu navegador, então cada transcrição não custa nada.' },
    { q: 'Existe um app de voz para texto para celular?', a: 'Sim. Abra esta página no celular e toque em Instalar app no rodapé. Ela abre como um app no Android e no iPhone.' },
    { q: 'Como ativo a voz para texto no Android?', a: 'Na maioria dos Android, toque na tecla do microfone do teclado Gboard e fale. Para transcrever uma gravação ou uma fala longa, use esta página: ela dá um texto para copiar e legendas para baixar.' },
    { q: 'Como uso voz para texto no iPhone?', a: 'Ative o Ditado em Ajustes > Geral > Teclado e toque na tecla do microfone do teclado. Para gravações e áudios longos, envie o arquivo nesta página.' },
    { q: 'Como fazer voz para texto no Google Docs?', a: 'No Google Docs no computador, abra Ferramentas > Digitação por voz (no Chrome). Para uma gravação existente, transcreva aqui e copie o texto para o documento.' },
    { q: 'Meu áudio vai para um servidor?', a: 'Não. A gravação e a transcrição ficam no seu dispositivo. Só o modelo de voz é baixado, uma vez.' },
    { q: 'Qual modelo de IA a ferramenta usa?', a: 'Whisper base da OpenAI (licença MIT), rodando no navegador com transformers.js.' },
  ],
}

const de: SttContent = {
  title: 'Sprache zu Text kostenlos: Audio online transkribieren',
  description: 'Sprache kostenlos in Text umwandeln. Sprich oder lade Audio hoch und erhalte den Text in Sekunden. Kopieren oder als Untertitel herunterladen.',
  headline: 'Sprache zu Text kostenlos online',
  lede: 'Sprich oder lade eine Aufnahme hoch und erhalte den Text in Sekunden. Kopiere ihn, lade ihn als Text oder Untertitel herunter oder lass ihn vorlesen.',
  ui: {
    placeholder: 'Tippe auf Aufnehmen und sprich los. Deine Wörter erscheinen hier, während du sprichst.',
    record: 'Aufnehmen', recordMore: 'Weiter aufnehmen', stop: 'Stopp',
    microphone: 'Mikrofon', listening: 'Hört zu', loading: 'Lädt', finishing: 'Wird fertig', transcribing: 'Transkribiert',
    copy: 'Kopieren', copied: 'Kopiert', readAloud: 'Vorlesen', downloadTxt: 'Text herunterladen (.txt)', downloadSrt: 'Untertitel herunterladen (.srt)', moreActions: 'Weitere Aktionen',
    words: '{n} Wörter', transcripts: 'Deine Transkripte', emptyHistory: 'Deine Transkripte erscheinen hier.', justNow: 'Gerade eben', minAgo: 'Vor {n} Min.', remove: 'Entfernen', open: 'Öffnen',
    speechLanguage: 'Sprache der Aufnahme',
    noMic: 'Das Mikrofon ist nicht verfügbar. Erlaube es im Browser oder lade eine Aufnahme hoch.',
    failed: 'Die Transkription ist fehlgeschlagen: {error}',
    unsupported: 'Dieser Browser kann das Sprachmodell nicht ausführen. Versuche ein aktuelles Chrome, Edge, Firefox oder Safari.',
    newTranscript: 'Neues Transkript',
  },
  sections: [
    { h: 'Sprache in Text umwandeln, kostenlos und ohne Konto', p: [
      'Tippe auf Aufnehmen und sprich. Die Wörter erscheinen, während du sprichst, und der ganze Text ist fertig, wenn du stoppst. Du kannst auch eine Sprachnachricht, ein Interview oder den Ton eines Videos hochladen.',
      'Das Tool versteht Deutsch, Englisch, Spanisch, Portugiesisch und Italienisch. Ohne Anmeldung und ohne Limit.',
    ] },
    { h: 'Eine Sprache-zu-Text-App für Handy und Computer', p: [
      'Die Seite funktioniert auf Handys, Tablets und Computern. Tippe in der Fußzeile auf App installieren, um sie wie eine App zu öffnen. Nach dem ersten Mal bleibt das Sprachmodell auf deinem Gerät.',
    ] },
    { h: 'Text kopieren, Untertitel laden oder vorlesen lassen', p: [
      'Kopiere das Transkript mit einem Tippen, lade es als Textdatei oder als Untertitel (.srt) mit Zeiten für ein Videoprogramm herunter. Vorlesen schickt den Text an das Tool Text zu Sprache.',
    ] },
    { h: 'So wird das Transkript genau', p: [
      'Sprich in deinem normalen Tempo, nah am Mikrofon und in einem ruhigen Raum. Wähle vorher die Sprache. Danach kannst du jedes Wort im Textfeld korrigieren.',
    ] },
  ],
  faqTitle: 'Fragen zu Sprache zu Text',
  faq: [
    { q: 'Ist dieses Sprache-zu-Text-Tool kostenlos?', a: 'Ja. Sprache zu Text ist kostenlos, ohne Konto und ohne Limit. Das Sprachmodell läuft in deinem Browser, deshalb kostet jedes Transkript nichts.' },
    { q: 'Gibt es eine Sprache-zu-Text-App fürs Handy?', a: 'Ja. Öffne diese Seite auf dem Handy und tippe in der Fußzeile auf App installieren. Sie öffnet sich dann wie eine App, auf Android und iPhone.' },
    { q: 'Wie schalte ich Sprache zu Text auf Android ein?', a: 'Auf den meisten Android-Handys tippst du auf der Gboard-Tastatur auf die Mikrofontaste und sprichst. Für Aufnahmen oder längere Reden nutze diese Seite: Sie gibt dir Text zum Kopieren und Untertitel zum Herunterladen.' },
    { q: 'Wie nutze ich Sprache zu Text auf dem iPhone?', a: 'Aktiviere das Diktieren unter Einstellungen > Allgemein > Tastatur und tippe auf der Tastatur auf die Mikrofontaste. Für Aufnahmen und lange Audios lade die Datei auf dieser Seite hoch.' },
    { q: 'Wie geht Sprache zu Text in Google Docs?', a: 'Öffne in Google Docs am Computer Tools > Spracheingabe (in Chrome). Für eine vorhandene Aufnahme transkribiere sie hier und kopiere den Text in dein Dokument.' },
    { q: 'Geht mein Audio an einen Server?', a: 'Nein. Aufnahme und Transkript bleiben auf deinem Gerät. Nur das Sprachmodell wird einmal geladen.' },
    { q: 'Welches KI-Modell nutzt das Tool?', a: 'Whisper base von OpenAI (MIT-Lizenz), im Browser mit transformers.js.' },
  ],
}

const it: SttContent = {
  title: 'Da Voce a Testo Gratis Online: Trascrivere Audio nel Browser',
  description: 'Da voce a testo gratis online. Parla o carica un audio e ricevi il testo in pochi secondi, in italiano, inglese e altre lingue. Copialo o scarica i sottotitoli.',
  headline: 'Da voce a testo gratis online',
  lede: 'Parla o carica una registrazione e ricevi il testo in pochi secondi. Copialo, scaricalo come testo o sottotitoli, o fallo leggere ad alta voce.',
  ui: {
    placeholder: 'Tocca Registra e inizia a parlare. Le tue parole appaiono qui mentre parli.',
    record: 'Registra', recordMore: 'Registra ancora', stop: 'Stop',
    microphone: 'Microfono', listening: 'In ascolto', loading: 'Caricamento', finishing: 'Quasi fatto', transcribing: 'Trascrizione',
    copy: 'Copia', copied: 'Copiato', readAloud: 'Leggi ad alta voce', downloadTxt: 'Scarica testo (.txt)', downloadSrt: 'Scarica sottotitoli (.srt)', moreActions: 'Altre azioni',
    words: '{n} parole', transcripts: 'Le tue trascrizioni', emptyHistory: 'Le tue trascrizioni appaiono qui.', justNow: 'Proprio ora', minAgo: '{n} min fa', remove: 'Rimuovi', open: 'Apri',
    speechLanguage: 'Lingua del parlato',
    noMic: 'Il microfono non è disponibile. Consentilo nel browser o carica una registrazione.',
    failed: 'La trascrizione non è riuscita: {error}',
    unsupported: 'Questo browser non può eseguire il modello vocale. Prova un Chrome, Edge, Firefox o Safari recente.',
    newTranscript: 'Nuova trascrizione',
  },
  sections: [
    { h: 'Da voce a testo online, gratis e senza account', p: [
      'Tocca Registra e parla. Le parole appaiono mentre parli e il testo completo è pronto quando ti fermi. Puoi anche caricare un messaggio vocale, un’intervista o l’audio di un video.',
      'Lo strumento capisce italiano, inglese, spagnolo, portoghese e tedesco. Senza registrazione e senza limiti.',
    ] },
    { h: 'Un’app da voce a testo per telefono e computer', p: [
      'La pagina funziona su telefoni, tablet e computer. Tocca Installa app nel piè di pagina per aprirla come un’app. Dopo il primo utilizzo il modello vocale resta sul dispositivo e parte subito.',
    ] },
    { h: 'Copia il testo, scarica i sottotitoli o ascoltalo', p: [
      'Copia la trascrizione con un tocco, scaricala come file di testo o scarica i sottotitoli (.srt) con i tempi per un editor video. Leggi ad alta voce invia il testo allo strumento da testo a voce.',
    ] },
    { h: 'Come ottenere una trascrizione precisa', p: [
      'Parla al tuo ritmo normale, vicino al microfono e in un posto tranquillo. Scegli la lingua prima di iniziare. Poi puoi correggere qualsiasi parola nel riquadro di testo.',
    ] },
  ],
  faqTitle: 'Domande su voce a testo',
  faq: [
    { q: 'Questo strumento da voce a testo è gratis?', a: 'Sì. La trascrizione è gratis, senza account e senza limiti. Il modello vocale funziona nel browser, quindi ogni trascrizione non costa nulla.' },
    { q: 'Esiste un’app da voce a testo per il telefono?', a: 'Sì. Apri questa pagina sul telefono e tocca Installa app nel piè di pagina. Si apre come un’app su Android e iPhone.' },
    { q: 'Come attivo la dettatura vocale su Android?', a: 'Sulla maggior parte dei telefoni Android tocca il tasto del microfono sulla tastiera Gboard e parla. Per trascrivere una registrazione o un discorso lungo usa questa pagina: ti dà testo da copiare e sottotitoli da scaricare.' },
    { q: 'Come uso la dettatura su iPhone?', a: 'Attiva la Dettatura in Impostazioni > Generali > Tastiera e tocca il tasto del microfono sulla tastiera. Per registrazioni e audio lunghi carica il file in questa pagina.' },
    { q: 'Come si fa la dettatura vocale in Google Docs?', a: 'In Google Docs sul computer apri Strumenti > Digitazione vocale (in Chrome). Per una registrazione esistente trascrivila qui e copia il testo nel documento.' },
    { q: 'Il mio audio va su un server?', a: 'No. La registrazione e la trascrizione restano sul tuo dispositivo. Si scarica solo il modello vocale, una volta.' },
    { q: 'Quale modello di IA usa lo strumento?', a: 'Whisper base di OpenAI (licenza MIT), eseguito nel browser con transformers.js.' },
  ],
}

export const STT: Record<Locale, SttContent> = { en, es, pt, de, it }
