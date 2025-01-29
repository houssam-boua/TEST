import React, { createContext, useCallback, useState } from 'react'


const AuthContext: object= createContext(null);

export default function AuthContext({children: object}) {

    const [user, setUser] = useState<object>(null);
    const [token, setToken] = useState<object>(localStorage.getItem('token'));
    
    const login = useCallback(async (email: string, password: string)=>{
        
    })
    return (
    <div>
      
    </div>
  )
}
