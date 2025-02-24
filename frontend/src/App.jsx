import Footer from "./componentes/footer/Footer";
import Formulario from "./componentes/formulario/Formulario";
import Nav from "./componentes/nav/Nav";
import Home from "./pages/home/Home";
import { Routes, Route } from "react-router-dom";
import Login from "./auth/Login";
import Register from "./auth/Register";
import PrivateRoute from "./componentes/PrivateRouts";
import Dashboard from "./pages/Dashboar";
import RegistroExitoso from './pages/registro/RegistroExitoso';

import { AuthProvider } from "./auth/AuthContext"; // Asegúrate de importar el AuthProvider

function App() {
  return (
    <AuthProvider>  {/* Envuelve toda la app con AuthProvider */}
      <Nav />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/registro" element={<Formulario />} />
        <Route path="/registro-exitoso" element={<RegistroExitoso />} />
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        
      </Routes>
      <Footer />
    </AuthProvider>
  );
}

export default App;
