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
  cilDiamond,
  cilClearAll,
  cilCircle,
} from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import { CNavGroup, CNavItem, CNavTitle } from '@coreui/react-pro'

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
    href: '/app',
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
    href: '/app',
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
    href: '/app',
  },
  {
    component: CNavTitle,
    name: 'Admin',
    roleId: 3,
  },

  {
    component: CNavItem,
    name: 'Calendário Admin',
    roleId: 3,
    href: '/app/admin/calendario',
    icon: <CIcon icon={cilCalendar} customClassName="nav-icon" />,
  },
  {
    component: CNavGroup,
    name: 'Eventos',
    roleId: 3,
    icon: <CIcon icon={cilDiamond} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Tudo',
        href: '/app/admin/events/todos',
        icon: <CIcon icon={cilCircle} customClassName="nav-icon" />,
      },
      {
        component: CNavItem,
        name: 'Pendentes',
        href: '/app/admin/events/pendentes',
        icon: <CIcon icon={cilCircle} customClassName="nav-icon" />,
      },
      {
        component: CNavItem,
        name: 'Por Estabelecimento',
        href: '/app/admin/events/estabelecimento',
        icon: <CIcon icon={cilCircle} customClassName="nav-icon" />,
      },

    ]
  },
  {
    component: CNavGroup,
    roleId: 3,
    name: 'Usuários',
    icon: <CIcon icon={cilUser} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Lista de Usuários',
        href: '/app/admin/users',
        icon: <CIcon icon={cilUser} customClassName="nav-icon" />,
      },
      {
        component: CNavItem,
        name: 'Questionários',
        href: '/app/admin/questionarios',
        icon: <CIcon icon={cilFile} customClassName="nav-icon" />,
      },
    ],
  },
  {
    component: CNavGroup,
    name: 'Estabelecimentos',
    roleId: 3,
    icon: <CIcon icon={cilInstitution} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Lista ',
        href: '/app/admin/estabelecimentos',
      },
      {
        component: CNavItem,
        name: 'Tipos',
        href: '/app/admin/estabelecimentos/tipos',
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
        href: '/app/admin/events',
      },
      {
        component: CNavItem,
        name: 'Estabelecimentos',
        href: '/app/admin/estabelecimentos',
        icon: <CIcon icon={cilInstitution} customClassName="nav-icon" />,
      },
      {
        component: CNavItem,
        name: 'Questionários',
        href: '/app/admin/questionarios',
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
        href: '/app/admin/courses',
      },
      {
        component: CNavItem,
        name: 'Aulas',
        href: '/app/cursos/aulas',
      },
      {
        component: CNavItem,
        name: 'Avaliações',
        href: '/app/cursos/provas',
      },
      {
        component: CNavItem,
        name: 'Questionários',
        href: '/app/admin/questionarios',
        icon: <CIcon icon={cilFile} customClassName="nav-icon" />,
      },
    ],
  },
  {
    component: CNavTitle,
    name: 'Cursos Online',
    roleId: [1, 2, 3],
  },
  {
    component: CNavItem,
    name: 'Cursos',
    roleId: [1, 2, 3],
    href: '/app/courses',
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
    href: '/app/services',
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
    href: '/app/mashguiach/freelancers',
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
    href: '/app/relatorios/create',
    icon: <CIcon icon={cilCalendar} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Todos Relatórios ',
    roleId: [1, 2, 3],
    href: '/app/relatorios',
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
    href: '/app/stores',
    icon: <CIcon icon={cilCenterFocus} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Meus Eventos',
    roleId: [2, 3],
    href: '/app/estabelecimento/events',
    icon: <CIcon icon={cilGem} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Criar Evento',
    roleId: [2, 3],
    href: '/app/estabelecimento/events/create',
    icon: <CIcon icon={cilPlus} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Buscar Mashguiach',
    roleId: [2, 3],
    href: '/app/theme/colors',
    icon: <CIcon icon={cilSearch} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Finalizar eventos',
    roleId: [2, 3],
    href: '/app/services/finalizar',
    icon: <CIcon icon={cilMoney} customClassName="nav-icon" />,
  },
]

export default _nav
