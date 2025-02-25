import { createContext, useContext, useState } from "react";
import { fetchRegistros, fetchRegistroById, updateRegistroById } from "../services/registroService";


export const RegistroContext = createContext();

export const RegistroProvider = ({ children }) => {
  const [registros, setRegistros] = useState([]);
  const [registro, setRegistro] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getRegistros = async () => {
    setLoading(true);
    try {
      const data = await fetchRegistros();
      setRegistros(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getRegistroById = async (id) => {
    setLoading(true);
    try {
      const data = await fetchRegistroById(id);
      setRegistro(data);
     
    } catch (err) {
      setError(err.message);
    console.error('Error:', err.message);

    } finally {
      setLoading(false);
    }
  };

  const editRegistro = async (id, data) => {
    setLoading(true);
    try {
      const updatedData = await updateRegistroById(id, data);
      setRegistro(updatedData);
      await getRegistros(); // Recargar la lista
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <RegistroContext.Provider value={{ registros, registro, loading, error, getRegistros, getRegistroById, editRegistro }}>
      {children}
    </RegistroContext.Provider>
  );
};


