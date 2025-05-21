import Footer from "./componentes/footer/Footer";
import Formulario from "./componentes/formulario/Formulario";
import Nav from "./componentes/nav/Nav";
import Home from "./pages/home/Home";
import { Routes, Route } from "react-router-dom";
import Login from "./auth/Login";
import Register from "./auth/Register";
import PrivateRoute from "./componentes/PrivateRouts";
import Dashboard from "./pages/Dashboar";

import VistaRegistro from "./pages/ver registro/VistaRegistro";
import RegistroExitoso from './pages/registro/RegistroExitoso';
import BasesYcondiciones from './pages/Bases y condiciones/BasesYcondiciones';
import { AuthProvider } from "./auth/AuthContext"; // Asegúrate de importar el AuthProvider

import EditarRegistro from "./pages/edit/EditarRegistro";
import { useLocation } from "react-router-dom";
// ...otros imports...
import NavSecundario from "./componentes/nav/NavSecundario"; // crea este componente

function App() {
  const location = useLocation();
  const navSecundarioRoutes = [
    "/dashboard",
    "/editar-registro",
    "/ver-registro",
    "/login",
  ];

  const showNavSecundario = navSecundarioRoutes.some(route => location.pathname.startsWith(route));
  const showNavPrincipal = !showNavSecundario;

  return (
    <AuthProvider>
      {showNavPrincipal && <Nav />}
      {showNavSecundario && <NavSecundario />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/bases-y-condiciones" element={<BasesYcondiciones />} />
        <Route path="/registro" element={<Formulario />} />
        <Route path="/registro-exitoso" element={<RegistroExitoso />} />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/editar-registro/:id" element={<PrivateRoute><EditarRegistro /></PrivateRoute>} />
        <Route path="/ver-registro/:registroId" element={<PrivateRoute><VistaRegistro /></PrivateRoute>} />
      </Routes>
      <Footer />
    </AuthProvider>
  );
}

export default App;
