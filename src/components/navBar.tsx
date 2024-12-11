import { logo } from '@/public/brand/logo'
import CIcon from '@coreui/icons-react'
import {
  CCollapse,
  CContainer,
  CNavbar,
  CNavbarBrand,
  CNavbarNav,
  CNavbarToggler,
  CNavItem,
  CNavLink,
} from '@coreui/react-pro'
import { useState } from 'react'

const HomeNavBar = () => {
  const [visible, setVisible] = useState(false)
  return (
    <>
      <CNavbar
        expand="lg"
        style={{ backgroundColor: '#212631' }}
        className="border-end"
        colorScheme="dark"
      >
        <CContainer fluid>
          <CNavbarToggler
            aria-label="Toggle navigation"
            aria-expanded={visible}
            onClick={() => setVisible(!visible)}
          />
          <CNavbarBrand href="#">
            <CIcon customClassName="sidebar-brand-full" icon={logo} height={32} />
          </CNavbarBrand>
          <CCollapse className="navbar-collapse" visible={visible}>
            <CNavbarNav className="me-auto mb-2 mb-lg-0">
              <CNavItem>
                <CNavLink href="/" active>
                  Início
                </CNavLink>
              </CNavItem>
              <CNavItem>
                <CNavLink href="/login">Login</CNavLink>
              </CNavItem>
              <CNavItem>
                <CNavLink href="/register">Registre-se</CNavLink>
              </CNavItem>
              <CNavItem>
                <CNavLink href="/app">Dashboard</CNavLink>
              </CNavItem>
            </CNavbarNav>
          </CCollapse>
        </CContainer>
      </CNavbar>
    </>
  )
}

export default HomeNavBar
