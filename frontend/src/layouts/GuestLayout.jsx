import React from 'react'
import { Outlet } from 'react-router-dom'

const GuestLayout = () => {
  return (
    <div className='mx-auto max-w-7xl'>
      <Outlet/>
    </div>
  )
}

export default GuestLayout
