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
  roleId: string
}

const _nav = [
  {
    component: CNavItem,
    name: 'Dashboard',
    roleId: 1,
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
    roleId: 1,
  },
  {
    component: CNavGroup,
    name: 'Usuários',
    roleId: 1,
    icon: <CIcon icon={cilUser} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Mashguichim',
        href: '/admin/users',
        icon: <CIcon icon={cilUser} customClassName="nav-icon" />,
      },
      {
        roleId: 1,
        component: CNavItem,
        name: 'Estabelecimentos',
        href: '/admin/estabelecimentos',
        icon: <CIcon icon={cilInstitution} customClassName="nav-icon" />,
      },
      {
        roleId: 1,
        component: CNavItem,
        name: 'Questionários',
        href: '/admin/questionarios',
        icon: <CIcon icon={cilFile} customClassName="nav-icon" />,
      },

    ],
  },
  {
    component: CNavGroup,
    roleId: 1,
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
    roleId: 1,
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
    roleId: [1, 2]
  },
  {
    component: CNavItem,
    name: 'Cursos',
    href: '/courses',
    icon: <CIcon icon={cilStar} customClassName="nav-icon" />,
  },
  {
    component: CNavTitle,
    name: 'Trabalhos Disponíveis',
  },
  {
    component: CNavItem,
    name: 'Freelancers',
    href: '/services',
    icon: <CIcon icon={cilMoney} customClassName="nav-icon" />,
    badge: {
      color: 'success-gradient',
      text: '+4',
    },

  },
  {
    component: CNavTitle,
    name: 'Meus Trabalhos',
  },
  {
    component: CNavItem,
    name: 'Meus Freelancers',
    href: '/mashguiach/freelancers',
    icon: <CIcon icon={cilCalendar} customClassName="nav-icon" />,
  },
  {
    component: CNavTitle,
    name: 'Relatórios & Avisos',
  },
  {
    component: CNavItem,
    name: 'Criar Relatório ',
    href: '/relatorios/create',
    icon: <CIcon icon={cilCalendar} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Todos Relatórios ',
    href: '/relatorios',
    icon: <CIcon icon={cilFlagAlt} customClassName="nav-icon" />,
  },
  {
    component: CNavTitle,
    name: 'Estabelecimentos',
  },
  {
    component: CNavItem,
    name: 'Meus Estabelecimentos',
    href: '/stores',
    icon: <CIcon icon={cilCenterFocus} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Meus Eventos',
    href: '/events',
    icon: <CIcon icon={cilGem} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Criar Evento',
    href: '/estabelecimento/events/create',
    icon: <CIcon icon={cilPlus} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Buscar Mashguiach',
    href: '/theme/colors',
    icon: <CIcon icon={cilSearch} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Finalizar eventos',
    href: '/services/finalizar',
    icon: <CIcon icon={cilMoney} customClassName="nav-icon" />,
  }
]

export default _nav