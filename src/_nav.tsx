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
  cilClock,
  cilUserPlus,
  cilPeople,
  cilEnvelopeClosed,
  cilBug,
  cilNewspaper,
  cilBell,
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
    component: CNavTitle,
    name: 'Métricas & Dashboards',
    roleId: [3,4],
  },

  {
    component: CNavItem,
    name: 'Principal',
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
    name: 'Principal',
    roleId: [3,4],
    icon: <CIcon icon={cilSpeedometer} customClassName="nav-icon" />,
    badge: {
      color: 'success-gradient',
      text: 'NOVO',
    },
    href: '/app/dashboard/admin2',
  },
  {
    component: CNavItem,
    name: 'Financeiro',
    roleId: [3,4],
    icon: <CIcon icon={cilMoney} customClassName="nav-icon" />,
    badge: {
      color: 'danger-gradient',
      text: 'NOVO',
    },
    href: '/app/dashboard/financeiro',
  },

  {
    component: CNavTitle,
    name: 'Eventos Admin',
    roleId: [3,4],
  },
  {
    component: CNavItem,
    name: 'Calendário Admin',
    roleId: [3,4],
    href: '/app/admin/calendar2',
    icon: <CIcon icon={cilCalendar} customClassName="nav-icon" />,
  },
  {
    component: CNavGroup,
    name: 'Eventos',
    roleId: [3,4],
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
      {
        component: CNavItem,
        name: 'Por Mashguiach',
        href: '/app/admin/events/mashguiach',
        icon: <CIcon icon={cilCircle} customClassName="nav-icon" />,
      },
      {
        component: CNavItem,
        name: 'Finalizar eventos',
        href: '/app/services/finalizar',
        icon: <CIcon icon={cilMoney} customClassName="nav-icon" />,
      },
    ]
  },

  {
    component: CNavTitle,
    name: 'Relatórios',
    roleId: [3,4],
  },

  {
    component: CNavGroup,
    name: 'Banco de Horas',
    roleId: [3,4],
    icon: <CIcon icon={cilClock} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Registrar Ponto',
        href: '/app/admin/banco-de-horas/registrar',
        icon: <CIcon icon={cilClock} customClassName="nav-icon" />,
      },
      {
        component: CNavItem,
        name: 'Funcionários',
        href: '/app/admin/banco-de-horas/funcionarios',
        icon: <CIcon icon={cilPeople} customClassName="nav-icon" />,
      },
      {
        component: CNavItem,
        name: 'Justificar Faltas',
        href: '/app/admin/banco-de-horas/justificar-faltas',
        icon: <CIcon icon={cilFlagAlt} customClassName="nav-icon" />,
      },
      {
        component: CNavItem,
        name: 'Escala de Trabalho',
        href: '/app/admin/banco-de-horas/escala',
        icon: <CIcon icon={cilCalendar} customClassName="nav-icon" />,
      },
      {
        component: CNavItem,
        name: 'Relatórios',
        href: '/app/admin/banco-de-horas/relatorios',
        icon: <CIcon icon={cilFile} customClassName="nav-icon" />,
      },
      {
        component: CNavItem,
        name: 'Relatório Individual (Fixo)',
        href: '/app/admin/banco-de-horas/relatorios/individual',
        icon: <CIcon icon={cilClock} customClassName="nav-icon" />,
      },
      {
        component: CNavItem,
        name: 'Relatório Individual (Freelancer)',
        href: '/app/admin/relatorios/freelancer/individual',
        icon: <CIcon icon={cilUserPlus} customClassName="nav-icon" />,
      },
      {
        component: CNavItem,
        name: 'Relatório por Estabelecimento',
        href: '/app/admin/relatorios/estabelecimentos-freelancers',
        icon: <CIcon icon={cilInstitution} customClassName="nav-icon" />,
      },
      {
        component: CNavItem,
        name: 'Relatório Mensal',
        href: '/app/admin/banco-de-horas/relatorios/mensal',
        icon: <CIcon icon={cilCalendar} customClassName="nav-icon" />,
      },
    ]
  },

  {
    component: CNavTitle,
    name: 'Admin',
    roleId: [3,4],
  },
  
  {
    component: CNavItem,
    name: 'Notícias e Avisos',
    roleId: [3,4],
    href: '/app/admin/news',
    icon: <CIcon icon={cilNewspaper} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Alertas do Sistema',
    roleId: [3,4],
    href: '/app/admin/alerts',
    icon: <CIcon icon={cilBell} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Mensagens de Contato',
    roleId: [3,4],
    href: '/app/admin/contatos',
    icon: <CIcon icon={cilEnvelopeClosed} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Relatórios de Problemas',
    roleId: 3,
    icon: <CIcon icon={cilBug} customClassName="nav-icon" />,
    href: '/app/problem-reports',
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

      {
        component: CNavItem,
        name: 'Cadastrar User Demo',
        href: '/app/admin/users/create-demo',
        icon: <CIcon icon={cilUserPlus} customClassName="nav-icon" />,
      },

    ],
  },
 
  {
    component: CNavGroup,
    name: 'Estabelecimentos',
    roleId: [3,4],
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
    roleId: [3,4],
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
    roleId: [1, 2, 3, 4],
  },
  {
    component: CNavItem,
    name: 'Cursos',
    roleId: [1, 2, 3, 4],
    href: '/app/courses',
    icon: <CIcon icon={cilStar} customClassName="nav-icon" />,
  },
  {
    component: CNavTitle,
    roleId: [1, 3, 4],
    name: 'Trabalhos Disponíveis',
  },
  {
    component: CNavItem,
    name: 'Freelancers',
    roleId: [1, 3, 4],
    href: '/app/services',
    icon: <CIcon icon={cilMoney} customClassName="nav-icon" />,
  },
  {
    component: CNavTitle,
    name: 'Meus Trabalhos',
    roleId: [1, 2, 3, 4],
  },
  {
    component: CNavItem,
    name: 'Calendário de Eventos',
    roleId: 2,
    href: '/app/estabelecimento/calendar',
    icon: <CIcon icon={cilCalendar} customClassName="nav-icon" />,
    badge: {
      color: 'info-gradient',
      text: 'NOVO',
    },
  },
  {
    component: CNavItem,
    name: 'Relatórios de Trabalho',
    roleId: [1, 3, 4],
    href: '/app/mashguiach/relatorios',
    icon: <CIcon icon={cilFile} customClassName="nav-icon" />,
  },
  {
    component: CNavTitle,
    name: 'Relatórios & Avisos',
    roleId: [1, 2, 3],
  },
  {
    component: CNavItem,
    name: 'Criar Relatório ',
    roleId: [1, 2, 3, 4],
    href: '/app/relatorios/create',
    icon: <CIcon icon={cilCalendar} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Todos Relatórios ',
    roleId: [1, 2, 3, 4],
    href: '/app/relatorios',
    icon: <CIcon icon={cilFlagAlt} customClassName="nav-icon" />,
  },
  {
    component: CNavTitle,
    roleId: [2, 3, 4],
    name: 'Estabelecimentos',
  },
  {
    component: CNavItem,
    name: 'Meus Estabelecimentos',
    roleId: [2, 3, 4],
    href: '/app/stores',
    icon: <CIcon icon={cilCenterFocus} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Meus Eventos',
    roleId: [2, 3, 4],
    href: '/app/estabelecimento/events',
    icon: <CIcon icon={cilGem} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Criar Evento',
    roleId: [2, 3, 4],
    href: '/app/estabelecimento/events/add',
    icon: <CIcon icon={cilPlus} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Buscar Mashguiach',
    roleId: [2, 3, 4],
    href: '/app/theme/colors',
    icon: <CIcon icon={cilSearch} customClassName="nav-icon" />,
  },
]

export default _nav
