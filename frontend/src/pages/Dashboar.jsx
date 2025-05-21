import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../auth/AuthContext";
import { useNavigate } from 'react-router-dom';
import styles from './dashboard.module.css';
import { RegistroContext } from "../context/RegistroConext";
import Swal from 'sweetalert2';
import { jwtDecode } from "jwt-decode";

import * as XLSX from 'xlsx';

const Dashboard = () => {
  const { registros, loading, error, getRegistros } = useContext(RegistroContext);
  const { logout, token } = useContext(AuthContext);

  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);

  const [filtros, setFiltros] = useState({
    dni: '',
    apellido: '',
    localidadVivienda: '',
    localidadLote: '',
    numeroRegistro: '',
    tipoPersona: 'Todos'

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

        if (decoded.exp < Date.now() / 1000) {

          Swal.fire({
            icon: 'warning',
            title: 'Sesión expirada',
            text: 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.'
          });
          handleLogout();
        }

      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error al verificar la sesión'
      });
      handleLogout();
    }
  };

  useEffect(() => {
    decodeToken();
  }, [token]);

  const handleFiltroChange = (e) => {
    const { name, value } = e.target;

    setFiltros(prev => ({ ...prev, [name]: value }));
    setPaginaActual(1);

  };

  const limpiarFiltros = () => {
    setFiltros({
      dni: '',
      apellido: '',
      localidadVivienda: '',
      localidadLote: '',
      numeroRegistro: '',
      tipoPersona: 'Todos'
    });
    setPaginaActual(1);
  };

  const personasExtendidas = registros?.flatMap(registro =>
    registro.personas.map(persona => ({
      persona,
      vivienda: registro.vivienda,
      lote: persona.lote,
      personaLote: persona.lote ?? registro.lote,
      registroId: registro.idRegistro,
      viviendaId: registro.vivienda?.idVivienda
    }))
  ) || [];

 const personasFiltradas = personasExtendidas.filter(({ persona, vivienda, lote }) => {
    return (
      (!filtros.dni || persona.dni?.toString().toLowerCase().includes(filtros.dni.toLowerCase())) &&
      (!filtros.apellido || persona.apellido?.toLowerCase().includes(filtros.apellido.toLowerCase())) &&
      (!filtros.numeroRegistro || persona.numero_registro?.toString().includes(filtros.numeroRegistro)) &&
      (!filtros.localidadVivienda || vivienda?.localidad?.toLowerCase().includes(filtros.localidadVivienda.toLowerCase())) &&
      (!filtros.localidadLote || persona.lote?.localidad?.toLowerCase().includes(filtros.localidadLote.toLowerCase())) &&
      (filtros.tipoPersona === 'Todos' || persona.titular_cotitular === filtros.tipoPersona)
    );
  });

  const indexLast = paginaActual * registrosPorPagina;
  const indexFirst = indexLast - registrosPorPagina;
  const personasActuales = personasFiltradas.slice(indexFirst, indexLast);
  const totalPaginas = Math.ceil(personasFiltradas.length / registrosPorPagina);

  const descargarExcel = (datos, nombre) => {

    const encabezados = [
      "N° Registro",
      "Apellido",
      "Nombre",
      "DNI",
      "Teléfono",
      "Localidad Lote",
      "Tipo"
    ];

    const filas = datos.map(({ persona, lote }) => [
      persona.numero_registro,
      persona.apellido,
      persona.nombre,
      persona.dni,
      persona.telefono,
      lote?.localidad ?? '-----------',
      persona.titular_cotitular
    ]);

    const hoja = XLSX.utils.aoa_to_sheet([encabezados, ...filas]);
    const libro = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(libro, hoja, "Personas");
    XLSX.writeFile(libro, `${nombre}.xlsx`);
  };

   const handleVerRegistro = (registroId) => {
    navigate(`/ver-registro/${registroId}`);
  };
  
  if (loading) return <div className={styles.loading}>Cargando...</div>;
  if (error) return <div className={styles.error}>Error: {error}</div>;


  return (
    <div className={styles.container}>
      {userData && (
        <div className={styles.header}>

          <p>Bienvenido <strong>{userData.adminName}</strong></p>
          <button onClick={handleLogout} className={styles.logoutButton}>Cerrar Sesión</button>
        </div>
      )}

      <h1 className={styles.title}>Personas Registradas</h1>

      <div className={styles.downloadButtons}>
        <button onClick={() => descargarExcel(personasExtendidas, "todas_personas")} className={styles.downloadButton}>
          Descargar Todas (Excel)
        </button>
        <button onClick={() => descargarExcel(personasFiltradas, "personas_filtradas")} className={styles.downloadButton}>
          Descargar Filtradas (Excel)
        </button>
      </div>

      {/* Filtros */}
      <div className={styles.filtrosContainer}>
        <div className={styles.filtroGroup}>
          <input name="numeroRegistro" placeholder="N° Registro" value={filtros.numeroRegistro} onChange={handleFiltroChange} className={styles.filtroInput} />
          <input name="dni" placeholder="DNI" value={filtros.dni} onChange={handleFiltroChange} className={styles.filtroInput} />
          <input name="apellido" placeholder="Apellido" value={filtros.apellido} onChange={handleFiltroChange} className={styles.filtroInput} />
          <select name="localidadVivienda" value={filtros.localidadVivienda} onChange={handleFiltroChange} className={styles.filtroSelect}>
            <option value="">Localidad Vivienda</option>
            <option value="Benito Juarez">Benito Juárez</option>
            <option value="Barker">Barker</option>
            <option value="Villa Cacique">Villa Cacique</option>
            <option value="Tedín Uriburu">Tedín Uriburu</option>
            <option value="Estación López">Estación López</option>
            <option value="El Luchador">El Luchador</option>
            <option value="Coronel Rodolfo Bunge">Coronel Rodolfo Bunge</option>
          </select>
          <select name="localidadLote" value={filtros.localidadLote} onChange={handleFiltroChange} className={styles.filtroSelect}>
            <option value="">Localidad Lote</option>
            <option value="Benito Juárez">Benito Juárez</option>
            <option value="Barker">Barker</option>
            <option value="Tedín Uriburu">Tedín Uriburu</option>
            <option value="El Luchador">El Luchador</option>
          </select>
          <select name="tipoPersona" value={filtros.tipoPersona} onChange={handleFiltroChange} className={styles.filtroSelect}>
            <option value="Todos">Todos</option>
            <option value="Titular">Titular</option>
            <option value="Cotitular">Cotitular</option>
            <option value="Conviviente">Conviviente</option>
          </select>

          <button onClick={limpiarFiltros} className={styles.limpiarFiltros}>Limpiar Filtros</button>
        </div>
      </div>

      {/* Tabla */}

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>N° Registro</th>
              <th>Apellido</th>
              <th>Nombre</th>
              <th>DNI</th>
              <th>Teléfono</th>
              <th>Localidad Lote</th>
              <th>Tipo</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>

            {personasActuales.length > 0 ? personasActuales.map(({ persona, lote, registroId }) => (
              <tr key={persona.idPersona}>                
                <td>{persona.numero_registro}</td>
                <td>{persona.apellido}</td>
                <td>{persona.nombre}</td>
                <td>{persona.dni}</td>
                <td>{persona.telefono}</td>
                <td>{lote?.localidad ?? '-----------'}</td>
                <td>{persona.titular_cotitular}</td>
                <td>
                  <div className={styles.containerButtonAccion}>
                    <button
                      className={styles.viewButton}
                      onClick={() => handleVerRegistro(registroId)}
                    >
                      Ver Registro
                    </button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center' }}>
                  No hay resultados

                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Paginación */}
        <div className={styles.pagination}>
          <button onClick={() => setPaginaActual(paginaActual - 1)} disabled={paginaActual === 1} className={styles.paginationButton}>Anterior</button>
          <span className={styles.paginationInfo}>Página {paginaActual} de {totalPaginas}</span>
          <button onClick={() => setPaginaActual(paginaActual + 1)} disabled={paginaActual === totalPaginas} className={styles.paginationButton}>Siguiente</button>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;

