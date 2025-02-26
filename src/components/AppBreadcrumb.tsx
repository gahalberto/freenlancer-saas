  import React from 'react'
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
    { path: '/components/base/navs', name: 'Navs & Tabs' },
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
    location.split('/').reduce((prev, curr, index, array) => {
      const currentPathname = `${prev}/${curr}`
      const routeName = getRouteName(currentPathname, routeNames) || humanize(curr)
      breadcrumbs.push({
        pathname: currentPathname,
        name: routeName,
        active: index + 1 === array.length ? true : false,
      })
      return currentPathname
    })
    return breadcrumbs
  }

  const AppBreadcrumb = () => {
    const currentLocation = usePathname()
    const { data: session, status, update } = useSession()

    const breadcrumbs = currentLocation && getBreadcrumbs(currentLocation)
    
    const router = useRouter()
    
    const handleUpdate = async (roleId: number) => {
      await update({ roleId })
      router.push('/app')
    }

    return (
      <>
        <CBreadcrumb className="m-0">
          {breadcrumbs &&
            breadcrumbs.map((breadcrumb, index) => {
              return (
                <CBreadcrumbItem
                  {...(breadcrumb.active ? { active: true } : { href: breadcrumb.pathname })}
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
