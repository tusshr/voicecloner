import type { HomeContent } from '@/content/home/types'

export function HomeArticle({ content }: { content: HomeContent }) {
  return (
    <article className="article">
      {content.sections.map((section) => (
        <section key={section.h}>
          <h2>{section.h}</h2>
          {section.p?.map((text) => <p key={text}>{text}</p>)}
          {section.steps && (
            <ol>{section.steps.map((text) => <li key={text}>{text}</li>)}</ol>
          )}
        </section>
      ))}
      <section>
        <h2>{content.faqTitle}</h2>
        <div className="faq">
          {content.faq.map((item) => (
            <details key={item.q}>
              <summary>{item.q}</summary>
              <p>{item.a}</p>
            </details>
          ))}
        </div>
      </section>
    </article>
  )
}
