import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router'
import { Alert } from '../../components/Alert'
import { Button } from '../../components/Button'
import { SegmentedSwitch } from '../../components/SegmentedSwitch'
import { Skeleton } from '../../components/Skeleton'
import { Spinner } from '../../components/Spinner'
import type { FeedScope } from '../../services/jobTypes'
import { JobCard } from './JobCard'
import { useJobFeed } from './useJobFeed'
import styles from './feed.module.css'

const SCOPES = [
  { value: 'all' as const, label: 'Todas as vagas' },
  { value: 'mine' as const, label: 'Minhas vagas' },
]

/** Spec 010: feed de vagas na Home, com switch Todas/Minhas e rolagem infinita de 10 em 10. */
export function Feed() {
  const [scope, setScope] = useState<FeedScope>('all') // RF-04: sempre começa em "Todas"
  const feed = useJobFeed(scope)
  const sentinel = useRef<HTMLDivElement>(null)
  const { loadMore } = feed

  // RF-08: carrega a próxima página quando o fim da lista se aproxima.
  useEffect(() => {
    const el = sentinel.current
    if (!el || typeof IntersectionObserver === 'undefined') return
    const observer = new IntersectionObserver((entries) => entries.some((e) => e.isIntersecting) && loadMore(), { rootMargin: '300px' })
    observer.observe(el)
    return () => observer.disconnect()
  }, [loadMore, feed.items.length, feed.done])

  const empty = !feed.loading && !feed.error && feed.done && feed.items.length === 0
  const firstLoad = feed.loading && feed.items.length === 0

  return (
    <div className={styles.feed}>
      <header className={styles.top}>
        <h1>Vagas</h1>
        <SegmentedSwitch label="Quais vagas exibir" options={SCOPES} value={scope} onChange={setScope} />
      </header>

      {firstLoad && (
        <div className={styles.list} aria-busy="true">
          <Skeleton height="18rem" />
          <Skeleton height="18rem" />
        </div>
      )}

      {feed.items.length > 0 && (
        <div className={styles.list}>
          {feed.items.map((job) => (
            <JobCard key={job.id} job={job} onChange={feed.updateJob} />
          ))}
        </div>
      )}

      {empty &&
        (scope === 'mine' ? (
          <div className={styles.empty}>
            <p>Você ainda não criou vagas.</p>
            <Link to="/criar">Criar uma vaga</Link>
          </div>
        ) : (
          <p className={styles.empty}>Nenhuma vaga anunciada ainda.</p>
        ))}

      {feed.error && (
        <Alert tone="danger" title="Não foi possível carregar as vagas">
          <Button variant="secondary" onClick={feed.retry}>
            Tentar novamente
          </Button>
        </Alert>
      )}

      {!feed.done && !feed.error && feed.items.length > 0 && (
        <div ref={sentinel} className={styles.more}>
          {feed.loading ? (
            <Spinner label="Carregando mais vagas" />
          ) : (
            <Button variant="ghost" onClick={loadMore}>
              Carregar mais
            </Button>
          )}
        </div>
      )}

      {feed.done && feed.items.length > 0 && <p className={styles.end}>Não há mais vagas.</p>}
    </div>
  )
}
