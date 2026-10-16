export type HomeSection = { h: string; p?: string[]; steps?: string[] }
export type HomeContent = {
  title: string
  description: string
  sections: HomeSection[]
  faqTitle: string
  faq: { q: string; a: string }[]
}
