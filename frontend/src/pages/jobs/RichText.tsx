import { Fragment } from 'react'
import { parseBlocks, type Inline } from './markdown'
import styles from './jobs.module.css'

const renderInline = (parts: Inline[]) =>
  parts.map((p, i) =>
    p.bold ? <strong key={i}>{p.text}</strong> : p.italic ? <em key={i}>{p.text}</em> : <Fragment key={i}>{p.text}</Fragment>,
  )

/** RNF-03: monta só elementos React; nenhum HTML do texto é interpretado. */
export function RichText({ text }: { text: string }) {
  return (
    <div className={styles.rich}>
      {parseBlocks(text).map((block, i) => {
        if (block.kind === 'p')
          return (
            <p key={i}>
              {block.lines.map((line, j) => (
                <Fragment key={j}>
                  {j > 0 && <br />}
                  {renderInline(line)}
                </Fragment>
              ))}
            </p>
          )
        const List = block.kind
        return (
          <List key={i}>
            {block.items.map((item, j) => (
              <li key={j}>{renderInline(item)}</li>
            ))}
          </List>
        )
      })}
    </div>
  )
}
