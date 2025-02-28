import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../auth/AuthContext";
import { useNavigate } from 'react-router-dom';
import styles from './dashboard.module.css';
import { RegistroContext } from "../context/RegistroConext";
import Swal from 'sweetalert2';
import { jwtDecode } from "jwt-decode";

const Dashboard = () => {
  const { registros, loading, error, getRegistros } = useContext(RegistroContext);
  const { user, logout, token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);

  const [filtros, setFiltros] = useState({
    dni: '',
    apellido: '',
    localidadVivienda: '',
    localidadLote: '',
    numeroRegistro: ''
  });

  const [paginaActual, setPaginaActual] = useState(1);
  const registrosPorPagina = 10;

  useEffect(() => {
    getRegistros();
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const decodeToken = () => {
    try {
      if (token) {
        const decoded = jwtDecode(token);
        setUserData(decoded);
        console.log('Token decodificado:', decoded);

        const currentTime = Date.now() / 1000;
        if (decoded.exp < currentTime) {
          Swal.fire({
            icon: 'warning',
            title: 'Sesión expirada',
            text: 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.'
          });
          handleLogout();
        }
        return decoded;
      }
    } catch (error) {
      console.error('Error al decodificar el token:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error al verificar la sesión'
      });
      handleLogout();
    }
  };

  useEffect(() => {
    const checkToken = () => {
      const decoded = decodeToken();
      if (!decoded) {
        handleLogout();
      }
    };
    checkToken();
  }, [token]);

  const handleFiltroChange = (e) => {
    const { name, value } = e.target;
    setFiltros(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const limpiarFiltros = () => {
    setFiltros({
      dni: '',
      apellido: '',
      localidadVivienda: '',
      localidadLote: '',
      numeroRegistro: ''
    });
  };

  const getSafeValue = (obj, path, defaultValue = '-') => {
    try {
      const value = path.split('.').reduce((acc, curr) => acc?.[curr], obj);
      return value?.toString() ?? defaultValue;
    } catch (error) {
      return defaultValue;
    }
  };
  // Filtrar primero los titulares y ordenarlos por número de registro
const registrosTitulares = registros
?.filter(registro => getSafeValue(registro, 'persona.titular_cotitular') === 'Titular')
.sort((a, b) => {
  const numRegA = parseInt(getSafeValue(a, 'persona.numero_registro')) || 0;
  const numRegB = parseInt(getSafeValue(b, 'persona.numero_registro')) || 0;
  return numRegA - numRegB;
});

// Aplicar los filtros de búsqueda a los registros ya ordenados
const registrosFiltrados = registrosTitulares?.filter(registro => {
return (
  (!filtros.dni || getSafeValue(registro, 'persona.dni').toLowerCase().includes(filtros.dni.toLowerCase())) &&
  (!filtros.apellido || getSafeValue(registro, 'persona.apellido').toLowerCase().includes(filtros.apellido.toLowerCase())) &&
  (!filtros.localidadVivienda || getSafeValue(registro, 'vivienda.localidad').toLowerCase().includes(filtros.localidadVivienda.toLowerCase())) &&
  (!filtros.localidadLote || getSafeValue(registro, 'lote.localidad').toLowerCase().includes(filtros.localidadLote.toLowerCase())) &&
  (!filtros.numeroRegistro || getSafeValue(registro, 'persona.numero_registro').includes(filtros.numeroRegistro))
);
});

 
  const calcularTotalIngresos = (ingresos) => {
    if (!Array.isArray(ingresos)) return 0;
    return ingresos.reduce((total, ingreso) =>
      total + (Number(ingreso?.salario) || 0), 0
    );
  };

  const handleEdit = (id) => {
    navigate(`/editar-registro/${id}`);
  };

  const handleVivienda = (id) => {
    navigate(`/vivienda/${id}`);
  };
  if (loading) return <div className={styles.loading}>Cargando...</div>;
  if (error) return <div className={styles.error}>Error: {error}</div>;


  const indexOfLastRegistro = paginaActual * registrosPorPagina;
  const indexOfFirstRegistro = indexOfLastRegistro - registrosPorPagina;
  const registrosActuales = registrosFiltrados.slice(indexOfFirstRegistro, indexOfLastRegistro);
  const totalPaginas = Math.ceil(registrosFiltrados.length / registrosPorPagina);

  

  return (
    <div className={styles.container}>
      {userData && (
        <div className={styles.header}>
          <p className={styles.userInfo}>
            Bienvenido <strong>{userData.adminName}</strong>
          </p>
          <button onClick={handleLogout} className={styles.logoutButton}>
            Cerrar Sesión
          </button>
        </div>
      )}

      <h1 className={styles.title}>Registros de Inscripción</h1>

      <div className={styles.filtrosContainer}>
        <div className={styles.filtroGroup}>
          <input
            type="text"
            name="numeroRegistro"
            placeholder="N° de Registro"
            value={filtros.numeroRegistro}
            onChange={handleFiltroChange}
            className={styles.filtroInput}
          />
          <input
            type="text"
            name="dni"
            placeholder="Filtrar por DNI"
            value={filtros.dni}
            onChange={handleFiltroChange}
            className={styles.filtroInput}
          />
          <input
            type="text"
            name="apellido"
            placeholder="Filtrar por Apellido"
            value={filtros.apellido}
            onChange={handleFiltroChange}
            className={styles.filtroInput}
          />
          <select
            name="localidadVivienda"
            value={filtros.localidadVivienda}
            onChange={handleFiltroChange}
            className={styles.filtroSelect}
          >
            <option value="">Localidad Vivienda</option>
            <option value="Benito Juarez">Benito Juárez</option>
            <option value="Barker">Barker</option>
            <option value="Villa Cacique">Villa Cacique</option>
            <option value="Tedín Uriburu">Tedín Uriburu</option>
            <option value="Estación López">Estación López</option>

            <option value="El Luchador">El Luchador</option>
            <option value="Coronel Rodolfo Bunge">Coronel Rodolfo Bunge</option>
          </select>
          <select
            name="localidadLote"
            value={filtros.localidadLote}
            onChange={handleFiltroChange}
            className={styles.filtroSelect}
          >
            <option value="">Localidad Lote</option>
            <option value="Benito Juarez">Benito Juárez</option>
            <option value="Barker">Barker</option>
            <option value="Tedín Uriburu">Tedín Uriburu</option>
            <option value="El Luchador">El Luchador</option>
          </select>
          <button
            onClick={limpiarFiltros}
            className={styles.limpiarFiltros}
          >
            Limpiar Filtros
          </button>
        </div>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>N° Registro</th>
              <th>Apellido</th>
              <th>Nombre</th>
              <th>DNI</th>
              <th>Telefono</th>
              <th>Localidad Lote</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {registrosActuales
              ?.filter(registro => getSafeValue(registro, 'persona.titular_cotitular') === 'Titular')
              .map((registro) => (
                <tr key={getSafeValue(registro, 'persona.idPersona', 'row-' + Math.random())}>
                  <td>{getSafeValue(registro, 'persona.numero_registro')}</td>
                  <td>{getSafeValue(registro, 'persona.apellido')}</td>
                  <td>{getSafeValue(registro, 'persona.nombre')}</td>
                  <td>{getSafeValue(registro, 'persona.dni')}</td>
                  <td>{getSafeValue(registro, 'persona.telefono')}</td>
                  <td>{getSafeValue(registro, 'lote.localidad')}</td>
                  <td>
                    <div className={styles.containerButtonAccion}>
                      <button
                        className={styles.editButton}
                        onClick={() => handleEdit(getSafeValue(registro, 'persona.idPersona'))}
                      >
                        Editar
                      </button>
                      <button
                        className={styles.viviendaButton}
                        onClick={() => handleVivienda(getSafeValue(registro, 'vivienda.idVivienda'))}
                      >
                        Ver vivienda
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
        <div className={styles.pagination}>
          <button
            className={styles.paginationButton}
            onClick={() => setPaginaActual(paginaActual - 1)}
            disabled={paginaActual === 1}
          >
            Anterior
          </button>
          <span className={styles.paginationInfo}>
            Página {paginaActual} de {totalPaginas}
          </span>
          <button
            className={styles.paginationButton}
            onClick={() => setPaginaActual(paginaActual + 1)}
            disabled={paginaActual === totalPaginas}
          >
            Siguiente
          </button>
        </div>

      </div>
    </div>
  );
};
export default Dashboard;
