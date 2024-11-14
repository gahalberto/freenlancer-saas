import React, { ElementType } from 'react'
import {
  cilCalendar,
  cilInstitution,
  cilFile,
  cilSpeedometer,
  cilStar,
  cilUser,
  cilCenterFocus,
  cilMoney,
  cilGem,
  cilPlus,
  cilSearch,
  cilFlagAlt,
  cilExpandDown,
} from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import { CNavGroup, CNavItem, CNavTitle } from '@coreui/react-pro'
import { useSession } from 'next-auth/react'
import { getStoreCount } from './app/_actions/dashboards/getStoreCount'

export type Badge = {
  color: string
  text: string
}

export type NavItem = {
  component: string | ElementType
  name: string | JSX.Element
  icon?: string | JSX.Element
  badge?: Badge
  href?: string
  items?: NavItem[]
}

const _nav = [
  {
    component: CNavItem,
    name: 'Início',
    roleId: 1,
    icon: <CIcon icon={cilSpeedometer} customClassName="nav-icon" />,
    href: '/',
  },
  {
    component: CNavItem,
    name: 'Dashboard',
    roleId: 2,
    icon: <CIcon icon={cilSpeedometer} customClassName="nav-icon" />,
    badge: {
      color: 'info-gradient',
      text: 'NEW',
    },
    href: '/',
  },
  {
    component: CNavItem,
    name: 'Dashboard',
    roleId: 3,
    icon: <CIcon icon={cilSpeedometer} customClassName="nav-icon" />,
    badge: {
      color: 'info-gradient',
      text: 'NEW',
    },
    href: '/',
  },
  {
    component: CNavTitle,
    name: 'Admin',
    roleId: 3,
  },
  {
    component: CNavGroup,
    roleId: 3,
    name: 'Usuários',
    icon: <CIcon icon={cilUser} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Mashguichim',
        href: '/admin/users',
        icon: <CIcon icon={cilUser} customClassName="nav-icon" />,
      },
      {
        component: CNavItem,
        name: 'Estabelecimentos',
        href: '/admin/estabelecimentos',
        icon: <CIcon icon={cilInstitution} customClassName="nav-icon" />,
      },
      {
        component: CNavItem,
        name: 'Questionários',
        href: '/admin/questionarios',
        icon: <CIcon icon={cilFile} customClassName="nav-icon" />,
      },

    ],
  },
  {
    component: CNavGroup,
    name: 'Eventos & Serviços',
    icon: <CIcon icon={cilExpandDown} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Todos os eventos!',
        href: '/admin/events',
      },
      {
        component: CNavItem,
        name: 'Estabelecimentos',
        href: '/admin/estabelecimentos',
        icon: <CIcon icon={cilInstitution} customClassName="nav-icon" />,
      },
      {
        component: CNavItem,
        name: 'Questionários',
        href: '/admin/questionarios',
        icon: <CIcon icon={cilFile} customClassName="nav-icon" />,
      },

    ],
  },
  {
    component: CNavGroup,
    name: 'Cursos Online',
    roleId: 3,
    icon: <CIcon icon={cilStar} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Cursos',
        href: '/admin/courses',
      },
      {
        component: CNavItem,
        name: 'Aulas',
        href: '/cursos/aulas',
      },
      {
        component: CNavItem,
        name: 'Avaliações',
        href: '/cursos/provas',
      },
      {
        component: CNavItem,
        name: 'Questionários',
        href: '/admin/questionarios',
        icon: <CIcon icon={cilFile} customClassName="nav-icon" />,
      },

    ],
  },
  {
    component: CNavTitle,
    name: 'Cursos Online',
    roleId: [1, 2, 3]
  },
  {
    component: CNavItem,
    name: 'Cursos',
    roleId: [1, 2, 3],
    href: '/courses',
    icon: <CIcon icon={cilStar} customClassName="nav-icon" />,
  },
  {
    component: CNavTitle,
    roleId: [1, 3],
    name: 'Trabalhos Disponíveis',
  },
  {
    component: CNavItem,
    name: 'Freelancers',
    roleId: [1, 3],
    href: '/services',
    icon: <CIcon icon={cilMoney} customClassName="nav-icon" />,

  },
  {
    component: CNavTitle,
    name: 'Meus Trabalhos',
    roleId: [1, 2, 3],
  },
  {
    component: CNavItem,
    name: 'Calendário',
    roleId: [1, 2, 3],
    href: '/mashguiach/freelancers',
    icon: <CIcon icon={cilCalendar} customClassName="nav-icon" />,
  },
  {
    component: CNavTitle,
    name: 'Relatórios & Avisos',
    roleId: [1, 2, 3],
  },
  {
    component: CNavItem,
    name: 'Criar Relatório ',
    roleId: [1, 2, 3],
    href: '/relatorios/create',
    icon: <CIcon icon={cilCalendar} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Todos Relatórios ',
    roleId: [1, 2, 3],
    href: '/relatorios',
    icon: <CIcon icon={cilFlagAlt} customClassName="nav-icon" />,
  },
  {
    component: CNavTitle,
    roleId: [2, 3],
    name: 'Estabelecimentos',
  },
  {
    component: CNavItem,
    name: 'Meus Estabelecimentos',
    roleId: [2, 3],
    href: '/stores',
    icon: <CIcon icon={cilCenterFocus} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Meus Eventos',
    roleId: [2, 3],
    href: '/estabelecimento/events',
    icon: <CIcon icon={cilGem} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Criar Evento',
    roleId: [2, 3],
    href: '/estabelecimento/events/create',
    icon: <CIcon icon={cilPlus} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Buscar Mashguiach',
    roleId: [2, 3],
    href: '/theme/colors',
    icon: <CIcon icon={cilSearch} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Finalizar eventos',
    roleId: [2, 3],
    href: '/services/finalizar',
    icon: <CIcon icon={cilMoney} customClassName="nav-icon" />,
  }
]

export default _nav