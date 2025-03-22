import React from 'react'
import { Outlet } from 'react-router-dom'

function AdminLayout() {
  return (
    <div className=''>
      <Outlet/>
    </div>
  )
}

export default AdminLayout
