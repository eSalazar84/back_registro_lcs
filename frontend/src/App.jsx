import Footer from "./componentes/footer/Footer";
import Formulario from "./componentes/formulario/Formulario";
import Nav from "./componentes/nav/Nav";
import Home from "./pages/home/Home";
import { Routes, Route } from "react-router-dom";
import Login from "./auth/Login";
import Register from "./auth/Register";
import PrivateRoute from "./componentes/PrivateRouts";
import Dashboard from "./pages/Dashboar";
import Vivienda from "./pages/Vivienda/Vivienda";
import RegistroExitoso from './pages/registro/RegistroExitoso';
import BasesYcondiciones from './pages/Bases y condiciones/BasesYcondiciones';
import EditarRegistro from "./pages/edit/EditarRegistro";

function App() {
  return (
    <>
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
        <Route path="/vivienda/:id" element={<PrivateRoute><Vivienda /></PrivateRoute>} />
      </Routes>
      <Footer />
    </>
  );
}

export default App;
