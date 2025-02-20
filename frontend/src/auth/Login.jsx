import { useState,useContext } from "react";

import { useNavigate } from "react-router-dom";
import { AuthContext } from "../auth/AuthContext";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // const { login } = useAuth();
  const navigate = useNavigate();

  const { login, register} = useContext(AuthContext);


  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      console.log("Redirigiendo a /dashboard");
      navigate("/dashboard");
    } catch (error) {
      console.error("Error de inicio de sesión:", error);
      alert(error.message);
    }
  };

  return (
    <div>
      <h2>Iniciar Sesión</h2>
      <form onSubmit={handleSubmit}>
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input type="password" placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button type="submit">Ingresar</button>
      </form>
    </div>
  );
};

export default Login;
