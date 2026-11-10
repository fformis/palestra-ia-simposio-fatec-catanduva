import { render, screen } from '@testing-library/react'
import { expect, it } from 'vitest'
import App from './App'

it('exibe o título da aplicação', () => {
  render(<App />)
  expect(screen.getByRole('heading')).toHaveTextContent('Palestra IA')
})
