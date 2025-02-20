import { useContext } from "react";

import { useNavigate } from "react-router-dom";
import { AuthContext } from "../auth/AuthContext";


const Dashboard = () => {
  
    const { user, logout} = useContext(AuthContext);
  
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div>
      <h2>Bienvenido al Dashboard</h2>
      {user && <p>Usuario: {user.adminName} ({user.email})</p>}
      <button onClick={handleLogout}>Cerrar Sesión</button>
    </div>
  );
};

export default Dashboard;
