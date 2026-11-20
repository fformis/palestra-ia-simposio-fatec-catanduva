import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it, vi } from 'vitest'
import { Button } from './Button'
import { SegmentedSwitch } from './SegmentedSwitch'
import { TextField } from './TextField'

it('botão desabilitado não dispara clique', async () => {
  const onClick = vi.fn()
  render(<Button disabled onClick={onClick}>Salvar</Button>)
  await userEvent.click(screen.getByRole('button', { name: 'Salvar' }))
  expect(onClick).not.toHaveBeenCalled()
})

it('botão em carregamento exibe indicador', () => {
  render(<Button loading>Salvar</Button>)
  expect(screen.getByRole('status', { name: 'Carregando' })).toBeInTheDocument()
})

it('campo com erro associa rótulo e mensagem', () => {
  render(<TextField label="Nome" error="Obrigatório" />)
  expect(screen.getByLabelText('Nome')).toHaveAccessibleDescription('Obrigatório')
})

it('switch troca a opção por clique e pelas setas', async () => {
  const onChange = vi.fn()
  const options = [
    { value: 'all', label: 'Todas as vagas' },
    { value: 'mine', label: 'Minhas vagas' },
  ]
  render(<SegmentedSwitch label="Visão" options={options} value="all" onChange={onChange} />)
  await userEvent.click(screen.getByRole('radio', { name: 'Minhas vagas' }))
  screen.getByRole('radio', { name: 'Todas as vagas' }).focus()
  await userEvent.keyboard('{ArrowRight}')
  expect(onChange.mock.calls).toEqual([['mine'], ['mine']])
})
