import { createBrowserRouter, Navigate, Route } from "react-router-dom";
import Login from "./pages/Login";
import React from "react";
import DefaultLayout from "./layouts/DefaultLayout";


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
        }
    
    ]);

export default router;
