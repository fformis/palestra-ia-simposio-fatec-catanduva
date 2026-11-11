import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it, vi } from 'vitest'
import { Button } from './Button'
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
