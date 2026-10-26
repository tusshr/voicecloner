import type { HomeContent } from './types'

// Mirrors the English STE text: short sentences, active voice, one instruction per sentence.
export const de: HomeContent = {
  title: 'Text zu Sprache und Stimme klonen, kostenlos im Browser',
  description: 'Wandle Text in natürliche Sprache um oder klone eine Stimme aus einer 10-Sekunden-Aufnahme. Kostenlos, ohne Konto, und dein Audio bleibt auf deinem Gerät.',
  sections: [
    {
      h: 'Ein Tool zum Stimmen-Klonen, das auf deinem Gerät läuft',
      p: [
        'Dieses kostenlose Tool macht aus einer kurzen Aufnahme einen Stimmklon. Du nimmst etwa 10 Sekunden Sprache auf oder lädst sie hoch. Dann tippst du ein Skript, und das Tool spricht es mit dieser Stimme.',
        'Du kannst das Ergebnis als WAV-Datei herunterladen. Nutze es in einem Video, einem Podcast, einem Spielprototyp oder einer Mailbox-Ansage.',
        'Die meisten Dienste zum Stimmen-Klonen senden deine Aufnahme an einen Server. Viele verlangen auch zuerst ein Konto. Dieses Tool macht das nicht. Das KI-Modell wird einmal in deinen Browser geladen. Danach passiert alles auf deinem Computer oder Smartphone. Es gibt kein Konto, keinen Upload und kein Nutzungslimit.',
      ],
    },
    {
      h: 'Text zu Sprache ohne Konto',
      p: [
        'Gib bis zu 700 Zeichen ein, wähle eine Stimme und tippe auf Erzeugen. Das Tool macht aus deinem Text natürliche Sprache auf Englisch, Spanisch, Portugiesisch, Deutsch oder Italienisch.',
        'Du brauchst keine eigene Aufnahme. Wähle eine Beispielstimme oder behalte die Standardstimme und nutze das Tool als kostenlosen Text-zu-Sprache-Generator.',
      ],
    },
    {
      h: 'So klonst du eine Stimme mit KI',
      steps: [
        'Füge eine Stimme hinzu. Tippe auf Aufnehmen und lies den Text auf dem Bildschirm vor. Du kannst auch eine Audiodatei hochladen oder eine Beispielstimme wählen.',
        'Schreib das Skript. Du kannst höchstens 700 Zeichen eingeben.',
        'Tippe auf Erzeugen. Das Tool spricht dein Skript mit der geklonten Stimme.',
        'Hör dir das Ergebnis an. Wenn es dir gefällt, tippe auf den Download-Knopf und speichere eine WAV-Datei.',
      ],
    },
    {
      h: 'Dein Audio bleibt auf deinem Gerät',
      p: [
        'Eine Stimme ist ein persönliches Datum. Deshalb sendet das Tool deine Stimme an keinen Server. Der Browser-Tab dekodiert deine Aufnahme, bereinigt sie und erstellt ein Stimmprofil. Auch dein Skript bleibt im Tab. Wenn du den Tab schließt, wird das Stimmprofil gelöscht.',
        'Dein Browser lädt nur die Modelldateien und die Beispielstimmen, die du wählst. Der Browser speichert diese Dateien im Cache. So startet das Tool beim nächsten Mal schneller und braucht weniger Daten.',
      ],
    },
    {
      h: 'So bekommst du einen sauberen Stimmklon',
      p: ['Die Qualität des Klons hängt von der Qualität der Aufnahme ab. Folge diesen Anweisungen für eine gute Aufnahme:'],
      steps: [
        'Nimm in einem ruhigen Raum auf. Halte Abstand zu Ventilatoren, Verkehr und anderen Menschen.',
        'Halte das Mikrofon etwa 15 cm von deinem Mund entfernt.',
        'Sprich in deinem normalen Tempo und deiner normalen Lautstärke.',
        'Lies ganze Sätze, keine einzelnen Wörter. Das Modell lernt Rhythmus und Betonung aus Sätzen.',
        'Nimm keine Musik, keinen Hall und keine anderen Stimmen auf.',
        'Wenn du eine Datei hochlädst, schneide sie auf den klarsten Teil zu.',
      ],
    },
    {
      h: 'Stimmungen, Pausen und Tempo',
      p: [
        'Eine Aufnahme gibt eine Sprechweise. Für mehr Ausdruck nimmst du dieselbe Stimme in einer anderen Stimmung auf. Das Tool hat fünf Stimmungen: fröhlich, traurig, aufgeregt, ruhig und flüsternd.',
        'Dann setzt du Tags in dein Skript. Zum Beispiel lässt [happy] den folgenden Text die fröhliche Aufnahme nutzen. Das Tag [pause 1s] fügt eine Sekunde Stille ein. Die Tags [slow], [fast], [soft] und [loud] ändern Tempo und Lautstärke. Das Tag [normal] setzt alles auf den Standard zurück.',
      ],
    },
    {
      h: 'Fünf Sprachen',
      p: [
        'Das Tool spricht Deutsch, Englisch, Spanisch, Portugiesisch und Italienisch. Jede Sprache hat ihr eigenes Modell. Das Tool wählt das Modell nach der Sprache der Seite. Du kannst eine Aufnahme in einer Sprache machen und Sprache in einer anderen erzeugen. Das Ergebnis klingt aber natürlicher, wenn Aufnahme und Skript dieselbe Sprache haben.',
      ],
    },
    {
      h: 'Wofür du es nutzen kannst',
      p: [
        'Video-Creator korrigieren damit einen Satz, ohne den ganzen Take neu aufzunehmen. Podcaster erstellen damit einen Entwurf für ihr Intro, bevor sie es aufnehmen. Spiele- und App-Teams nutzen es für vorläufige Dialoge.',
        'Manche Menschen haben eine Krankheit, die ihre Sprache verändern wird. Sie können mit dem Tool eine Kopie ihrer Stimme sichern, solange sie klar ist. Andere wollen nur hören, wie ihre Stimme etwas Neues sagt.',
      ],
    },
    {
      h: 'Verantwortungsvoll nutzen',
      p: [
        'Klone nur deine eigene Stimme oder eine Stimme, für die du eine Erlaubnis hast. Nutze eine geklonte Stimme nicht, um dich als andere Person auszugeben, um zu täuschen, zu betrügen oder zu belästigen. In vielen Ländern ist das strafbar.',
        'Bevor das Tool deine eigenen Aufnahmen nutzt, bittet es dich, die Einwilligung zu bestätigen. Die Nutzungsbedingungen enthalten alle Regeln.',
      ],
    },
  ],
  faqTitle: 'Fragen zum Stimmen-Klonen',
  faq: [
    { q: 'Wie viel Audio braucht man, um eine Stimme zu klonen?', a: 'Du brauchst mindestens 5 Sekunden Sprache. Etwa 10 Sekunden klare Sprache geben das beste Ergebnis. Das Tool nutzt höchstens 20 Sekunden. Längere Aufnahmen kürzt es auf 20 Sekunden.' },
    { q: 'Wie klone ich meine Stimme kostenlos mit KI?', a: 'Tippe auf Aufnehmen und lies etwa 10 Sekunden lang den Text auf dem Bildschirm vor. Schreib dein Skript und tippe auf Erzeugen. Das Tool ist kostenlos und du brauchst kein Konto.' },
    { q: 'Wie klone ich meine Stimme für YouTube-Videos?', a: 'Nimm in einem ruhigen Raum eine saubere Probe auf. Schreib deinen Sprechertext in kurzen Teilen, denn jedes Skript hat höchstens 700 Zeichen. Erzeuge jeden Teil und lade die WAV-Dateien herunter. Dann füge die Dateien in deinen Videoeditor ein.' },
    { q: 'Wie klone ich eine Stimme für einen Podcast?', a: 'Folge denselben Schritten wie bei einem Video. Für ein Intro oder eine kurze Korrektur erzeugst du den Text und lädst die WAV-Datei herunter. Dann fügst du die Datei in deinen Audioeditor ein.' },
    { q: 'Lädt das Tool meine Aufnahme hoch?', a: 'Nein. Dein Browser verarbeitet dein Audio und dein Skript. Das Tool sendet nichts an einen Server. Der Browser lädt nur die Modelldateien und die Beispielstimmen, die du wählst.' },
    { q: 'Ist Stimmen-Klonen legal?', a: 'Die eigene Stimme oder eine Stimme mit Erlaubnis zu klonen, ist meist legal. Es kann illegal sein, eine Stimme ohne Einwilligung zu nutzen, um zu täuschen, zu betrügen oder Produkte zu verkaufen. Dies ist keine Rechtsberatung. Prüfe die Gesetze in deinem Land.' },
    { q: 'Warum ist der erste Durchlauf langsam?', a: 'Beim ersten Mal lädt dein Browser das Sprachmodell herunter. Das Modell ist etwa 150 MB groß. Der Browser speichert es im Cache, deshalb starten spätere Durchläufe schneller.' },
    { q: 'Funktioniert das Tool auf dem Smartphone?', a: 'Ja. Nutze eine aktuelle Version von Chrome, Safari, Edge oder Firefox. Alte Smartphones und Geräte mit wenig Speicher können langsam sein. Ein Laptop gibt die schnellsten Ergebnisse.' },
    { q: 'Welches KI-Modell nutzt das Tool?', a: 'Das Tool nutzt Pocket TTS von Kyutai. Es ist ein kleines, offenes KI-Modell, das auf normalen Prozessoren läuft. Die Beispielstimmen stammen von Sprechern, die ihre Aufnahmen unter offenen Lizenzen veröffentlicht haben.' },
  ],
}
