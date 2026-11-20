import type { ComponentType } from 'react'
import { HomeIcon, PlusIcon } from '../components/icons'

export interface NavItem {
  to: string
  label: string
  icon: ComponentType
}

// Novas features adicionam seus itens aqui.
export const navItems: NavItem[] = [
  { to: '/', label: 'Home', icon: HomeIcon },
  { to: '/criar', label: 'Criar', icon: PlusIcon },
]
