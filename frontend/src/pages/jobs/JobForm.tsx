import { useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import { Alert } from '../../components/Alert'
import { Button } from '../../components/Button'
import { CameraIcon, TrashIcon } from '../../components/icons'
import { Select } from '../../components/Select'
import { TextField } from '../../components/TextField'
import { ApiError } from '../../services/api'
import { jobService } from '../../services/jobService'
import type { Benefit, ContractType, Job, JobInput, JobStatus } from '../../services/jobTypes'
import { DescriptionEditor } from './DescriptionEditor'
import { BENEFITS, CONTRACTS, IMAGE_TYPES, MAX_IMAGE_BYTES, MAX_DESCRIPTION, MAX_TITLE, MESSAGES } from './format'
import { visibleLength } from './markdown'
import styles from './jobs.module.css'

const INVALID_IMAGE = 'Envie uma imagem JPG, PNG ou WebP.'
const IMAGE_TOO_LARGE = 'A imagem deve ter no máximo 2 MB.'

type Errors = Record<string, string>

interface JobFormProps {
  /** Vaga em edição; ausente ao criar. */
  job?: Job
  submitLabel: string
  /** Chamado após salvar; `warning` avisa se a imagem não pôde ser gravada. */
  onSaved: (job: Job, warning?: string) => void
  onCancel?: () => void
}

/** RF-03 a RF-05 e RF-08: campos da vaga, validação local e erros do servidor junto ao campo. */
export function JobForm({ job, submitLabel, onSaved, onCancel }: JobFormProps) {
  const [title, setTitle] = useState(job?.title ?? '')
  const [company, setCompany] = useState(job?.company ?? '')
  const [description, setDescription] = useState(job?.description ?? '')
  const [benefits, setBenefits] = useState<Benefit[]>(job?.benefits ?? [])
  const [contractType, setContractType] = useState<ContractType | ''>(job?.contractType ?? '')
  const [salary, setSalary] = useState(job ? String(job.salary) : '')
  const [status, setStatus] = useState<JobStatus>(job?.status ?? 'active')

  const fileInput = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(job?.imageVersion ? jobService.imageUrl(job.id, job.imageVersion) : null)
  const [imageRemoved, setImageRemoved] = useState(false)

  const [errors, setErrors] = useState<Errors>({})
  const [failed, setFailed] = useState(false)
  const [saving, setSaving] = useState(false)

  const pickImage = (e: ChangeEvent<HTMLInputElement>) => {
    const picked = e.target.files?.[0]
    e.target.value = ''
    if (!picked) return
    // RF-04: recusa antes de enviar.
    if (!IMAGE_TYPES.includes(picked.type)) return setErrors((x) => ({ ...x, image: INVALID_IMAGE }))
    if (picked.size > MAX_IMAGE_BYTES) return setErrors((x) => ({ ...x, image: IMAGE_TOO_LARGE }))
    setErrors((x) => Object.fromEntries(Object.entries(x).filter(([k]) => k !== 'image')))
    setFile(picked)
    setPreview(URL.createObjectURL(picked))
    setImageRemoved(false)
  }

  const removeImage = () => {
    setFile(null)
    setPreview(null)
    setImageRemoved(true)
  }

  const toggleBenefit = (b: Benefit) => setBenefits((list) => (list.includes(b) ? list.filter((x) => x !== b) : [...list, b]))

  const validate = (): Errors => {
    const e: Errors = {}
    if (!title.trim()) e.title = MESSAGES.required
    else if (title.trim().length > MAX_TITLE) e.title = `Máximo de ${MAX_TITLE} caracteres.`
    if (!description.trim()) e.description = MESSAGES.required
    else if (visibleLength(description) > MAX_DESCRIPTION) e.description = `Máximo de ${MAX_DESCRIPTION} caracteres visíveis.`
    if (!contractType) e.contractType = 'Escolha o regime de contratação.'
    const value = Number(salary)
    if (!salary.trim()) e.salary = MESSAGES.required
    else if (!Number.isFinite(value) || value <= 0) e.salary = 'Informe um valor maior que zero.'
    return e
  }

  const submit = async (ev: FormEvent) => {
    ev.preventDefault()
    setFailed(false)
    const local = validate()
    setErrors(local)
    if (Object.keys(local).length > 0) return

    const input: JobInput = {
      title: title.trim(),
      company: company.trim() || null,
      description: description.trim(),
      benefits,
      contractType: contractType as ContractType,
      salary: Number(salary),
      status,
    }

    setSaving(true)
    try {
      let saved = job ? await jobService.update(job.id, input) : await jobService.create(input)
      let warning: string | undefined
      try {
        if (file) saved = { ...saved, imageVersion: (await jobService.uploadImage(saved.id, file)).imageVersion }
        else if (imageRemoved && job?.imageVersion) {
          await jobService.removeImage(saved.id)
          saved = { ...saved, imageVersion: null }
        }
      } catch {
        warning = 'A vaga foi salva, mas a imagem não pôde ser gravada.'
      }
      onSaved(saved, warning)
    } catch (e) {
      if (e instanceof ApiError && e.fields)
        setErrors(Object.fromEntries(Object.entries(e.fields).map(([k, code]) => [k, MESSAGES[code] ?? MESSAGES.invalid])))
      else setFailed(true)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form className={styles.form} onSubmit={submit} noValidate>
      <TextField
        label="Cargo"
        required
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        error={errors.title}
        help={`${MAX_TITLE - title.trim().length} caracteres restantes`}
      />
      <TextField label="Empresa (opcional)" value={company} onChange={(e) => setCompany(e.target.value)} error={errors.company} />

      <div className={styles.imageField}>
        <span className={styles.fieldLabel}>Imagem (opcional)</span>
        <img className={styles.imagePreview} src={preview ?? '/vaga-padrao.svg'} alt={preview ? 'Pré-visualização da imagem da vaga' : ''} />
        <input
          ref={fileInput}
          type="file"
          className={styles.hidden}
          accept={IMAGE_TYPES.join(',')}
          aria-label="Arquivo da imagem da vaga"
          tabIndex={-1}
          onChange={pickImage}
        />
        <div className={styles.actions}>
          <Button variant="secondary" onClick={() => fileInput.current?.click()}>
            <CameraIcon /> {preview ? 'Trocar imagem' : 'Escolher imagem'}
          </Button>
          {preview && (
            <Button variant="ghost" onClick={removeImage}>
              <TrashIcon /> Remover imagem
            </Button>
          )}
        </div>
        <p className={styles.hint}>JPG, PNG ou WebP, até 2 MB.</p>
        {errors.image && <Alert tone="danger" title={errors.image} />}
      </div>

      <DescriptionEditor value={description} onChange={setDescription} error={errors.description} />

      <fieldset className={styles.fieldset}>
        <legend className={styles.fieldLabel}>Benefícios</legend>
        <div className={styles.checks}>
          {(Object.keys(BENEFITS) as Benefit[]).map((b) => (
            <label key={b} className={styles.check}>
              <input type="checkbox" checked={benefits.includes(b)} onChange={() => toggleBenefit(b)} /> {BENEFITS[b]}
            </label>
          ))}
        </div>
      </fieldset>

      <div className={styles.cols}>
        <Select
          label="Regime de contratação"
          required
          value={contractType}
          onChange={(e) => setContractType(e.target.value as ContractType)}
          error={errors.contractType}
        >
          <option value="">Selecione…</option>
          {(Object.keys(CONTRACTS) as ContractType[]).map((c) => (
            <option key={c} value={c}>
              {CONTRACTS[c]}
            </option>
          ))}
        </Select>
        <TextField
          label="Valor mensal (R$)"
          required
          type="number"
          inputMode="decimal"
          min="0.01"
          step="0.01"
          value={salary}
          onChange={(e) => setSalary(e.target.value)}
          error={errors.salary}
          help="Valor único, por mês."
        />
        <Select label="Status do anúncio" value={status} onChange={(e) => setStatus(e.target.value as JobStatus)}>
          <option value="active">Ativo</option>
          <option value="inactive">Inativo</option>
        </Select>
      </div>

      {failed && (
        <Alert tone="danger" title="Não foi possível salvar a vaga">
          Tente novamente em instantes.
        </Alert>
      )}

      <div className={styles.actions}>
        <Button type="submit" loading={saving}>
          {submitLabel}
        </Button>
        {onCancel && (
          <Button variant="ghost" onClick={onCancel}>
            Cancelar
          </Button>
        )}
      </div>
    </form>
  )
}
