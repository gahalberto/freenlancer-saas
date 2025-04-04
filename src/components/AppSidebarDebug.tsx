'use client'

import React from 'react'
import { useSession } from 'next-auth/react'
import navigation from '../_nav'

const AppSidebarDebug = () => {
  const { data: session, status } = useSession()
  const roleUserId = session?.user.roleId

  if (status === 'loading') {
    return <div>Carregando...</div>
  }

  // Filtrar itens visíveis para o usuário atual
  const visibleItems = navigation.filter((item) =>
    Array.isArray(item.roleId)
      ? item.roleId.includes(roleUserId || 0)
      : item.roleId === roleUserId
  )

  return (
    <div style={{ padding: '20px', backgroundColor: '#f5f5f5', border: '1px solid #ddd', borderRadius: '5px' }}>
      <h3>Depuração do Menu</h3>
      <div>
        <strong>Status da sessão:</strong> {status}
      </div>
      <div>
        <strong>ID do papel do usuário (roleUserId):</strong> {roleUserId}
      </div>
      <div>
        <strong>Papel do usuário:</strong> {
          roleUserId === 1 ? 'Mashguiach' :
          roleUserId === 2 ? 'Estabelecimento' :
          roleUserId === 3 ? 'Admin' :
          roleUserId === 4 ? 'Superadmin' : 'Desconhecido'
        }
      </div>
      <div>
        <strong>Total de itens no menu:</strong> {navigation.length}
      </div>
      <div>
        <strong>Itens visíveis para este usuário:</strong> {visibleItems.length}
      </div>
      <h4>Itens do Menu:</h4>
      <ul>
        {visibleItems.map((item, index) => (
          <li key={index}>
            {item.name} - 
            {item.href ? <span>Link: {item.href}</span> : <span>Grupo ou Título</span>}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default AppSidebarDebug 