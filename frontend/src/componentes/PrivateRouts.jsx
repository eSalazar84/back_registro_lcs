import { Navigate } from "react-router-dom";
import { AuthContext } from "../auth/AuthContext";
import { useContext } from "react";


const PrivateRoute = ({ children }) => {
  const { token } = useContext(AuthContext);
<<<<<<< HEAD
  console.log("Token en PrivateRoute:", token);  // Asegúrate de que el token esté presente
=======
>>>>>>> db367188ec5cdd42967f2ccf1a81725ac2a20bad
  return token ? children : <Navigate to="/login" />;
};


export default PrivateRoute;
