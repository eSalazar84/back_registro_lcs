import { Navigate } from "react-router-dom";
import { AuthContext } from "../auth/AuthContext";
import { useContext } from "react";


const PrivateRoute = ({ children }) => {
  const { token } = useContext(AuthContext);
  return token ? children : <Navigate to="/login" />;
};


export default PrivateRoute;
