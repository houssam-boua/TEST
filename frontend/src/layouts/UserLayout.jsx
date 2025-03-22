import React from 'react'
import { Link, Outlet } from 'react-router-dom'
import Sidebar from '../component/Sidebar'
import Header from '../component/Header'

const UserLayout = () => {
  const sidebarContent = [
    <li key="1" className=" hover:bg-secondary/40 rounded  transition duration-200 ease-in-out ">
      <Link className="text-inherit">Accueil</Link>
    </li>,
    <li key="2" className=" hover:bg-secondary/40 rounded  transition duration-200 ease-in-out ">
       <Link className="text-inherit">Création des documents</Link>
    </li>,
    <li key="3" className=" hover:bg-secondary/40 rounded  transition duration-200 ease-in-out ">
      <Link className="text-inherit" href="">Consultation des documents</Link>
    </li>
  ]

  return (
    <div>
     
      <Sidebar sidebarContent={sidebarContent}>
         <Header/>
            <Outlet />
        </Sidebar>
    </div>
  )
}

export default UserLayout
