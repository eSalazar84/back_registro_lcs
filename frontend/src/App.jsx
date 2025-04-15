import Footer from "./componentes/footer/Footer";
import Formulario from "./componentes/formulario/Formulario";
import Nav from "./componentes/nav/Nav";
import Home from "./pages/home/Home";
import { Routes, Route } from "react-router-dom";
import Login from "./auth/Login";
import Register from "./auth/Register";
import PrivateRoute from "./componentes/PrivateRouts";
import Dashboard from "./pages/Dashboar";
<<<<<<< HEAD
import VistaRegistro from "./pages/ver registro/VistaRegistro";
import RegistroExitoso from './pages/registro/RegistroExitoso';
import BasesYcondiciones from './pages/Bases y condiciones/BasesYcondiciones';
import { AuthProvider } from "./auth/AuthContext"; // Asegúrate de importar el AuthProvider
=======
import Vivienda from "./pages/Vivienda/Vivienda";
import RegistroExitoso from './pages/registro/RegistroExitoso';
import BasesYcondiciones from './pages/Bases y condiciones/BasesYcondiciones';
>>>>>>> db367188ec5cdd42967f2ccf1a81725ac2a20bad
import EditarRegistro from "./pages/edit/EditarRegistro";

function App() {
  return (
<<<<<<< HEAD
    <AuthProvider>  {/* Envuelve toda la app con AuthProvider */}
=======
    <>
>>>>>>> db367188ec5cdd42967f2ccf1a81725ac2a20bad
      <Nav />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/bases-y-condiciones" element={<BasesYcondiciones />} />
        <Route path="/registro" element={<Formulario />} />
        <Route path="/registro-exitoso" element={<RegistroExitoso />} />
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/editar-registro/:id" element={<PrivateRoute><EditarRegistro /></PrivateRoute>} />
<<<<<<< HEAD
       
        <Route path="/ver-registro/:registroId" element={<VistaRegistro />} />

      </Routes>
      <Footer />
    </AuthProvider>
=======
        <Route path="/vivienda/:id" element={<PrivateRoute><Vivienda /></PrivateRoute>} />
      </Routes>
      <Footer />
    </>
>>>>>>> db367188ec5cdd42967f2ccf1a81725ac2a20bad
  );
}

export default App;
