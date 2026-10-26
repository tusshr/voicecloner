import type { HomeContent } from './types'

// Mirrors the English STE text: short sentences, active voice, one instruction per sentence.
export const it: HomeContent = {
  title: 'Da testo a voce e clonare la voce gratis nel browser',
  description: 'Trasforma il testo in voce naturale o clona una voce da una registrazione di 10 secondi. Gratis, senza account, e l’audio resta sul tuo dispositivo.',
  sections: [
    {
      h: 'Uno strumento per clonare la voce che funziona sul tuo dispositivo',
      p: [
        'Questo strumento gratuito crea un clone della voce da una breve registrazione. Registri o carichi circa 10 secondi di parlato. Poi scrivi un testo e lo strumento lo legge con quella voce.',
        'Puoi scaricare il risultato come file WAV. Usalo in un video, un podcast, il prototipo di un gioco o un messaggio della segreteria.',
        'La maggior parte dei servizi per clonare la voce invia la registrazione a un server. Molti chiedono anche di creare prima un account. Questo strumento non lo fa. Il modello di IA si scarica nel browser una sola volta. Poi tutto il lavoro avviene sul tuo computer o telefono. Non c’è account, né caricamento, né limite di utilizzo.',
      ],
    },
    {
      h: 'Da testo a voce senza account',
      p: [
        'Scrivi o incolla fino a 700 caratteri, scegli una voce e tocca Genera. Lo strumento trasforma il testo in voce naturale in inglese, spagnolo, portoghese, tedesco o italiano.',
        'Non ti serve una tua registrazione. Scegli una voce di esempio, o tieni la voce predefinita, e usa lo strumento come generatore gratuito da testo a voce.',
      ],
    },
    {
      h: 'Come clonare una voce con l’IA',
      steps: [
        'Aggiungi una voce. Tocca Registra e leggi il testo sullo schermo. Puoi anche caricare un file audio o scegliere una voce di esempio.',
        'Scrivi il testo. Puoi scrivere al massimo 700 caratteri.',
        'Tocca Genera. Lo strumento legge il tuo testo con la voce clonata.',
        'Ascolta il risultato. Se ti piace, tocca il pulsante di download per salvare un file WAV.',
      ],
    },
    {
      h: 'Il tuo audio resta sul tuo dispositivo',
      p: [
        'La voce è un dato personale. Per questo lo strumento non invia la tua voce a nessun server. La scheda del browser decodifica la registrazione, la pulisce e crea un profilo vocale. Anche il tuo testo resta nella scheda. Quando chiudi la scheda, il profilo vocale viene cancellato.',
        'Il browser scarica solo i file del modello e le voci di esempio che scegli. Il browser tiene questi file nella cache. Così la volta successiva lo strumento parte più in fretta e usa meno dati.',
      ],
    },
    {
      h: 'Come ottenere un clone della voce pulito',
      p: ['La qualità del clone dipende dalla qualità del campione. Segui queste istruzioni per una buona registrazione:'],
      steps: [
        'Registra in una stanza silenziosa. Stai lontano da ventilatori, traffico e altre persone.',
        'Tieni il microfono a circa 15 cm dalla bocca.',
        'Parla alla tua velocità e al tuo volume normali.',
        'Leggi frasi intere, non parole singole. Il modello impara ritmo e intonazione dalle frasi.',
        'Non includere musica, eco o altre voci nel clip.',
        'Se carichi un file, taglialo alla parte più chiara.',
      ],
    },
    {
      h: 'Emozioni, pause e velocità',
      p: [
        'Un campione dà un solo modo di parlare. Per avere più varietà, registra la stessa voce con un’altra emozione. Lo strumento ha cinque emozioni: felice, triste, entusiasta, calmo e sussurro.',
        'Poi metti dei tag nel testo. Per esempio, [happy] fa usare la registrazione felice al testo che segue. Il tag [pause 1s] aggiunge un secondo di silenzio. I tag [slow], [fast], [soft] e [loud] cambiano velocità e volume. Il tag [normal] riporta tutto al valore predefinito.',
      ],
    },
    {
      h: 'Cinque lingue',
      p: [
        'Lo strumento parla italiano, inglese, spagnolo, portoghese e tedesco. Ogni lingua ha il proprio modello. Lo strumento sceglie il modello in base alla lingua della pagina. Puoi registrare un campione in una lingua e generare il parlato in un’altra. Ma il risultato è più naturale quando campione e testo sono nella stessa lingua.',
      ],
    },
    {
      h: 'A cosa puoi usarlo',
      p: [
        'I creator di video lo usano per correggere una frase senza registrare di nuovo tutta la ripresa. I podcaster lo usano per fare una bozza dell’intro prima di registrarla. I team di giochi e app lo usano per dialoghi temporanei.',
        'Alcune persone hanno una malattia che cambierà il loro modo di parlare. Possono usare lo strumento per conservare una copia della propria voce finché è chiara. Altre persone vogliono solo sentire la propria voce dire qualcosa di nuovo.',
      ],
    },
    {
      h: 'Usalo in modo responsabile',
      p: [
        'Clona solo la tua voce o una voce che hai il permesso di usare. Non usare una voce clonata per fingerti un’altra persona, ingannare, commettere frodi o molestare. In molti paesi queste azioni sono illegali.',
        'Prima di usare le tue registrazioni, lo strumento ti chiede di confermare il consenso. I termini d’uso contengono tutte le regole.',
      ],
    },
  ],
  faqTitle: 'Domande sulla clonazione della voce',
  faq: [
    { q: 'Quanto audio serve per clonare una voce?', a: 'Servono almeno 5 secondi di parlato. Circa 10 secondi di parlato chiaro danno il risultato migliore. Lo strumento usa al massimo 20 secondi. Taglia le registrazioni più lunghe a 20 secondi.' },
    { q: 'Come clonare la mia voce con l’IA gratis?', a: 'Tocca Registra e leggi il testo sullo schermo per circa 10 secondi. Scrivi il tuo testo e tocca Genera. Lo strumento è gratuito e non serve un account.' },
    { q: 'Come clonare la mia voce per i video di YouTube?', a: 'Registra un campione pulito in una stanza silenziosa. Scrivi la narrazione in parti brevi, perché ogni testo ha al massimo 700 caratteri. Genera ogni parte e scarica i file WAV. Poi inserisci i file nel tuo editor video.' },
    { q: 'Come clonare una voce per un podcast?', a: 'Segui gli stessi passaggi di un video. Per un’intro o una breve correzione, genera il testo e scarica il file WAV. Poi inserisci il file nel tuo editor audio.' },
    { q: 'Lo strumento carica la mia registrazione?', a: 'No. Il browser elabora il tuo audio e il tuo testo. Lo strumento non li invia a nessun server. Il browser scarica solo i file del modello e le voci di esempio che scegli.' },
    { q: 'Clonare una voce è legale?', a: 'Di solito è legale clonare la propria voce o una voce che si ha il permesso di usare. Può essere illegale usare una voce senza consenso per ingannare, commettere frodi o vendere prodotti. Questa non è una consulenza legale. Verifica le leggi del tuo paese.' },
    { q: 'Perché la prima volta è lenta?', a: 'La prima volta il browser scarica il modello vocale. Il modello pesa circa 150 MB. Il browser lo tiene nella cache, quindi le volte successive parte più in fretta.' },
    { q: 'Lo strumento funziona sul telefono?', a: 'Sì. Usa una versione recente di Chrome, Safari, Edge o Firefox. I telefoni vecchi o con poca memoria possono essere lenti. Un portatile dà i risultati più rapidi.' },
    { q: 'Quale modello di IA usa lo strumento?', a: 'Lo strumento usa Pocket TTS di Kyutai. È un modello di IA aperto e piccolo che funziona su processori comuni. Le voci di esempio sono di persone che hanno pubblicato le proprie registrazioni con licenze aperte.' },
  ],
}
