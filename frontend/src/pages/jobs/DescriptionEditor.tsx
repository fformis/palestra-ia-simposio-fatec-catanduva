import { useRef } from 'react'
import { Button } from '../../components/Button'
import { TextArea } from '../../components/TextArea'
import { MAX_DESCRIPTION } from './format'
import { RichText } from './RichText'
import { visibleLength } from './markdown'
import styles from './jobs.module.css'

interface DescriptionEditorProps {
  value: string
  onChange: (value: string) => void
  error?: string
}

/** RF-03: descrição com negrito, itálico e listas; o contador considera só o texto visível. */
export function DescriptionEditor({ value, onChange, error }: DescriptionEditorProps) {
  const ref = useRef<HTMLTextAreaElement>(null)
  const remaining = MAX_DESCRIPTION - visibleLength(value)

  /** Envolve a seleção com o marcador (negrito/itálico). */
  const wrap = (marker: string) => {
    const el = ref.current
    const [start, end] = el ? [el.selectionStart, el.selectionEnd] : [value.length, value.length]
    const selected = value.slice(start, end) || 'texto'
    onChange(value.slice(0, start) + marker + selected + marker + value.slice(end))
  }

  /** Prefixa as linhas selecionadas (ou a atual) com o marcador de lista. */
  const list = (ordered: boolean) => {
    const el = ref.current
    const [start, end] = el ? [el.selectionStart, el.selectionEnd] : [value.length, value.length]
    const lineStart = value.lastIndexOf('\n', start - 1) + 1
    const lines = value.slice(lineStart, end).split('\n')
    const prefixed = lines.map((l, i) => `${ordered ? `${i + 1}. ` : '- '}${l}`).join('\n')
    onChange(value.slice(0, lineStart) + prefixed + value.slice(end))
  }

  return (
    <div className={styles.editor}>
      <div className={styles.toolbar} role="toolbar" aria-label="Formatação da descrição">
        <Button variant="ghost" aria-label="Negrito" onClick={() => wrap('**')}>
          <strong>N</strong>
        </Button>
        <Button variant="ghost" aria-label="Itálico" onClick={() => wrap('*')}>
          <em>I</em>
        </Button>
        <Button variant="ghost" aria-label="Lista" onClick={() => list(false)}>
          • Lista
        </Button>
        <Button variant="ghost" aria-label="Lista numerada" onClick={() => list(true)}>
          1. Lista
        </Button>
      </div>
      <TextArea
        ref={ref}
        label="Descrição"
        rows={6}
        required
        value={value}
        onChange={(e) => onChange(e.target.value)}
        error={error}
        help="Use os botões para negrito, itálico e listas."
      />
      <p className={remaining < 0 ? styles.counterOver : styles.counter} aria-live="polite">
        {remaining} caracteres restantes
      </p>
      {value.trim() && (
        <div className={styles.preview}>
          <span className={styles.previewLabel}>Pré-visualização</span>
          <RichText text={value} />
        </div>
      )}
    </div>
  )
}
