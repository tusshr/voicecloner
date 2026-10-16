import type { HomeContent } from './types'

// Mirrors the English STE text: short sentences, active voice, one instruction per sentence.
export const pt: HomeContent = {
  title: 'Clonar voz grátis: clone uma voz com IA no navegador',
  description: 'Clone uma voz com uma gravação de 10 segundos. Depois digite um texto e a voz fala. Grátis, sem conta e seu áudio não sai do seu dispositivo.',
  sections: [
    {
      h: 'Uma ferramenta de clonar voz que funciona no seu dispositivo',
      p: [
        'Esta ferramenta gratuita faz um clone de voz a partir de uma gravação curta. Você grava ou envia cerca de 10 segundos de fala. Depois digita um roteiro, e a ferramenta fala o roteiro com essa voz.',
        'Você pode baixar o resultado como arquivo WAV. Use em um vídeo, um podcast, o protótipo de um jogo ou uma mensagem de caixa postal.',
        'A maioria dos serviços de clonar voz envia sua gravação para um servidor. Muitos também pedem que você crie uma conta antes. Esta ferramenta não faz isso. O modelo de IA é baixado no seu navegador uma única vez. Depois, todo o trabalho acontece no seu computador ou celular. Não há conta, nem envio, nem limite de uso.',
      ],
    },
    {
      h: 'Como clonar uma voz com IA',
      steps: [
        'Adicione uma voz. Toque em Gravar e leia o texto na tela. Você também pode enviar um arquivo de áudio ou escolher uma voz de exemplo.',
        'Escreva o roteiro. Você pode digitar no máximo 700 caracteres.',
        'Toque em Continuar e depois em Gerar. A ferramenta fala seu roteiro com a voz clonada.',
        'Ouça o resultado. Se gostar, toque no botão de download para salvar um arquivo WAV.',
      ],
    },
    {
      h: 'Seu áudio fica no seu dispositivo',
      p: [
        'Uma voz é um dado pessoal. Por isso, a ferramenta não envia sua voz para nenhum servidor. A aba do navegador decodifica sua gravação, limpa o áudio e cria um perfil de voz. Seu roteiro também fica na aba. Quando você fecha a aba, o perfil de voz é apagado.',
        'Seu navegador baixa apenas os arquivos do modelo e as vozes de exemplo que você escolhe. O navegador guarda esses arquivos no cache. Assim, na próxima vez a ferramenta começa mais rápido e usa menos dados.',
      ],
    },
    {
      h: 'Como ter um clone de voz limpo',
      p: ['A qualidade do clone depende da qualidade da amostra. Siga estas instruções para fazer uma boa gravação:'],
      steps: [
        'Grave em um cômodo silencioso. Fique longe de ventiladores, do trânsito e de outras pessoas.',
        'Segure o microfone a cerca de 15 cm da boca.',
        'Fale na sua velocidade e no seu volume normais.',
        'Leia frases completas, não palavras soltas. O modelo aprende o ritmo e a entonação das frases.',
        'Não inclua música, eco nem outras vozes no clipe.',
        'Se enviar um arquivo, corte para a parte mais clara.',
      ],
    },
    {
      h: 'Emoções, pausas e velocidade',
      p: [
        'Uma amostra dá um só jeito de falar. Para ter mais variedade, grave a mesma voz de novo com outra emoção. A ferramenta tem cinco: feliz, triste, animado, calmo e sussurro.',
        'Depois coloque tags no roteiro. Por exemplo, [happy] faz o texto seguinte usar a gravação feliz. A tag [pause 1s] adiciona um segundo de silêncio. As tags [slow], [fast], [soft] e [loud] mudam a velocidade e o volume. A tag [normal] volta tudo ao padrão.',
      ],
    },
    {
      h: 'Cinco idiomas',
      p: [
        'A ferramenta fala português, inglês, espanhol, alemão e italiano. Cada idioma tem seu próprio modelo. A ferramenta escolhe o modelo pelo idioma da página. Você pode gravar uma amostra em um idioma e gerar fala em outro. Mas o resultado fica mais natural quando a amostra e o roteiro estão no mesmo idioma.',
      ],
    },
    {
      h: 'Para que você pode usar',
      p: [
        'Criadores de vídeo usam para corrigir uma frase sem gravar o take inteiro de novo. Podcasters usam para fazer um rascunho da abertura antes de gravar. Equipes de jogos e apps usam para diálogos temporários.',
        'Algumas pessoas têm uma doença que vai mudar a fala. Elas podem usar a ferramenta para guardar uma cópia da própria voz enquanto ela está clara. Outras pessoas só querem ouvir a própria voz dizer algo novo.',
      ],
    },
    {
      h: 'Use com responsabilidade',
      p: [
        'Clone apenas a sua voz ou uma voz que você tem permissão para usar. Não use uma voz clonada para se passar por outra pessoa, enganar, cometer fraude ou assediar. Em muitos países, essas ações são crime.',
        'Antes de usar suas próprias gravações, a ferramenta pede que você confirme que tem consentimento. Os termos de uso trazem as regras completas.',
      ],
    },
  ],
  faqTitle: 'Perguntas sobre clonar voz',
  faq: [
    { q: 'Quanto áudio é preciso para clonar uma voz?', a: 'Você precisa de no mínimo 5 segundos de fala. Cerca de 10 segundos de fala clara dão o melhor resultado. A ferramenta usa no máximo 20 segundos. Ela corta gravações mais longas em 20 segundos.' },
    { q: 'Como clonar minha voz com IA de graça?', a: 'Toque em Gravar e leia o texto na tela por cerca de 10 segundos. Toque em Continuar. Digite seu roteiro e toque em Gerar. A ferramenta é grátis e você não precisa de conta.' },
    { q: 'Como clonar minha voz para vídeos do YouTube?', a: 'Grave uma amostra limpa em um cômodo silencioso. Escreva a narração em partes curtas, porque cada roteiro tem no máximo 700 caracteres. Gere cada parte e baixe os arquivos WAV. Depois coloque os arquivos no seu editor de vídeo.' },
    { q: 'Como clonar uma voz para um podcast?', a: 'Siga os mesmos passos de um vídeo. Para uma abertura ou uma correção curta, gere o texto e baixe o arquivo WAV. Depois coloque o arquivo no seu editor de áudio.' },
    { q: 'A ferramenta envia minha gravação?', a: 'Não. Seu navegador processa seu áudio e seu roteiro. A ferramenta não envia nada para um servidor. O navegador baixa apenas os arquivos do modelo e as vozes de exemplo que você escolhe.' },
    { q: 'Clonar voz é legal?', a: 'Normalmente é legal clonar a própria voz ou uma voz que você tem permissão para usar. Pode ser ilegal usar uma voz sem consentimento para enganar, cometer fraude ou vender produtos. Isto não é aconselhamento jurídico. Consulte as leis do seu país.' },
    { q: 'Por que a primeira vez é lenta?', a: 'Na primeira vez, seu navegador baixa o modelo de voz. O modelo tem cerca de 150 MB. O navegador guarda o modelo no cache, então as próximas vezes começam mais rápido.' },
    { q: 'A ferramenta funciona no celular?', a: 'Sim. Use uma versão recente do Chrome, Safari, Edge ou Firefox. Celulares antigos ou com pouca memória podem ficar lentos. Um computador dá os resultados mais rápidos.' },
    { q: 'Qual modelo de IA a ferramenta usa?', a: 'A ferramenta usa o Pocket TTS, da Kyutai. É um modelo de IA aberto e pequeno que funciona em processadores comuns. As vozes de exemplo são de pessoas que publicaram suas gravações com licenças abertas.' },
  ],
}
