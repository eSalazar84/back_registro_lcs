import Footer from "./componentes/footer/Footer";
import Formulario from "./componentes/formulario/Formulario";
import Nav from "./componentes/nav/Nav";
import Home from "./pages/Home";
import { Routes, Route } from "react-router-dom"; // ❌ NO IMPORTES Router

function App() {
  return (
    <>
      <Nav />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/registro" element={<Formulario />} />
      </Routes>
      <Footer />
    </>
  );
}

export default App;
