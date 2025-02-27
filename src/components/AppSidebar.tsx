import React from 'react'
import Link from 'next/link'
import { useDispatch } from 'react-redux'
import { useTypedSelector } from './../store'
import {
  CCloseButton,
  CSidebar,
  CSidebarBrand,
  CSidebarFooter,
  CSidebarHeader,
  CSidebarToggler,
} from '@coreui/react-pro'
import CIcon from '@coreui/icons-react'

import AppSidebarNav from './AppSidebarNav'

import { logo } from '@/public/brand/logo'
import { sygnet } from '@/public/brand/sygnet'

// sidebar nav config
import navigation from '../_nav'
import { useSession } from 'next-auth/react'
import Image from 'next/image'

const AppSidebar = (): JSX.Element => {
  const dispatch = useDispatch()
  const unfoldable = useTypedSelector((state) => state.sidebarUnfoldable)
  const sidebarShow = useTypedSelector((state) => state.sidebarShow)
  const { data: session, status } = useSession() // Adicionando status para verificar o carregamento
  const roleUserId = session?.user.roleId

  // Só renderiza o menu após a sessão estar carregada
  if (status === 'loading') {
    return <></> // Ou um componente de carregamento, como um spinner
  }

  return (
    <CSidebar
      className="border-end"
      colorScheme="light"
      position="fixed"
      unfoldable={unfoldable}
      visible={sidebarShow}
      onVisibleChange={(visible) => {
        dispatch({ type: 'set', sidebarShow: visible })
      }}
    >
      <CSidebarHeader className="border-bottom">
        <CSidebarBrand as={Link} href="/">
          <Image src="/brand/logobyk2.png" alt="Logo" height={100} width={200} />
          <CIcon customClassName="sidebar-brand-narrow" icon={sygnet} height={32} />
        </CSidebarBrand>
        <CCloseButton
          className="d-lg-none"
          dark
          onClick={() => dispatch({ type: 'set', sidebarShow: false })}
        />
      </CSidebarHeader>
      {roleUserId && (
        <AppSidebarNav
          items={navigation.filter((item) =>
            Array.isArray(item.roleId)
              ? item.roleId.includes(roleUserId)
              : item.roleId === roleUserId,
          )}
        />
      )}
      <CSidebarFooter className="border-top d-none d-lg-flex">
        <CSidebarToggler
          onClick={() => dispatch({ type: 'set', sidebarUnfoldable: !unfoldable })}
        />
      </CSidebarFooter>
    </CSidebar>
  )
}

export default React.memo(AppSidebar)
