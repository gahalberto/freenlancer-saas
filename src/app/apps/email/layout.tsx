'use client'

import Link from 'next/link'
import { useDispatch } from 'react-redux'
import { useTypedSelector } from '../../../store'

import {
  CCloseButton,
  CSidebar,
  CSidebarBrand,
  CSidebarFooter,
  CSidebarHeader,
  CSidebarNav,
  CSidebarToggler,
  CNavItem,
  CContainer,
  CCard,
  CCardBody,
  CBadge,
  CNavLink,
} from '@coreui/react-pro'
import CIcon from '@coreui/icons-react'

import { logo } from '@/public/brand/logo'
import { sygnet } from '@/public/brand/sygnet'

import { AppAside, AppFooter, AppHeader } from '@/components'
import {
  cilBookmark,
  cilInbox,
  cilPaperPlane,
  cilPencil,
  cilSpeedometer,
  cilStar,
  cilTrash,
} from '@coreui/icons'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch()
  const unfoldable = useTypedSelector((state) => state.sidebarUnfoldable)
  const sidebarShow = useTypedSelector((state) => state.sidebarShow)

  return (
    <>
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
            <CIcon customClassName="sidebar-brand-full" icon={logo} height={32} />
            <CIcon customClassName="sidebar-brand-narrow" icon={sygnet} height={32} />
          </CSidebarBrand>
          <CCloseButton
            className="d-lg-none"
            onClick={() => dispatch({ type: 'set', sidebarShow: false })}
          />
        </CSidebarHeader>
        <CSidebarNav>
          <CNavItem>
            <CNavLink as={Link} href="./compose">
              <CIcon icon={cilPencil} customClassName="nav-icon" />
              Compose
            </CNavLink>
          </CNavItem>
          <CNavItem>
            <CNavLink as={Link} href="./inbox">
              <CIcon icon={cilInbox} customClassName="nav-icon" />
              Inbox
              <CBadge color="danger-gradient" className="ms-auto">
                4
              </CBadge>
            </CNavLink>
          </CNavItem>
          <CNavItem color="success" href="#">
            <CIcon icon={cilStar} customClassName="nav-icon" />
            Stared
          </CNavItem>
          <CNavItem color="success" href="#">
            <CIcon icon={cilPaperPlane} customClassName="nav-icon" />
            Sent
          </CNavItem>
          <CNavItem color="success" href="#">
            <CIcon icon={cilTrash} customClassName="nav-icon" />
            Trash
          </CNavItem>
          <CNavItem href="#">
            <CIcon icon={cilBookmark} customClassName="nav-icon" />
            Important
            <CBadge color="info-gradient" className="ms-auto">
              25
            </CBadge>
          </CNavItem>
          <CNavItem className="mt-auto">
            <CNavLink as={Link} href="/">
              <CIcon icon={cilSpeedometer} customClassName="nav-icon" />
              Dashboard
            </CNavLink>
          </CNavItem>
        </CSidebarNav>
        <CSidebarFooter className="border-top d-none d-lg-flex">
          <CSidebarToggler
            onClick={() => dispatch({ type: 'set', sidebarUnfoldable: !unfoldable })}
          />
        </CSidebarFooter>
      </CSidebar>
      <div className="wrapper d-flex flex-column min-vh-100">
        <AppHeader />
        <div className="body flex-grow-1">
          <CContainer lg className="px-4">
            <CCard>
              <CCardBody>{children}</CCardBody>
            </CCard>
          </CContainer>
        </div>
        <AppFooter />
      </div>
      <AppAside />
    </>
  )
}
