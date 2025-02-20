import { Navigate } from "react-router-dom";
import { AuthContext } from "../auth/AuthContext";
import { useContext } from "react";


const PrivateRoute = ({ children }) => {
  const { token } = useContext(AuthContext);
  console.log("Token en PrivateRoute:", token);  // Asegúrate de que el token esté presente
  return token ? children : <Navigate to="/login" />;
};


export default PrivateRoute;
