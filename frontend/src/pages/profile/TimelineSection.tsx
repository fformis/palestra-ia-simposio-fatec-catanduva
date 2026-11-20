import { useId, useState, type ReactNode } from 'react'
import { Alert } from '../../components/Alert'
import { Button } from '../../components/Button'
import { Card } from '../../components/Card'
import { PencilIcon, PlusIcon, TrashIcon } from '../../components/icons'
import type { YearMonth } from '../../services/profileTypes'
import { formatPeriod } from './format'
import styles from './profile.module.css'

export interface TimelineEntry {
  id: string
  start: YearMonth
  end: YearMonth | null
}

/** O que a linha do tempo mostra de cada item. */
export interface TimelineView {
  title: string
  subtitle: string
  description?: string | null
}

export interface ItemFormProps<T> {
  /** Item em edição; ausente ao adicionar. */
  item?: T
  onSaved: () => void
  onCancel: () => void
}

interface TimelineSectionProps<T extends TimelineEntry> {
  title: string
  /** Nome do item no singular, usado em rótulos (ex.: "ocupação"). */
  itemName: string
  emptyText: string
  /** Itens já na ordem de exibição (mais recente primeiro). */
  items: T[]
  view: (item: T) => TimelineView
  /** Somente leitura (spec 009, perfil do candidato): sem adicionar, editar nem remover. */
  readOnly?: boolean
  form?: (props: ItemFormProps<T>) => ReactNode
  remove?: (id: string) => Promise<unknown>
  /** Chamado após salvar ou remover, para recarregar o perfil. */
  onChanged?: () => Promise<unknown> | void
}

/** Seção do perfil em linha do tempo, com adicionar, editar e remover (confirmação inline). */
export function TimelineSection<T extends TimelineEntry>(props: TimelineSectionProps<T>) {
  const { title, itemName, emptyText, items, view, form, remove, onChanged, readOnly = false } = props
  const editable = !readOnly && form !== undefined && remove !== undefined
  const headingId = useId()
  const [editing, setEditing] = useState<string | 'new' | null>(null)
  const [confirming, setConfirming] = useState<string | null>(null)
  const [removing, setRemoving] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)
  const [failed, setFailed] = useState(false)

  const done = async (message: string) => {
    setEditing(null)
    setConfirming(null)
    setNotice(message)
    await onChanged?.()
  }

  const confirmRemove = async (id: string) => {
    setRemoving(true)
    setFailed(false)
    try {
      await remove?.(id)
      await done('Item removido.')
    } catch {
      setFailed(true)
    } finally {
      setRemoving(false)
    }
  }

  const start = (target: string | 'new') => {
    setNotice(null)
    setFailed(false)
    setConfirming(null)
    setEditing(target)
  }

  return (
    <Card className={styles.card}>
      <section aria-labelledby={headingId}>
        <div className={styles.sectionHead}>
          <h2 id={headingId}>{title}</h2>
          {editable && editing !== 'new' && (
            <Button variant="secondary" onClick={() => start('new')}>
              <PlusIcon /> Adicionar {itemName}
            </Button>
          )}
        </div>

        {notice && (
          <p className={styles.notice} role="status">
            {notice}
          </p>
        )}
        {failed && (
          <Alert tone="danger" title="Não foi possível remover">
            Tente novamente em instantes.
          </Alert>
        )}

        {editing === 'new' && (
          <div className={styles.editing}>{form?.({ onSaved: () => done('Item salvo.'), onCancel: () => setEditing(null) })}</div>
        )}

        {items.length === 0 && editing !== 'new' && <p className={styles.empty}>{emptyText}</p>}

        {items.length > 0 && (
          <ol className={styles.timeline} style={editing === 'new' ? { marginTop: 'var(--space-5)' } : undefined}>
            {items.map((item) => {
              const v = view(item)
              return (
                <li key={item.id} className={item.end ? styles.item : `${styles.item} ${styles.current}`}>
                  {editing === item.id ? (
                    <div className={styles.editing}>
                      {form?.({ item, onSaved: () => done('Item salvo.'), onCancel: () => setEditing(null) })}
                    </div>
                  ) : (
                    <>
                      <div className={styles.itemHead}>
                        <div className={styles.itemText}>
                          <h3 className={styles.itemTitle}>{v.title}</h3>
                          <p className={styles.itemSub}>{v.subtitle}</p>
                          <p className={styles.period}>{formatPeriod(item.start, item.end)}</p>
                        </div>
                        {editable && (
                        <div className={styles.actions}>
                          <Button variant="ghost" className={styles.iconBtn} aria-label={`Editar ${v.title}`} onClick={() => start(item.id)}>
                            <PencilIcon />
                          </Button>
                          <Button
                            variant="ghost"
                            className={styles.iconBtn}
                            aria-label={`Remover ${v.title}`}
                            onClick={() => {
                              setNotice(null)
                              setConfirming(item.id)
                            }}
                          >
                            <TrashIcon />
                          </Button>
                        </div>
                        )}
                      </div>
                      {v.description && <p className={styles.description}>{v.description}</p>}
                      {confirming === item.id && (
                        <div className={styles.confirm} role="group" aria-label={`Confirmar remoção de ${v.title}`}>
                          <span>Remover {itemName}?</span>
                          <Button loading={removing} onClick={() => confirmRemove(item.id)}>
                            Confirmar
                          </Button>
                          <Button variant="ghost" onClick={() => setConfirming(null)}>
                            Cancelar
                          </Button>
                        </div>
                      )}
                    </>
                  )}
                </li>
              )
            })}
          </ol>
        )}
      </section>
    </Card>
  )
}
