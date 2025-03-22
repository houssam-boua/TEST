import { createBrowserRouter, Navigate, Route } from "react-router-dom";
import Login from "./pages/Login";
import React from "react";
import DefaultLayout from "./layouts/DefaultLayout";
import UserLayout from "./layouts/UserLayout";
import Dashboard from "./pages/Dashboard";


// const PrivateRoute = ({element})=>{
//     return <Route element={element} />;
// }

const router = createBrowserRouter([
    
        {
            path: "/",
            element:  <DefaultLayout/>,
            children: [
                {
                    path: "login",
                    element: <Login />
                }
            ]
    }, {
        path: "/u",
        element: <UserLayout />,
        children: [
            {
                path: "",
                element: <Dashboard />
            }
        ]
                
    }
    
    
    ]);

export default router;
