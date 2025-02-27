import React from 'react'
import {
  CAvatar,
  CBadge,
  CDropdown,
  CDropdownDivider,
  CDropdownHeader,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
} from '@coreui/react-pro'
import {
  cilAccountLogout,
  cilBell,
  cilCreditCard,
  cilCommentSquare,
  cilEnvelopeOpen,
  cilFile,
  cilLockLocked,
  cilSettings,
  cilTask,
  cilUser,
} from '@coreui/icons'
import CIcon from '@coreui/icons-react'

import avatar8 from '@/public/images/avatars/8.jpg'
import { signOut, useSession } from 'next-auth/react'

const AppHeaderDropdown = () => {
  const { data: session } = useSession()
  return (
    <CDropdown variant="nav-item" alignment="end">
      <CDropdownToggle className="py-0" caret={false}>
        <CAvatar src="/images/avatars/avatar.jpg" size="md" />
      </CDropdownToggle>
      <CDropdownMenu className="pt-0">
        <CDropdownHeader className="bg-body-secondary text-body-secondary fw-semibold my-2">
          Configurações
        </CDropdownHeader>
        <CDropdownItem href={`/profile/${session?.user.id}`}>
          <CIcon icon={cilUser} className="me-2" />
          Perfil
        </CDropdownItem>
        <CDropdownItem href="#" disabled>
          <CIcon icon={cilSettings} className="me-2" />
          Configurações
        </CDropdownItem>
        <CDropdownItem href="#" disabled>
          <CIcon icon={cilCreditCard} className="me-2" />
          Pagamentos
        </CDropdownItem>
        \ <CDropdownDivider />
        <CDropdownItem onClick={() => signOut({ callbackUrl: '/' })}>
          <CIcon icon={cilAccountLogout} className="me-2" />
          Sair
        </CDropdownItem>
      </CDropdownMenu>
    </CDropdown>
  )
}

export default AppHeaderDropdown
