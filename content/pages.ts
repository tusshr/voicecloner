import type { Locale } from '@/lib/i18n'

type Page = { title: string; description: string; body: string[] }
export type Chrome = {
  about: string
  contact: string
  privacy: string
  terms: string
  language: string
  credits: string
  notFoundTitle: string
  notFoundText: string
  backHome: string
  cookieText: string
  accept: string
  decline: string
  aboutPage: Page
  contactPage: Page
}

const credits = {
  en: 'Voice model: Pocket TTS from Kyutai (CC BY 4.0). Sample voices: Alba MacKenna (CC BY 4.0) and Voice-Zero readers (CC0).',
  es: 'Modelo de voz: Pocket TTS de Kyutai (CC BY 4.0). Voces de muestra: Alba MacKenna (CC BY 4.0) y lectores de Voice-Zero (CC0).',
  pt: 'Modelo de voz: Pocket TTS da Kyutai (CC BY 4.0). Vozes de exemplo: Alba MacKenna (CC BY 4.0) e leitores do Voice-Zero (CC0).',
  de: 'Sprachmodell: Pocket TTS von Kyutai (CC BY 4.0). Beispielstimmen: Alba MacKenna (CC BY 4.0) und Voice-Zero-Sprecher (CC0).',
  it: 'Modello vocale: Pocket TTS di Kyutai (CC BY 4.0). Voci di esempio: Alba MacKenna (CC BY 4.0) e lettori di Voice-Zero (CC0).',
}

export const CHROME: Record<Locale, Chrome> = {
  en: {
    about: 'About', contact: 'Contact', privacy: 'Privacy', terms: 'Terms', language: 'Language',
    credits: credits.en,
    notFoundTitle: 'Page not found',
    notFoundText: 'No page has this address. Examine the link, or go back to the voice clone tool.',
    backHome: 'Go to the voice clone tool',
    cookieText: 'We use Google Analytics to count visits. It sets cookies only if you accept. It does not record your voice.',
    accept: 'Accept', decline: 'Decline',
    aboutPage: {
      title: 'About',
      description: 'Why this free voice clone tool operates in your browser, and who made its models and voices.',
      body: [
        'Vocalis is a free voice clone tool. It does not upload your voice. The idea is simple: you must not have to send your voice to a server to clone it.',
        'All the work occurs in your browser. The AI model downloads one time. Then it learns a voice from your sample and speaks your script on your device. There are no accounts and no usage limits.',
        'An independent developer makes and maintains the tool. The tool uses open work from other people. The voice model is Pocket TTS from Kyutai (CC BY 4.0). The browser engine is adapted from pocket-tts-web by Kevin Ahm (Apache 2.0). Voice actor Alba MacKenna recorded some sample voices (CC BY 4.0). LibriVox readers from the Voice-Zero project recorded the other sample voices (CC0).',
        'Do you have a question, an idea or a problem? The contact page gives the email address.',
      ],
    },
    contactPage: {
      title: 'Contact',
      description: 'How to send a message to the team of the free voice clone tool, and how to report misuse.',
      body: [
        'Send questions, feedback and problem reports to {email}. We usually reply in a few days.',
        'Did a person use a cloned voice to act as a different person, trick people or harass people? Send a report to {legal}. Give as much detail as possible. The tool does not send recordings to our servers, so we cannot see or delete what people make. But we read all reports and we help when we can.',
        'For a problem report, tell us your browser, your device and the step where the problem occurred.',
      ],
    },
  },
  es: {
    about: 'Acerca de', contact: 'Contacto', privacy: 'Privacidad', terms: 'Condiciones', language: 'Idioma',
    credits: credits.es,
    notFoundTitle: 'Página no encontrada',
    notFoundText: 'Esta dirección no corresponde a ninguna página. Revisa el enlace o vuelve a la herramienta para clonar voz.',
    backHome: 'Ir a la herramienta para clonar voz',
    cookieText: 'Usamos Google Analytics para contar visitas. Solo usa cookies si aceptas. Tus grabaciones de voz nunca se rastrean.',
    accept: 'Aceptar', decline: 'Rechazar',
    aboutPage: {
      title: 'Acerca de',
      description: 'Por qué esta herramienta gratuita para clonar voz funciona por completo en tu navegador y quién creó sus modelos y voces.',
      body: [
        'Vocalis es una herramienta gratuita para clonar voz que funciona sin subir tu voz a ningún sitio. Nació de una idea sencilla: clonar una voz no debería exigir entregar una grabación al servidor de un desconocido.',
        'Todo funciona en tu navegador. El modelo de IA se descarga una vez, aprende una voz a partir de tu muestra y lee tu guion en tu propio dispositivo. No hay cuentas ni límites de uso.',
        'La herramienta la crea y mantiene un desarrollador independiente. No existiría sin el trabajo abierto de otros: el modelo Pocket TTS de Kyutai (CC BY 4.0), el motor para navegador adaptado de pocket-tts-web de Kevin Ahm (Apache 2.0) y las voces de muestra grabadas por la actriz de voz Alba MacKenna (CC BY 4.0) y por lectores de LibriVox reunidos por el proyecto Voice-Zero (CC0).',
        '¿Preguntas, ideas o un error que reportar? En la página de contacto está la dirección.',
      ],
    },
    contactPage: {
      title: 'Contacto',
      description: 'Cómo contactar con el equipo de la herramienta gratuita para clonar voz, incluido cómo denunciar un mal uso.',
      body: [
        'Escribe a {email} para preguntas, comentarios o errores. Solemos responder en unos días.',
        'Para denunciar una voz clonada usada para suplantar, engañar o acosar a alguien, escribe a {legal} con todos los detalles que puedas compartir. Como las grabaciones nunca llegan a nuestros servidores, no podemos ver ni eliminar lo que crea la gente, pero nos tomamos las denuncias en serio y ayudaremos en lo posible.',
        'Los informes de errores son más útiles si incluyen tu navegador, tu dispositivo y el paso en el que algo falló.',
      ],
    },
  },
  pt: {
    about: 'Sobre', contact: 'Contato', privacy: 'Privacidade', terms: 'Termos', language: 'Idioma',
    credits: credits.pt,
    notFoundTitle: 'Página não encontrada',
    notFoundText: 'Este endereço não corresponde a nenhuma página. Confira o link ou volte para a ferramenta de clonar voz.',
    backHome: 'Ir para a ferramenta de clonar voz',
    cookieText: 'Usamos o Google Analytics para contar visitas. Ele só usa cookies se você aceitar. Suas gravações de voz nunca são rastreadas.',
    accept: 'Aceitar', decline: 'Recusar',
    aboutPage: {
      title: 'Sobre',
      description: 'Por que esta ferramenta gratuita de clonar voz roda inteiramente no seu navegador e quem criou os modelos e vozes que ela usa.',
      body: [
        'Vocalis é uma ferramenta gratuita de clonar voz que funciona sem enviar sua voz para lugar nenhum. Ela nasceu de uma ideia simples: clonar uma voz não deveria exigir entregar uma gravação ao servidor de um desconhecido.',
        'Tudo roda no seu navegador. O modelo de IA é baixado uma vez, aprende uma voz a partir da sua amostra e lê seu roteiro no seu próprio dispositivo. Não há contas nem limites de uso.',
        'A ferramenta é criada e mantida por um desenvolvedor independente. Ela não existiria sem o trabalho aberto de outras pessoas: o modelo Pocket TTS da Kyutai (CC BY 4.0), o motor para navegador adaptado do pocket-tts-web de Kevin Ahm (Apache 2.0) e as vozes de exemplo gravadas pela dubladora Alba MacKenna (CC BY 4.0) e por leitores do LibriVox reunidos pelo projeto Voice-Zero (CC0).',
        'Dúvidas, ideias ou um erro para relatar? O endereço está na página de contato.',
      ],
    },
    contactPage: {
      title: 'Contato',
      description: 'Como falar com a equipe da ferramenta gratuita de clonar voz, incluindo como denunciar uso indevido.',
      body: [
        'Escreva para {email} com dúvidas, sugestões ou relatos de erro. Costumamos responder em alguns dias.',
        'Para denunciar uma voz clonada usada para se passar por alguém, enganar ou assediar, escreva para {legal} com o máximo de detalhes que puder compartilhar. Como as gravações nunca chegam aos nossos servidores, não podemos ver nem remover o que as pessoas criam, mas levamos as denúncias a sério e ajudaremos no que for possível.',
        'Relatos de erro são mais úteis quando incluem seu navegador, seu dispositivo e a etapa em que algo deu errado.',
      ],
    },
  },
  de: {
    about: 'Über uns', contact: 'Kontakt', privacy: 'Datenschutz', terms: 'Nutzungsbedingungen', language: 'Sprache',
    credits: credits.de,
    notFoundTitle: 'Seite nicht gefunden',
    notFoundText: 'Zu dieser Adresse gibt es keine Seite. Prüfe den Link oder geh zurück zum Tool zum Stimmen-Klonen.',
    backHome: 'Zum Tool zum Stimmen-Klonen',
    cookieText: 'Wir nutzen Google Analytics, um Besuche zu zählen. Cookies werden nur gesetzt, wenn du zustimmst. Deine Sprachaufnahmen werden nie erfasst.',
    accept: 'Zustimmen', decline: 'Ablehnen',
    aboutPage: {
      title: 'Über uns',
      description: 'Warum dieses kostenlose Tool zum Stimmen-Klonen komplett im Browser läuft und wer die verwendeten Modelle und Stimmen gemacht hat.',
      body: [
        'Vocalis ist ein kostenloses Tool zum Stimmen-Klonen, das funktioniert, ohne deine Stimme irgendwohin hochzuladen. Die Idee dahinter ist einfach: Wer eine Stimme klonen will, sollte dafür keine Aufnahme an den Server eines Fremden schicken müssen.',
        'Alles läuft in deinem Browser. Das KI-Modell wird einmal geladen, lernt eine Stimme aus deiner Aufnahme und spricht dein Skript auf deinem eigenen Gerät. Es gibt keine Konten und keine Nutzungslimits.',
        'Das Tool wird von einem unabhängigen Entwickler gebaut und gepflegt. Es gäbe es nicht ohne die offene Arbeit anderer: das Modell Pocket TTS von Kyutai (CC BY 4.0), die Browser-Laufzeit, angepasst aus pocket-tts-web von Kevin Ahm (Apache 2.0), und die Beispielstimmen der Sprecherin Alba MacKenna (CC BY 4.0) sowie von LibriVox-Sprechern aus dem Projekt Voice-Zero (CC0).',
        'Fragen, Ideen oder einen Fehler gefunden? Die Adresse steht auf der Kontaktseite.',
      ],
    },
    contactPage: {
      title: 'Kontakt',
      description: 'So erreichst du das Team hinter dem kostenlosen Tool zum Stimmen-Klonen, auch um Missbrauch zu melden.',
      body: [
        'Schreib an {email} für Fragen, Feedback oder Fehlerberichte. Antworten kommen meist innerhalb weniger Tage.',
        'Um eine geklonte Stimme zu melden, mit der jemand nachgeahmt, getäuscht oder belästigt wird, schreib an {legal} und nenne so viele Details wie möglich. Da Aufnahmen nie unsere Server erreichen, können wir nicht sehen oder entfernen, was Leute erstellen. Wir nehmen Meldungen aber ernst und helfen, wo wir können.',
        'Fehlerberichte helfen am meisten mit Angaben zu Browser, Gerät und dem Schritt, bei dem etwas schiefging.',
      ],
    },
  },
  it: {
    about: 'Chi siamo', contact: 'Contatti', privacy: 'Privacy', terms: 'Termini', language: 'Lingua',
    credits: credits.it,
    notFoundTitle: 'Pagina non trovata',
    notFoundText: 'Questo indirizzo non corrisponde a nessuna pagina. Controlla il link o torna allo strumento per clonare la voce.',
    backHome: 'Vai allo strumento per clonare la voce',
    cookieText: 'Usiamo Google Analytics per contare le visite. Imposta cookie solo se accetti. Le tue registrazioni vocali non vengono mai tracciate.',
    accept: 'Accetta', decline: 'Rifiuta',
    aboutPage: {
      title: 'Chi siamo',
      description: 'Perché questo strumento gratuito per clonare la voce funziona interamente nel browser e chi ha creato i modelli e le voci che usa.',
      body: [
        'Vocalis è uno strumento gratuito per clonare la voce che funziona senza caricare la tua voce da nessuna parte. È nato da un’idea semplice: clonare una voce non dovrebbe richiedere di consegnarne una registrazione al server di uno sconosciuto.',
        'Tutto funziona nel browser. Il modello di IA si scarica una volta, impara una voce dal tuo campione e legge il tuo testo sul tuo dispositivo. Non ci sono account né limiti di utilizzo.',
        'Lo strumento è creato e mantenuto da uno sviluppatore indipendente. Non esisterebbe senza il lavoro aperto di altri: il modello Pocket TTS di Kyutai (CC BY 4.0), il motore per browser adattato da pocket-tts-web di Kevin Ahm (Apache 2.0) e le voci di esempio registrate dalla doppiatrice Alba MacKenna (CC BY 4.0) e da lettori di LibriVox raccolti dal progetto Voice-Zero (CC0).',
        'Domande, idee o un errore da segnalare? L’indirizzo è nella pagina dei contatti.',
      ],
    },
    contactPage: {
      title: 'Contatti',
      description: 'Come contattare il team dello strumento gratuito per clonare la voce, anche per segnalare un uso improprio.',
      body: [
        'Scrivi a {email} per domande, feedback o segnalazioni di errori. Di solito rispondiamo entro pochi giorni.',
        'Per segnalare una voce clonata usata per impersonare, ingannare o molestare qualcuno, scrivi a {legal} con tutti i dettagli che puoi condividere. Poiché le registrazioni non raggiungono mai i nostri server, non possiamo vedere né rimuovere ciò che le persone creano, ma prendiamo sul serio le segnalazioni e aiuteremo dove possibile.',
        'Le segnalazioni di errori sono più utili se indicano browser, dispositivo e il passaggio in cui qualcosa non ha funzionato.',
      ],
    },
  },
}
