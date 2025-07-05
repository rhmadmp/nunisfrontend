'use client'
import React from 'react'
import { BarChartBig, Contact, Home, LayoutGrid, List, MessageSquareMore, SquareMenu, User, User2 } from 'lucide-react'
import {useMediaQuery} from 'usehooks-ts'
import { SidebarItems } from '@/types/sidebartypes'
import SidebarMobile from './SidebarMobile'
import SideBarAdminDekstop from './SideBarAdminDekstop'
const sidebarItems: SidebarItems = {
    links :[
        {label : 'Beranda', href: '/admin/dashboard', icon:Home},
        {label : 'Pengguna', href: '/admin/users', icon:User},
        {label : 'Kategori', href: '/admin/category', icon:SquareMenu},
        {label : 'Menu', href: '/admin/menu', icon:List},
        {label : 'Transaksi', href: '/admin/transaction', icon:BarChartBig},
        {label : 'Ulasan', href: '/admin/review', icon:MessageSquareMore}
      ]
}
export default function sidebar() {
  const isDekstop = useMediaQuery('(min-width:640px)',{
    initializeWithValue:false,
})
  if (isDekstop) return <SideBarAdminDekstop sidebarItems={sidebarItems} />
  return <SidebarMobile sidebarItems={sidebarItems}/>
}
