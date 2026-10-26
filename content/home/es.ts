import type { HomeContent } from './types'

// Mirrors the English STE text: short sentences, active voice, one instruction per sentence.
export const es: HomeContent = {
  title: 'Texto a voz y clonar voz gratis en tu navegador',
  description: 'Convierte texto en voz natural o clona una voz con una grabación de 10 segundos. Gratis, sin cuenta y tu audio se queda en tu dispositivo.',
  sections: [
    {
      h: 'Una herramienta para clonar voz que funciona en tu dispositivo',
      p: [
        'Esta herramienta gratuita hace un clon de voz con una grabación corta. Grabas o subes unos 10 segundos de habla. Luego escribes un guion y la herramienta lo dice con esa voz.',
        'Puedes descargar el resultado como archivo WAV. Úsalo en un video, un pódcast, el prototipo de un juego o un mensaje de buzón de voz.',
        'La mayoría de los servicios para clonar voz envían tu grabación a un servidor. Muchos también te piden crear una cuenta primero. Esta herramienta no hace eso. El modelo de IA se descarga en tu navegador una sola vez. Después, todo el trabajo ocurre en tu ordenador o teléfono. No hay cuenta, ni subida, ni límite de uso.',
      ],
    },
    {
      h: 'Texto a voz sin cuenta',
      p: [
        'Escribe o pega hasta 700 caracteres, elige una voz y pulsa Generar. La herramienta convierte tu texto en voz natural en inglés, español, portugués, alemán o italiano.',
        'No necesitas una grabación propia. Elige una voz de muestra, o deja la voz predeterminada, y usa la herramienta como un generador de texto a voz gratis.',
      ],
    },
    {
      h: 'Cómo clonar una voz con IA',
      steps: [
        'Añade una voz. Pulsa Grabar y lee el texto de la pantalla. También puedes subir un archivo de audio o elegir una voz de muestra.',
        'Escribe el guion. Puedes escribir un máximo de 700 caracteres.',
        'Pulsa Generar. La herramienta dice tu guion con la voz clonada.',
        'Escucha el resultado. Si te gusta, pulsa el botón de descarga para guardar un archivo WAV.',
      ],
    },
    {
      h: 'Tu audio se queda en tu dispositivo',
      p: [
        'Una voz es un dato personal. Por eso, la herramienta no envía tu voz a ningún servidor. La pestaña del navegador decodifica tu grabación, la limpia y crea un perfil de voz. Tu guion también se queda en la pestaña. Cuando cierras la pestaña, el perfil de voz se borra.',
        'Tu navegador solo descarga los archivos del modelo y las voces de muestra que eliges. El navegador guarda estos archivos en su caché. Así, la próxima vez la herramienta arranca más rápido y usa menos datos.',
      ],
    },
    {
      h: 'Cómo conseguir un clon de voz limpio',
      p: ['La calidad del clon depende de la calidad de la muestra. Sigue estas instrucciones para hacer una buena grabación:'],
      steps: [
        'Graba en una habitación silenciosa. Aléjate de ventiladores, del tráfico y de otras personas.',
        'Sostén el micrófono a unos 15 cm de la boca.',
        'Habla a tu velocidad y volumen normales.',
        'Lee frases completas, no palabras sueltas. El modelo aprende el ritmo y la entonación de las frases.',
        'No incluyas música, eco ni otras voces en el clip.',
        'Si subes un archivo, recórtalo a la parte más clara.',
      ],
    },
    {
      h: 'Estados de ánimo, pausas y velocidad',
      p: [
        'Una muestra da una sola forma de hablar. Para tener más variedad, graba la misma voz otra vez con otro estado de ánimo. La herramienta tiene cinco: alegre, triste, emocionado, tranquilo y susurro.',
        'Luego pon etiquetas en tu guion. Por ejemplo, [happy] hace que el texto siguiente use la grabación alegre. La etiqueta [pause 1s] añade un segundo de silencio. Las etiquetas [slow], [fast], [soft] y [loud] cambian la velocidad y el volumen. La etiqueta [normal] vuelve a los valores por defecto.',
      ],
    },
    {
      h: 'Cinco idiomas',
      p: [
        'La herramienta habla español, inglés, portugués, alemán e italiano. Cada idioma tiene su propio modelo. La herramienta elige el modelo según el idioma de la página. Puedes grabar una muestra en un idioma y generar voz en otro. Pero el resultado es más natural cuando la muestra y el guion están en el mismo idioma.',
      ],
    },
    {
      h: 'Para qué puedes usarla',
      p: [
        'Los creadores de video la usan para corregir una frase sin grabar de nuevo toda la toma. Los podcasters la usan para hacer un borrador de la intro antes de grabarla. Los equipos de juegos y apps la usan para diálogos temporales.',
        'Algunas personas tienen una enfermedad que cambiará su forma de hablar. Pueden usar la herramienta para guardar una copia de su voz mientras está clara. Otras personas solo quieren oír su voz decir algo nuevo.',
      ],
    },
    {
      h: 'Úsala con responsabilidad',
      p: [
        'Clona solo tu voz o una voz que tengas permiso para usar. No uses una voz clonada para hacerte pasar por otra persona, engañar, cometer fraude o acosar. En muchos países, estas acciones son ilegales.',
        'Antes de usar tus propias grabaciones, la herramienta te pide confirmar que tienes consentimiento. Las condiciones de uso dan las normas completas.',
      ],
    },
  ],
  faqTitle: 'Preguntas sobre clonar voz',
  faq: [
    { q: '¿Cuánto audio se necesita para clonar una voz?', a: 'Necesitas un mínimo de 5 segundos de habla. Unos 10 segundos de habla clara dan el mejor resultado. La herramienta usa un máximo de 20 segundos. Recorta las grabaciones más largas a 20 segundos.' },
    { q: '¿Cómo clono mi voz con IA gratis?', a: 'Pulsa Grabar y lee el texto de la pantalla durante unos 10 segundos. Escribe tu guion y pulsa Generar. La herramienta es gratis y no necesitas una cuenta.' },
    { q: '¿Cómo clono mi voz para videos de YouTube?', a: 'Graba una muestra limpia en una habitación silenciosa. Escribe tu narración en partes cortas, porque cada guion tiene un máximo de 700 caracteres. Genera cada parte y descarga los archivos WAV. Luego ponlos en tu editor de video.' },
    { q: '¿Cómo clono una voz para un pódcast?', a: 'Sigue los mismos pasos que para un video. Para una intro o una corrección corta, genera el texto y descarga el archivo WAV. Luego ponlo en tu editor de audio.' },
    { q: '¿La herramienta sube mi grabación?', a: 'No. Tu navegador procesa tu audio y tu guion. La herramienta no los envía a ningún servidor. El navegador solo descarga los archivos del modelo y las voces de muestra que eliges.' },
    { q: '¿Es legal clonar una voz?', a: 'Normalmente es legal clonar tu propia voz o una voz que tienes permiso para usar. Puede ser ilegal usar una voz sin consentimiento para engañar, cometer fraude o vender productos. Esto no es asesoramiento legal. Consulta las leyes de tu país.' },
    { q: '¿Por qué la primera vez es lenta?', a: 'La primera vez, tu navegador descarga el modelo de voz. El modelo pesa unos 150 MB. El navegador lo guarda en su caché, así que las siguientes veces arranca más rápido.' },
    { q: '¿Funciona la herramienta en el móvil?', a: 'Sí. Usa una versión reciente de Chrome, Safari, Edge o Firefox. Los teléfonos antiguos o con poca memoria pueden ir lentos. Un portátil da los resultados más rápidos.' },
    { q: '¿Qué modelo de IA usa la herramienta?', a: 'La herramienta usa Pocket TTS de Kyutai. Es un modelo de IA abierto y pequeño que funciona en procesadores normales. Las voces de muestra son de personas que publicaron sus grabaciones con licencias abiertas.' },
  ],
}
