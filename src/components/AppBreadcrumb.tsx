'use client'

import React, { useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'

import { CAlert, CBadge, CBreadcrumb, CBreadcrumbItem } from '@coreui/react-pro'
import { useUserSession } from '@/contexts/sessionContext'
import { useSession } from 'next-auth/react'

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

/**
 * Gera os breadcrumbs com base no caminho atual
 * Exemplo: para o caminho /app/admin/calendar2
 * Retorna: [
 *   { pathname: '/app', name: 'Início', active: false },
 *   { pathname: '/app/admin', name: 'Admin', active: false },
 *   { pathname: '/app/admin/calendar2', name: 'Calendário', active: true }
 * ]
 */
const getBreadcrumbs = (location: string) => {
  const breadcrumbs: breadcrumb[] = []
  
  // Se não começar com /app, retorna breadcrumbs vazios
  if (!location.startsWith('/app')) {
    return breadcrumbs
  }
  
  // Dividimos o caminho em partes
  const pathParts = location.split('/').filter(part => part !== '')
  
  // Construímos os breadcrumbs a partir de /app
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

const AppBreadcrumb = () => {
  const [breadcrumbs, setBreadcrumbs] = useState<breadcrumb[]>([])
  const pathname = usePathname()
  const { data: session, status, update } = useSession()

  useEffect(() => {
    if (pathname) {
      setBreadcrumbs(getBreadcrumbs(pathname))
    }
  }, [pathname])

  const router = useRouter()
  
  const handleUpdate = async (roleId: number) => {
    await update({ roleId })
    router.push('/app')
  }

  return (
    <>
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

      {session?.user.isAdminPreview && (
        <div className="flex-1">
          <div className="text-xs" style={{ fontSize: 14, fontWeight: 'bold' }}>
            Conta Demo, escolha tipo:
          </div>

          <CBadge
            color={session.user.roleId === 3 ? 'primary' : 'secondary'}
            shape="rounded"
            style={{ marginRight: '0.5rem', cursor: 'pointer' }}
            onClick={() => handleUpdate(3)}
          >
            Admin
          </CBadge>

          <CBadge
            color={session.user.roleId === 2 ? 'primary' : 'secondary'}
            shape="rounded"
            style={{ marginRight: '0.5rem', cursor: 'pointer' }}
            onClick={() => handleUpdate(2)}
          >
            Loja
          </CBadge>

          <CBadge
            color={session.user.roleId === 1 ? 'primary' : 'secondary'}
            shape="rounded"
            style={{ cursor: 'pointer' }}
            onClick={() => handleUpdate(1)}
          >
            Mashguiach
          </CBadge>
        </div>
      )}
    </>
  )
}

export default React.memo(AppBreadcrumb)
