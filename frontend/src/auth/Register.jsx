import { useState } from "react";
import { useContext } from "react";

import { useNavigate } from "react-router-dom";
import { registerUser } from "../api/authApi";
import { AuthContext } from "../auth/AuthContext";


const Register = () => {
  const [adminName, setAdminName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
 
  const navigate = useNavigate();
  const { login, register} = useContext(AuthContext);


  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log("registro", adminName, email,password);
      
      await registerUser(adminName, email, password);
    
      navigate("/dashboard");
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div>
      <h2>Registro</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="Nombre de usuario" value={adminName} onChange={(e) => setAdminName(e.target.value)} />
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input type="password" placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button type="submit">Registrar</button>
      </form>
    </div>
  );
};

export default Register;
