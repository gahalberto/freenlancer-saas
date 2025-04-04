import { useEffect, useRef, useState } from 'react'
import { useDispatch } from 'react-redux'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

import {
  CContainer,
  CDropdown,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
  CHeader,
  CHeaderNav,
  CHeaderToggler,
  CNavLink,
  CNavItem,
  useColorModes,
  CBadge,
  CBreadcrumb,
  CBreadcrumbItem,
} from '@coreui/react-pro'
import { cilContrast, cilMenu, cilMoon, cilSun } from '@coreui/icons'
import CIcon from '@coreui/icons-react'

import { useTypedSelector } from './../store'

import {
  AppHeaderDropdown,
  AppHeaderDropdownMssg,
  AppHeaderDropdownNotif,
  AppHeaderDropdownTasks,
} from './header/'

import { useSession } from 'next-auth/react'
import { getCreditsByUser } from '@/app/_actions/getCreditsByUser'

type breadcrumb = {
  pathname?: string
  name?: boolean | string
  active?: boolean
}

type route = {
  path: string
  name: string
}

const routeNames = [
  { path: '/app', name: 'Início' },
  { path: '/app/dashboard', name: 'Dashboard' },
  { path: '/app/dashboard/admin2', name: 'Dashboard Avançado' },
  { path: '/app/admin', name: 'Admin' },
  { path: '/app/admin/calendar2', name: 'Calendário' },
  { path: '/app/admin/events', name: 'Eventos' },
  { path: '/app/admin/events/todos', name: 'Todos os Eventos' },
  { path: '/app/admin/events/pendentes', name: 'Eventos Pendentes' },
  { path: '/app/admin/events/estabelecimento', name: 'Eventos por Estabelecimento' },
  { path: '/app/admin/events/mashguiach', name: 'Eventos por Mashguiach' },
  { path: '/app/services/finalizar', name: 'Finalizar Eventos' },
  { path: '/app/admin/users', name: 'Usuários' },
  { path: '/app/admin/questionarios', name: 'Questionários' },
  { path: '/app/admin/users/create-demo', name: 'Cadastrar User Demo' },
  { path: '/app/admin/banco-de-horas', name: 'Banco de Horas' },
  { path: '/app/admin/banco-de-horas/relatorios', name: 'Relatórios' },
  { path: '/app/admin/banco-de-horas/relatorios/individual', name: 'Relatório Individual' },
  { path: '/app/admin/banco-de-horas/relatorios/mensal', name: 'Relatório Mensal' },
  { path: '/app/admin/estabelecimentos', name: 'Estabelecimentos' },
  { path: '/app/admin/estabelecimentos/tipos', name: 'Tipos de Estabelecimentos' },
]

const humanize = (text: string) => {
  const string = text
    .split('-')
    .reduce(
      (accumulator, currentValue) =>
        accumulator + ' ' + currentValue[0].toUpperCase() + currentValue.slice(1),
    )
  return string[0].toUpperCase() + string.slice(1)
}

const getRouteName = (pathname: string, routes: route[]) => {
  const currentRoute = routes.find((route) => route.path === pathname)
  return currentRoute ? currentRoute.name : false
}

const getBreadcrumbs = (location: string) => {
  const breadcrumbs: breadcrumb[] = []
  
  if (!location.startsWith('/app')) {
    return breadcrumbs
  }
  
  const pathParts = location.split('/').filter(part => part !== '')
  let currentPath = ''
  
  pathParts.forEach((part, index) => {
    currentPath += `/${part}`
    const routeName = getRouteName(currentPath, routeNames) || humanize(part)
    
    breadcrumbs.push({
      pathname: currentPath,
      name: routeName,
      active: index + 1 === pathParts.length ? true : false,
    })
  })
  
  return breadcrumbs
}

const AppHeader = (): JSX.Element => {
  const { data: session, status, update } = useSession()
  const [credits, setCredits] = useState(0)
  const [breadcrumbs, setBreadcrumbs] = useState<breadcrumb[]>([])
  const pathname = usePathname()
  const router = useRouter()

  const headerRef = useRef<HTMLDivElement>(null)
  const { colorMode, setColorMode } = useColorModes(
    'coreui-pro-next-js-admin-template-theme-default',
  )

  const dispatch = useDispatch()
  const sidebarShow = useTypedSelector((state) => state.sidebarShow)
  const asideShow = useTypedSelector((state) => state.asideShow)

  useEffect(() => {
    document.addEventListener('scroll', () => {
      headerRef.current &&
        headerRef.current.classList.toggle('shadow-sm', document.documentElement.scrollTop > 0)
    })

    setColorMode('light')

    if (pathname) {
      setBreadcrumbs(getBreadcrumbs(pathname))
    }
  }, [pathname])

  const handleUpdate = async (roleId: number) => {
    await update({ roleId })
    router.push('/app')
  }

  return (
    <CHeader position="sticky" className="mb-4 p-0" ref={headerRef}>
      <CContainer className="border-bottom px-4" fluid>
        <CHeaderToggler
          onClick={() => dispatch({ type: 'set', sidebarShow: !sidebarShow })}
          style={{ marginInlineStart: '-14px' }}
        >
          <CIcon icon={cilMenu} size="lg" />
        </CHeaderToggler>

        <CHeaderNav className="d-none d-md-flex">
          <CBreadcrumb className="m-0 ms-2">
            {breadcrumbs.map((breadcrumb, index) => {
              return (
                <CBreadcrumbItem
                  {...(breadcrumb.pathname && { href: breadcrumb.pathname })}
                  {...(breadcrumb.active && { active: true })}
                  key={index}
                >
                  {breadcrumb.name}
                </CBreadcrumbItem>
              )
            })}
          </CBreadcrumb>
        </CHeaderNav>

        <CHeaderNav className="ms-auto ms-md-0">
          <CDropdown variant="nav-item" placement="bottom-end">
            <CDropdownMenu>
              <CDropdownItem
                active={colorMode === 'light'}
                className="d-flex align-items-center"
                as="button"
                type="button"
                onClick={() => setColorMode('light')}
              >
                <CIcon className="me-2" icon={cilSun} size="lg" /> Light
              </CDropdownItem>
              <CDropdownItem
                active={colorMode === 'dark'}
                className="d-flex align-items-center"
                as="button"
                type="button"
                onClick={() => setColorMode('dark')}
              >
                <CIcon className="me-2" icon={cilMoon} size="lg" /> Dark
              </CDropdownItem>
              <CDropdownItem
                active={colorMode === 'auto'}
                className="d-flex align-items-center"
                as="button"
                type="button"
                onClick={() => setColorMode('auto')}
              >
                <CIcon className="me-2" icon={cilContrast} size="lg" /> Auto
              </CDropdownItem>
            </CDropdownMenu>
          </CDropdown>
          <CHeaderNav className="ms-left ms-md-0">
            <li className="nav-item py-1">
              <div className="vr h-100 mx-2 text-body text-opacity-75"></div>
            </li>
            <AppHeaderDropdownNotif />
          </CHeaderNav>
          <li className="nav-item py-1">
            <div className="vr h-100 mx-2 text-body text-opacity-75"></div>
          </li>
          <AppHeaderDropdown />
        </CHeaderNav>
      </CContainer>
    </CHeader>
  )
}

export default AppHeader
