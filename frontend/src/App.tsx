import './App.css'
import { QueryClientProvider,QueryClient, QueryClient } from '@tanstack/react-query'


const queryClient: object = new QueryClient();

const PrivateRoute = ({children: any}) =>{
  const {isAuthenticated: boolean} = useAuth()
}

function App() {

  return (
    <>
     
    </>
  )
}

export default App
