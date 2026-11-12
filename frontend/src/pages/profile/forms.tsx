import { useState, type FormEvent, type ReactNode } from 'react'
import { Alert } from '../../components/Alert'
import { Button } from '../../components/Button'
import { THIS_YEAR } from '../../components/helpers'
import { MonthYearField } from '../../components/MonthYearField'
import { Select } from '../../components/Select'
import { TextArea } from '../../components/TextArea'
import { TextField } from '../../components/TextField'
import { profileService } from '../../services/profileService'
import type { Course, Education, EducationLevel, Occupation } from '../../services/profileTypes'
import { LEVELS, serverFieldErrors, validatePeriod, type FieldErrors } from './format'
import type { ItemFormProps } from './TimelineSection'
import styles from './profile.module.css'

const END_HELP = 'Deixe em branco se ainda estiver em andamento.'
const FUTURE_YEARS = 10

/** Estado comum dos formulários de item: valida no cliente, salva e mostra os erros do servidor junto ao campo. */
function useItemForm(validate: () => FieldErrors, save: () => Promise<unknown>, onSaved: () => void) {
  const [errors, setErrors] = useState<FieldErrors>({})
  const [failed, setFailed] = useState(false)
  const [loading, setLoading] = useState(false)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    const next = validate()
    setErrors(next)
    setFailed(false)
    if (Object.keys(next).length > 0) return

    setLoading(true)
    try {
      await save()
      onSaved()
    } catch (error) {
      const fields = serverFieldErrors(error)
      if (fields) setErrors(fields)
      else setFailed(true)
    } finally {
      setLoading(false)
    }
  }
  return { errors, failed, loading, submit }
}

function FormShell(props: { label: string; state: ReturnType<typeof useItemForm>; onCancel: () => void; children: ReactNode }) {
  const { label, state, onCancel, children } = props
  return (
    <form className={styles.form} onSubmit={state.submit} noValidate aria-label={label}>
      {state.failed && (
        <Alert tone="danger" title="Não foi possível salvar">
          Tente novamente em instantes.
        </Alert>
      )}
      {children}
      <div className={styles.actions}>
        <Button type="submit" loading={state.loading}>
          Salvar
        </Button>
        <Button variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </form>
  )
}

function PeriodFields(props: { start: string; end: string; errors: FieldErrors; onChange: (key: 'start' | 'end', value: string) => void }) {
  const { start, end, errors, onChange } = props
  return (
    <div className={styles.cols}>
      <MonthYearField label="Início" value={start} onChange={(v) => onChange('start', v)} error={errors.start} />
      <MonthYearField
        label="Término"
        value={end}
        onChange={(v) => onChange('end', v)}
        maxYear={THIS_YEAR + FUTURE_YEARS}
        error={errors.end}
        help={END_HELP}
      />
    </div>
  )
}

const required = (errors: FieldErrors, values: Record<string, string>, fields: Record<string, string>) => {
  for (const [field, message] of Object.entries(fields)) if (!values[field].trim()) errors[field] = message
}

export function OccupationForm({ item, onSaved, onCancel }: ItemFormProps<Occupation>) {
  const [v, setV] = useState({
    title: item?.title ?? '',
    company: item?.company ?? '',
    start: item?.start ?? '',
    end: item?.end ?? '',
    description: item?.description ?? '',
  })
  const set = (key: keyof typeof v, value: string) => setV((prev) => ({ ...prev, [key]: value }))

  const state = useItemForm(
    () => {
      const errors: FieldErrors = {}
      required(errors, v, { title: 'Informe o cargo.', company: 'Informe a empresa.' })
      validatePeriod(v.start, v.end, errors)
      return errors
    },
    () =>
      profileService.saveOccupation(
        { title: v.title.trim(), company: v.company.trim(), start: v.start, end: v.end || null, description: v.description.trim() || null },
        item?.id,
      ),
    onSaved,
  )

  return (
    <FormShell label={item ? 'Editar ocupação' : 'Nova ocupação'} state={state} onCancel={onCancel}>
      <div className={styles.cols}>
        <TextField label="Cargo" maxLength={150} value={v.title} onChange={(e) => set('title', e.target.value)} error={state.errors.title} />
        <TextField label="Empresa" maxLength={150} value={v.company} onChange={(e) => set('company', e.target.value)} error={state.errors.company} />
      </div>
      <PeriodFields start={v.start} end={v.end} errors={state.errors} onChange={set} />
      <TextArea
        label="Descrição (opcional)"
        maxLength={1000}
        value={v.description}
        onChange={(e) => set('description', e.target.value)}
        error={state.errors.description}
      />
    </FormShell>
  )
}

export function EducationForm({ item, onSaved, onCancel }: ItemFormProps<Education>) {
  const [v, setV] = useState({
    institution: item?.institution ?? '',
    course: item?.course ?? '',
    level: item?.level ?? '',
    start: item?.start ?? '',
    end: item?.end ?? '',
    description: item?.description ?? '',
  })
  const set = (key: keyof typeof v, value: string) => setV((prev) => ({ ...prev, [key]: value }))

  const state = useItemForm(
    () => {
      const errors: FieldErrors = {}
      required(errors, v, { institution: 'Informe a instituição.', course: 'Informe o curso ou a área.', level: 'Escolha o nível.' })
      validatePeriod(v.start, v.end, errors)
      return errors
    },
    () =>
      profileService.saveEducation(
        {
          institution: v.institution.trim(),
          course: v.course.trim(),
          level: v.level as EducationLevel,
          start: v.start,
          end: v.end || null,
          description: v.description.trim() || null,
        },
        item?.id,
      ),
    onSaved,
  )

  return (
    <FormShell label={item ? 'Editar formação' : 'Nova formação'} state={state} onCancel={onCancel}>
      <div className={styles.cols}>
        <TextField
          label="Instituição"
          maxLength={150}
          value={v.institution}
          onChange={(e) => set('institution', e.target.value)}
          error={state.errors.institution}
        />
        <TextField label="Curso/área" maxLength={150} value={v.course} onChange={(e) => set('course', e.target.value)} error={state.errors.course} />
      </div>
      <Select label="Nível de formação" value={v.level} onChange={(e) => set('level', e.target.value)} error={state.errors.level}>
        <option value="">Selecione</option>
        {Object.entries(LEVELS).map(([code, name]) => (
          <option key={code} value={code}>
            {name}
          </option>
        ))}
      </Select>
      <PeriodFields start={v.start} end={v.end} errors={state.errors} onChange={set} />
      <TextArea
        label="Descrição (opcional)"
        maxLength={1000}
        value={v.description}
        onChange={(e) => set('description', e.target.value)}
        error={state.errors.description}
      />
    </FormShell>
  )
}

export function CourseForm({ item, onSaved, onCancel }: ItemFormProps<Course>) {
  const [v, setV] = useState({
    name: item?.name ?? '',
    institution: item?.institution ?? '',
    hours: item ? String(item.hours) : '',
    start: item?.start ?? '',
    end: item?.end ?? '',
  })
  const set = (key: keyof typeof v, value: string) => setV((prev) => ({ ...prev, [key]: value }))

  const state = useItemForm(
    () => {
      const errors: FieldErrors = {}
      required(errors, v, { name: 'Informe o curso.', institution: 'Informe a instituição.' })
      if (!/^\d{1,5}$/.test(v.hours.trim()) || Number(v.hours) < 1) errors.hours = 'Informe a carga horária em horas (número inteiro maior que zero).'
      validatePeriod(v.start, v.end, errors)
      return errors
    },
    () =>
      profileService.saveCourse(
        { name: v.name.trim(), institution: v.institution.trim(), hours: Number(v.hours), start: v.start, end: v.end || null },
        item?.id,
      ),
    onSaved,
  )

  return (
    <FormShell label={item ? 'Editar curso' : 'Novo curso'} state={state} onCancel={onCancel}>
      <div className={styles.cols}>
        <TextField label="Curso" maxLength={150} value={v.name} onChange={(e) => set('name', e.target.value)} error={state.errors.name} />
        <TextField
          label="Instituição"
          maxLength={150}
          value={v.institution}
          onChange={(e) => set('institution', e.target.value)}
          error={state.errors.institution}
        />
      </div>
      <TextField
        label="Quantidade de horas"
        inputMode="numeric"
        value={v.hours}
        onChange={(e) => set('hours', e.target.value)}
        error={state.errors.hours}
      />
      <PeriodFields start={v.start} end={v.end} errors={state.errors} onChange={set} />
    </FormShell>
  )
}
