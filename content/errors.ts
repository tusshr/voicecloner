import type { Locale } from '@/lib/i18n'

/** Error screens. Client code imports this, so keep it small. */
export const ERRORS: Record<Locale, { title: string; text: string; tryAgain: string; home: string }> = {
  en: {
    title: 'An error occurred',
    text: 'The page has an error. The tool did not upload your recordings, so you did not lose data on a server. Try again, or load the page again.',
    tryAgain: 'Try again', home: 'Home',
  },
  es: {
    title: 'Algo salió mal',
    text: 'La página tuvo un error. Tus grabaciones nunca se subieron, así que no se perdió nada en nuestro lado. Inténtalo de nuevo o recarga la página.',
    tryAgain: 'Intentar de nuevo', home: 'Inicio',
  },
  pt: {
    title: 'Algo deu errado',
    text: 'A página encontrou um erro. Suas gravações nunca foram enviadas, então nada se perdeu do nosso lado. Tente de novo ou recarregue a página.',
    tryAgain: 'Tentar de novo', home: 'Início',
  },
  de: {
    title: 'Etwas ist schiefgelaufen',
    text: 'Auf der Seite ist ein Fehler aufgetreten. Deine Aufnahmen wurden nie hochgeladen, bei uns ist also nichts verloren gegangen. Versuch es erneut oder lade die Seite neu.',
    tryAgain: 'Erneut versuchen', home: 'Start',
  },
  it: {
    title: 'Qualcosa è andato storto',
    text: 'La pagina ha riscontrato un errore. Le tue registrazioni non sono mai state caricate, quindi da parte nostra non si è perso nulla. Riprova o ricarica la pagina.',
    tryAgain: 'Riprova', home: 'Home',
  },
}
