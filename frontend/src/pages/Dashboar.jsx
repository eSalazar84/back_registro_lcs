import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../auth/AuthContext";
import { useNavigate } from 'react-router-dom';
import styles from './dashboard.module.css';
import { RegistroContext } from "../context/RegistroConext";
import Swal from 'sweetalert2';

const Dashboard = () => {
  const { registros, loading, error, getRegistros } = useContext(RegistroContext);
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  // Estado para los filtros
  const [filtros, setFiltros] = useState({
    dni: '',
    apellido: '',
    localidadVivienda: '',
    localidadLote: '',
    numeroRegistro: ''
  });

  useEffect(() => {
    getRegistros();
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Función para manejar cambios en los filtros
  const handleFiltroChange = (e) => {
    const { name, value } = e.target;
    setFiltros(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Función para limpiar filtros
  const limpiarFiltros = () => {
    setFiltros({
      dni: '',
      apellido: '',
      localidadVivienda: '',
      localidadLote: '',
      numeroRegistro: ''
    });
  };

  // Función auxiliar para manejar valores nulos
  // Modifica la función getSafeValue para asegurar que siempre devuelva un string
  const getSafeValue = (obj, path, defaultValue = '-') => {
    try {
      const value = path.split('.').reduce((acc, curr) => acc?.[curr], obj);
      // Convertir el valor a string de manera segura
      return value?.toString() ?? defaultValue;
    } catch (error) {
      return defaultValue;
    }
  };

  // Modifica la función de filtrado
  const registrosFiltrados = registros?.filter(registro => {
    return (
      (!filtros.numeroRegistro || getSafeValue(registro, 'persona.numero_registro').includes(filtros.numeroRegistro)) &&
      (!filtros.dni || getSafeValue(registro, 'persona.dni').toLowerCase().includes(filtros.dni.toLowerCase())) &&
      (!filtros.apellido || getSafeValue(registro, 'persona.apellido').toLowerCase().includes(filtros.apellido.toLowerCase())) &&
      (!filtros.localidadVivienda || getSafeValue(registro, 'vivienda.localidad').toLowerCase().includes(filtros.localidadVivienda.toLowerCase())) &&
      (!filtros.localidadLote || getSafeValue(registro, 'lote.localidad').toLowerCase().includes(filtros.localidadLote.toLowerCase()))
    );
  });

  // Función para calcular el total de ingresos
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

  return (
    <div className={styles.container}>
      {user && (
        <div className={styles.header}>
          <p className={styles.userInfo}>
            Usuario logueado: <strong>{user.nombre}</strong>
          </p>
          <button onClick={handleLogout} className={styles.logoutButton}>
            Cerrar Sesión
          </button>
        </div>
      )}

      <h1 className={styles.title}>Registros de Inscripción</h1>

      {/* Sección de filtros */}
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
              <th>CUIL/CUIT</th>
              <th>Localidad Vivienda</th>
              <th>Dirección</th>
              <th>Localidad Lote</th>
              <th>Total Ingresos</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {registrosFiltrados?.map((registro) => (
              <tr key={getSafeValue(registro, 'persona.idPersona', 'row-' + Math.random())}>
                <td>{getSafeValue(registro, 'persona.numero_registro')}</td>
                <td>{getSafeValue(registro, 'persona.apellido')}</td>
                <td>{getSafeValue(registro, 'persona.nombre')}</td>
                <td>{getSafeValue(registro, 'persona.dni')}</td>
                <td>{getSafeValue(registro, 'persona.CUIL_CUIT')}</td>
                <td>{getSafeValue(registro, 'vivienda.localidad')}</td>
                <td>{`${getSafeValue(registro, 'vivienda.direccion')} ${getSafeValue(registro, 'vivienda.numero_direccion')}`}</td>
                <td>{getSafeValue(registro, 'lote.localidad')}</td>
                <td>
                  ${calcularTotalIngresos(registro?.ingresos).toLocaleString('es-AR')}
                </td>
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
                  onClick={()=> handleVivienda(getSafeValue(registro,'vivienda.idVivienda'))}
                  >
                  Ver vivienda
                </button>
                 </div>
              </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
    </div >
  );
};

export default Dashboard;