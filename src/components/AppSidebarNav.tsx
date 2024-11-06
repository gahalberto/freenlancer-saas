'use client'

import React, { ReactNode } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import SimpleBar from 'simplebar-react'
import 'simplebar-react/dist/simplebar.min.css'

import { CBadge, CNavLink, CSidebarNav } from '@coreui/react-pro'

import { Badge, NavItem } from '../_nav'

interface AppSidebarNavProps {
  items: NavItem[]
}

export default function AppSidebarNav({ items }: AppSidebarNavProps) {
  const location = usePathname()
  const navLink = (
    name: string | JSX.Element,
    icon: string | ReactNode,
    badge?: Badge,
    indent = false,
  ) => {
    return (
      <>
        {icon
          ? icon
          : indent && (
              <span className="nav-icon">
                <span className="nav-icon-bullet"></span>
              </span>
            )}
        {name && name}
        {badge && (
          <CBadge color={badge.color} className="ms-auto">
            {badge.text}
          </CBadge>
        )}
      </>
    )
  }

  const navItem = (item: NavItem, index: number, indent = false) => {
    const { component, name, badge, icon, ...rest } = item
    const Component = component
    return (
      <Component as="div" key={index}>
        {rest.href ? (
          <CNavLink {...(rest.href && { as: Link, active: location === rest.href })} {...rest}>
            {navLink(name, icon, badge, indent)}
          </CNavLink>
        ) : (
          navLink(name, icon, badge, indent)
        )}
      </Component>
    )
  }
  const navGroup = (item: NavItem, index: number) => {
    const { component, name, icon, href, ...rest } = item
    const Component = component
    return (
      <Component
        idx={String(index)}
        key={index}
        toggler={navLink(name, icon)}
        {...(href && { visible: location && location.startsWith(href) })}
        {...rest}
      >
        {item.items?.map((item: NavItem, index: number) =>
          item.items ? navGroup(item, index) : navItem(item, index, true),
        )}
      </Component>
    )
  }

  return (
    <CSidebarNav as={SimpleBar}>
      {items &&
        items.map((item: NavItem, index: number) =>
          item.items ? navGroup(item, index) : navItem(item, index),
        )}
     </CSidebarNav>
  )
}
