import React, { ElementType } from 'react'
import {
  cilBell,
  cilCalculator,
  cilCalendar,
  cilChartPie,
  cilCursor,
  cilDrop,
  cilInstitution,
  cilEnvelopeOpen,
  cilFile,
  cilGrid,
  cilLayers,
  cilMap,
  cilNotes,
  cilPencil,
  cilPuzzle,
  cilSpeedometer,
  cilSpreadsheet,
  cilStar,
  cilStorage,
  cilUser,
  cilInputPower,
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
    name: 'Dashboard',
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
  },
  {
    component: CNavGroup,
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
    name: 'Trabalhos Fixos',
    href: '/theme/colors',
    icon: <CIcon icon={cilGem} customClassName="nav-icon" />,
    badge: {
      color: 'info-gradient',
      text: '+2',
    },
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
  },
  {
    component: CNavTitle,
    name: 'Theme',
  },
  {
    component: CNavItem,
    name: 'Colors',
    href: '/theme/colors',
    icon: <CIcon icon={cilDrop} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Typography',
    href: '/theme/typography',
    icon: <CIcon icon={cilPencil} customClassName="nav-icon" />,
  },
  {
    component: CNavTitle,
    name: 'Components',
  },
  {
    component: CNavGroup,
    name: 'Base',
    href: '/base',
    icon: <CIcon icon={cilPuzzle} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Accordion',
        href: '/base/accordion',
      },
      {
        component: CNavItem,
        name: 'Breadcrumb',
        href: '/base/breadcrumbs',
      },
      {
        component: CNavItem,
        name: 'Cards',
        href: '/base/cards',
      },
      {
        component: CNavItem,
        name: 'Carousel',
        href: '/base/carousels',
      },
      {
        component: CNavItem,
        name: 'Collapse',
        href: '/base/collapses',
      },
      {
        component: CNavItem,
        name: 'List group',
        href: '/base/list-groups',
      },
      {
        component: CNavItem,
        name: 'Navs & Tabs',
        href: '/base/navs',
      },
      {
        component: CNavItem,
        name: 'Pagination',
        href: '/base/paginations',
      },
      {
        component: CNavItem,
        name: 'Placeholders',
        href: '/base/placeholders',
      },
      {
        component: CNavItem,
        name: 'Popovers',
        href: '/base/popovers',
      },
      {
        component: CNavItem,
        name: 'Progress',
        href: '/base/progress',
      },
      {
        component: CNavItem,
        name: 'Spinners',
        href: '/base/spinners',
      },
      {
        component: CNavItem,
        name: 'Tables',
        href: '/base/tables',
      },
      {
        component: CNavItem,
        name: 'Tabs',
        href: '/base/tabs',
      },
      {
        component: CNavItem,
        name: 'Tooltips',
        href: '/base/tooltips',
      },
    ],
  },
  {
    component: CNavGroup,
    name: 'Buttons',
    href: '/buttons',
    icon: <CIcon icon={cilCursor} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Buttons',
        href: '/buttons/buttons',
      },
      {
        component: CNavItem,
        name: 'Buttons groups',
        href: '/buttons/button-groups',
      },
      {
        component: CNavItem,
        name: 'Dropdowns',
        href: '/buttons/dropdowns',
      },
      {
        component: CNavItem,
        name: 'Loading Buttons',
        href: '/buttons/loading-buttons',
        badge: {
          color: 'danger-gradient',
          text: 'PRO',
        },
      },
    ],
  },
  {
    component: CNavGroup,
    name: 'Forms',
    href: '/forms',
    icon: <CIcon icon={cilNotes} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Form Control',
        href: '/forms/form-control',
      },
      {
        component: CNavItem,
        name: 'Select',
        href: '/forms/select',
      },
      {
        component: CNavItem,
        name: 'Multi Select',
        href: '/forms/multi-select',
        badge: {
          color: 'danger-gradient',
          text: 'PRO',
        },
      },
      {
        component: CNavItem,
        name: 'Checks & Radios',
        href: '/forms/checks-radios',
      },
      {
        component: CNavItem,
        name: 'Range',
        href: '/forms/range',
      },
      {
        component: CNavItem,
        name: 'Input Group',
        href: '/forms/input-group',
      },
      {
        component: CNavItem,
        name: 'Floating Labels',
        href: '/forms/floating-labels',
      },
      {
        component: CNavItem,
        name: 'Date Picker',
        href: '/forms/date-picker',
        badge: {
          color: 'danger-gradient',
          text: 'PRO',
        },
      },
      {
        component: CNavItem,
        name: 'Date Range Picker',
        href: '/forms/date-range-picker',
        badge: {
          color: 'danger-gradient',
          text: 'PRO',
        },
      },
      {
        component: CNavItem,
        name: 'Time Picker',
        href: '/forms/time-picker',
        badge: {
          color: 'danger-gradient',
          text: 'PRO',
        },
      },
      {
        component: CNavItem,
        name: 'Layout',
        href: '/forms/layout',
      },
      {
        component: CNavItem,
        name: 'Validation',
        href: '/forms/validation',
      },
    ],
  },
  {
    component: CNavGroup,
    name: 'Icons',
    href: '/icons',
    icon: <CIcon icon={cilStar} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'CoreUI Free',
        href: '/icons/free',
        badge: {
          color: 'success-gradient',
          text: 'FREE',
        },
      },
      {
        component: CNavItem,
        name: 'CoreUI Flags',
        href: '/icons/flags',
      },
      {
        component: CNavItem,
        name: 'CoreUI Brands',
        href: '/icons/brands',
      },
    ],
  },
  {
    component: CNavGroup,
    name: 'Notifications',
    href: '/notifications',
    icon: <CIcon icon={cilBell} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Alerts',
        href: '/notifications/alerts',
      },
      {
        component: CNavItem,
        name: 'Badges',
        href: '/notifications/badges',
      },
      {
        component: CNavItem,
        name: 'Modal',
        href: '/notifications/modals',
      },
      {
        component: CNavItem,
        name: 'Toasts',
        href: '/notifications/toasts',
      },
    ],
  },
  {
    component: CNavItem,
    name: 'Widgets',
    href: '/widgets',
    icon: <CIcon icon={cilCalculator} customClassName="nav-icon" />,
    badge: {
      color: 'info-gradient',
      text: 'NEW',
    },
  },
  {
    component: CNavItem,
    name: 'Smart Table',
    icon: <CIcon icon={cilGrid} customClassName="nav-icon" />,
    badge: {
      color: 'danger-gradient',
      text: 'PRO',
    },
    href: '/smart-table',
  },
  {
    component: CNavTitle,
    name: 'Plugins',
  },
  {
    component: CNavItem,
    name: 'Calendar',
    icon: <CIcon icon={cilCalendar} customClassName="nav-icon" />,
    badge: {
      color: 'danger-gradient',
      text: 'PRO',
    },
    href: '/plugins/calendar',
  },
  {
    component: CNavItem,
    name: 'Charts',
    icon: <CIcon icon={cilChartPie} customClassName="nav-icon" />,
    href: '/plugins/charts',
  },
  {
    component: CNavItem,
    name: 'Google Maps',
    icon: <CIcon icon={cilMap} customClassName="nav-icon" />,
    badge: {
      color: 'danger-gradient',
      text: 'PRO',
    },
    href: '/plugins/google-maps',
  },
  {
    component: CNavTitle,
    name: 'Extras',
  },
  {
    component: CNavGroup,
    name: 'Pages',
    icon: <CIcon icon={cilStar} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Login',
        href: '/login',
      },
      {
        component: CNavItem,
        name: 'Register',
        href: '/register',
      },
      {
        component: CNavItem,
        name: 'Error 404',
        href: '/e404',
      },
      {
        component: CNavItem,
        name: 'Error 500',
        href: '/e500',
      },
    ],
  },
  {
    component: CNavGroup,
    name: 'Apps',
    icon: <CIcon icon={cilLayers} customClassName="nav-icon" />,
    items: [
      {
        component: CNavGroup,
        name: 'Invoicing',
        icon: <CIcon icon={cilSpreadsheet} customClassName="nav-icon" />,
        href: '/apps/invoicing',
        items: [
          {
            component: CNavItem,
            name: 'Invoice',
            badge: {
              color: 'danger-gradient',
              text: 'PRO',
            },
            href: '/apps/invoicing/invoice',
          },
        ],
      },
      {
        component: CNavGroup,
        name: 'Email',
        href: '/apps/email',
        icon: <CIcon icon={cilEnvelopeOpen} customClassName="nav-icon" />,
        items: [
          {
            component: CNavItem,
            name: 'Inbox',
            badge: {
              color: 'danger-gradient',
              text: 'PRO',
            },
            href: '/apps/email/inbox',
          },
          {
            component: CNavItem,
            name: 'Message',
            badge: {
              color: 'danger-gradient',
              text: 'PRO',
            },
            href: '/apps/email/message',
          },
          {
            component: CNavItem,
            name: 'Compose',
            badge: {
              color: 'danger-gradient',
              text: 'PRO',
            },
            href: '/apps/email/compose',
          },
        ],
      },
    ],
  },
]

export default _nav
