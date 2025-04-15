import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from './auth/AuthContext.jsx';
import {  RegistroProvider } from './context/RegistroConext.jsx';



createRoot(document.getElementById('root')).render(
  <StrictMode>
<<<<<<< HEAD

=======
>>>>>>> db367188ec5cdd42967f2ccf1a81725ac2a20bad
    <RegistroProvider> 
      <AuthProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </AuthProvider>
    </RegistroProvider>
  </StrictMode>,
)
