import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../auth/AuthContext";
import { useNavigate } from 'react-router-dom';
import styles from './dashboard.module.css';
import { RegistroContext } from "../context/RegistroConext";
import Swal from 'sweetalert2';
import { jwtDecode } from "jwt-decode";
<<<<<<< HEAD
import * as XLSX from 'xlsx';

const Dashboard = () => {
  const { registros, loading, error, getRegistros } = useContext(RegistroContext);
  const { logout, token } = useContext(AuthContext);
=======
import * as XLSX from 'xlsx'; // Importar la librería xlsx

const Dashboard = () => {
  const { registros, loading, error, getRegistros } = useContext(RegistroContext);
  const { user, logout, token } = useContext(AuthContext);
>>>>>>> db367188ec5cdd42967f2ccf1a81725ac2a20bad
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);

  const [filtros, setFiltros] = useState({
    dni: '',
    apellido: '',
    localidadVivienda: '',
    localidadLote: '',
    numeroRegistro: '',
<<<<<<< HEAD
    tipoPersona: 'Todos'
=======
    tipoPersona: 'Todos' // Nuevo filtro
>>>>>>> db367188ec5cdd42967f2ccf1a81725ac2a20bad
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

<<<<<<< HEAD
        if (decoded.exp < Date.now() / 1000) {
=======
        const currentTime = Date.now() / 1000;
        if (decoded.exp < currentTime) {
>>>>>>> db367188ec5cdd42967f2ccf1a81725ac2a20bad
          Swal.fire({
            icon: 'warning',
            title: 'Sesión expirada',
            text: 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.'
          });
          handleLogout();
        }
<<<<<<< HEAD
=======
        return decoded;
>>>>>>> db367188ec5cdd42967f2ccf1a81725ac2a20bad
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
<<<<<<< HEAD
    decodeToken();
=======
    const checkToken = () => {
      const decoded = decodeToken();
      if (!decoded) {
        handleLogout();
      }
    };
    checkToken();
>>>>>>> db367188ec5cdd42967f2ccf1a81725ac2a20bad
  }, [token]);

  const handleFiltroChange = (e) => {
    const { name, value } = e.target;
<<<<<<< HEAD
    setFiltros(prev => ({ ...prev, [name]: value }));
    setPaginaActual(1);
=======
    setFiltros(prev => ({
      ...prev,
      [name]: value
    }));
>>>>>>> db367188ec5cdd42967f2ccf1a81725ac2a20bad
  };

  const limpiarFiltros = () => {
    setFiltros({
      dni: '',
      apellido: '',
      localidadVivienda: '',
      localidadLote: '',
      numeroRegistro: '',
<<<<<<< HEAD
      tipoPersona: 'Todos'
    });
    setPaginaActual(1);
  };

  const getSafe = (obj, path, def = '-') => {
    return path.split('.').reduce((acc, key) => acc?.[key], obj) ?? def;
  };

  const personasExtendidas = registros?.flatMap(registro =>
    registro.personas.map(persona => ({
      persona,
      vivienda: registro.vivienda,
      lote: registro.lote,
      registroId: registro.idRegistro,
      viviendaId: registro.vivienda?.idVivienda
    }))
  ) || [];

  console.log("personaExtendidas", personasExtendidas);
  

  const personasFiltradas = personasExtendidas.filter(({ persona, vivienda, lote }) => {
    return (
      (!filtros.dni || persona.dni.toLowerCase().includes(filtros.dni.toLowerCase())) &&
      (!filtros.apellido || persona.apellido.toLowerCase().includes(filtros.apellido.toLowerCase())) &&
      (!filtros.numeroRegistro || persona.numero_registro.includes(filtros.numeroRegistro)) &&
      (!filtros.localidadVivienda || vivienda?.localidad?.toLowerCase().includes(filtros.localidadVivienda.toLowerCase())) &&
      (!filtros.localidadLote || lote?.localidad?.toLowerCase().includes(filtros.localidadLote.toLowerCase())) &&
      (filtros.tipoPersona === 'Todos' || persona.titular_cotitular === filtros.tipoPersona)
    );
  });

  const indexLast = paginaActual * registrosPorPagina;
  const indexFirst = indexLast - registrosPorPagina;
  const personasActuales = personasFiltradas.slice(indexFirst, indexLast);
  const totalPaginas = Math.ceil(personasFiltradas.length / registrosPorPagina);

  const descargarExcel = (datos, nombre) => {
=======
      tipoPersona: 'Todos' // Reiniciar el filtro de tipo de persona
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

  // Filtrar registros por tipo (titular, cotitular, conviviente) y ordenar por número de registro
  const registrosFiltrados = registros
    ?.filter(registro => {
      const tipo = getSafeValue(registro, 'persona.titular_cotitular');
      // Aplicar el filtro de tipo de persona
      if (filtros.tipoPersona === 'Todos') {
        return tipo === 'Titular' || tipo === 'Cotitular' || tipo === 'Conviviente';
      } else {
        return tipo === filtros.tipoPersona;
      }
    })
    .sort((a, b) => {
      const numRegA = parseInt(getSafeValue(a, 'persona.numero_registro')) || 0;
      const numRegB = parseInt(getSafeValue(b, 'persona.numero_registro')) || 0;
      return numRegA - numRegB;
    });

  // Aplicar los filtros de búsqueda a los registros ya ordenados
  const registrosFiltradosFinal = registrosFiltrados?.filter(registro => {
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
  const registrosActuales = registrosFiltradosFinal.slice(indexOfFirstRegistro, indexOfLastRegistro);
  const totalPaginas = Math.ceil(registrosFiltradosFinal.length / registrosPorPagina);

  // Función para generar y descargar el archivo Excel
  const descargarExcel = (datos, nombreArchivo) => {
>>>>>>> db367188ec5cdd42967f2ccf1a81725ac2a20bad
    const encabezados = [
      "N° Registro",
      "Apellido",
      "Nombre",
      "DNI",
      "Teléfono",
      "Localidad Lote",
      "Tipo"
    ];

<<<<<<< HEAD
    const filas = datos.map(({ persona, lote }) => [
      persona.numero_registro,
      persona.apellido,
      persona.nombre,
      persona.dni,
      persona.telefono,
      lote?.localidad ?? '-',
      persona.titular_cotitular
    ]);

    const hoja = XLSX.utils.aoa_to_sheet([encabezados, ...filas]);
    const libro = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(libro, hoja, "Personas");
    XLSX.writeFile(libro, `${nombre}.xlsx`);
  };

  const handleEdit = (id) => {
    navigate(`/editar-registro/${id}`);
  };

  const handleVerRegistro = (registroId) => {
    navigate(`/ver-registro/${registroId}`);
  };
  
  if (loading) return <div className={styles.loading}>Cargando...</div>;
  if (error) return <div className={styles.error}>Error: {error}</div>;

=======
    const datosExcel = datos.map((registro) => [
      getSafeValue(registro, "persona.numero_registro"),
      getSafeValue(registro, "persona.apellido"),
      getSafeValue(registro, "persona.nombre"),
      getSafeValue(registro, "persona.dni"),
      getSafeValue(registro, "persona.telefono"),
      getSafeValue(registro, "lote.localidad"),
      getSafeValue(registro, "persona.titular_cotitular")
    ]);

    const hoja = XLSX.utils.aoa_to_sheet([encabezados, ...datosExcel]);
    const libro = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(libro, hoja, "Registros");

    // Generar el archivo y descargarlo
    XLSX.writeFile(libro, `${nombreArchivo}.xlsx`);
  };

>>>>>>> db367188ec5cdd42967f2ccf1a81725ac2a20bad
  return (
    <div className={styles.container}>
      {userData && (
        <div className={styles.header}>
<<<<<<< HEAD
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
=======
          <p className={styles.userInfo}>
            Bienvenido <strong>{userData.adminName}</strong>
          </p>
          <button onClick={handleLogout} className={styles.logoutButton}>
            Cerrar Sesión
          </button>
        </div>
      )}

      <h1 className={styles.title}>Registros de Inscripción</h1>

      <div className={styles.downloadButtons}>
        <button
          onClick={() => descargarExcel(registros, "todos_registros")}
          className={styles.downloadButton}
        >
          Descargar Todos (Excel)
        </button>

        <button
          onClick={() => descargarExcel(registrosFiltradosFinal, "registros_filtrados")}
          className={styles.downloadButton}
        >
          Descargar Filtrados (Excel)
        </button>
      </div>

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
            <option value="">Localidad Hogar</option>
>>>>>>> db367188ec5cdd42967f2ccf1a81725ac2a20bad
            <option value="Benito Juarez">Benito Juárez</option>
            <option value="Barker">Barker</option>
            <option value="Villa Cacique">Villa Cacique</option>
            <option value="Tedín Uriburu">Tedín Uriburu</option>
            <option value="Estación López">Estación López</option>
            <option value="El Luchador">El Luchador</option>
            <option value="Coronel Rodolfo Bunge">Coronel Rodolfo Bunge</option>
          </select>
<<<<<<< HEAD

          <select name="localidadLote" value={filtros.localidadLote} onChange={handleFiltroChange} className={styles.filtroSelect}>
=======
          <select
            name="localidadLote"
            value={filtros.localidadLote}
            onChange={handleFiltroChange}
            className={styles.filtroSelect}
          >
>>>>>>> db367188ec5cdd42967f2ccf1a81725ac2a20bad
            <option value="">Localidad Lote</option>
            <option value="Benito Juárez">Benito Juárez</option>
            <option value="Barker">Barker</option>
            <option value="Tedín Uriburu">Tedín Uriburu</option>
            <option value="El Luchador">El Luchador</option>
          </select>
<<<<<<< HEAD

          <select name="tipoPersona" value={filtros.tipoPersona} onChange={handleFiltroChange} className={styles.filtroSelect}>
=======
          {/* Nuevo filtro de tipo de persona */}
          <select
            name="tipoPersona"
            value={filtros.tipoPersona}
            onChange={handleFiltroChange}
            className={styles.filtroSelect}
          >
>>>>>>> db367188ec5cdd42967f2ccf1a81725ac2a20bad
            <option value="Todos">Todos</option>
            <option value="Titular">Titular</option>
            <option value="Cotitular">Cotitular</option>
            <option value="Conviviente">Conviviente</option>
          </select>
<<<<<<< HEAD

          <button onClick={limpiarFiltros} className={styles.limpiarFiltros}>Limpiar Filtros</button>
        </div>
      </div>

      {/* Tabla */}
=======
          <button
            onClick={limpiarFiltros}
            className={styles.limpiarFiltros}
          >
            Limpiar Filtros
          </button>
        </div>
      </div>

>>>>>>> db367188ec5cdd42967f2ccf1a81725ac2a20bad
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>N° Registro</th>
              <th>Apellido</th>
              <th>Nombre</th>
              <th>DNI</th>
<<<<<<< HEAD
              <th>Teléfono</th>
=======
              <th>Telefono</th>
>>>>>>> db367188ec5cdd42967f2ccf1a81725ac2a20bad
              <th>Localidad Lote</th>
              <th>Tipo</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
<<<<<<< HEAD
            {personasActuales.length > 0 ? personasActuales.map(({ persona, lote, registroId }) => (
              <tr key={persona.idPersona}>
                <td>{persona.numero_registro}</td>
                <td>{persona.apellido}</td>
                <td>{persona.nombre}</td>
                <td>{persona.dni}</td>
                <td>{persona.telefono}</td>
                <td>{lote?.localidad ?? '-'}</td>
                <td>{persona.titular_cotitular}</td>
                <td>
                  <div className={styles.containerButtonAccion}>
                    <button
                      className={styles.viewButton}
                      onClick={() => handleVerRegistro(registroId)}
                    >
                      Ver
                    </button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center' }}>
                  No hay resultados
=======
            {registrosActuales && registrosActuales.length > 0 ? (
              registrosActuales.map((registro) => (
                <tr key={getSafeValue(registro, 'persona.idPersona', 'row-' + Math.random())}>
                  <td>{getSafeValue(registro, 'persona.numero_registro')}</td>
                  <td>{getSafeValue(registro, 'persona.apellido')}</td>
                  <td>{getSafeValue(registro, 'persona.nombre')}</td>
                  <td>{getSafeValue(registro, 'persona.dni')}</td>
                  <td>{getSafeValue(registro, 'persona.telefono')}</td>
                  <td>{getSafeValue(registro, 'lote.localidad')}</td>
                  <td>{getSafeValue(registro, 'persona.titular_cotitular')}</td>
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
                        Ver hogar
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" style={{ textAlign: "center", fontWeight: "bold" }}>
                  No hay registros disponibles
>>>>>>> db367188ec5cdd42967f2ccf1a81725ac2a20bad
                </td>
              </tr>
            )}
          </tbody>
<<<<<<< HEAD

        </table>

        {/* Paginación */}
        <div className={styles.pagination}>
          <button onClick={() => setPaginaActual(paginaActual - 1)} disabled={paginaActual === 1} className={styles.paginationButton}>Anterior</button>
          <span className={styles.paginationInfo}>Página {paginaActual} de {totalPaginas}</span>
          <button onClick={() => setPaginaActual(paginaActual + 1)} disabled={paginaActual === totalPaginas} className={styles.paginationButton}>Siguiente</button>
=======
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
>>>>>>> db367188ec5cdd42967f2ccf1a81725ac2a20bad
        </div>
      </div>
    </div>
  );
};

<<<<<<< HEAD
export default Dashboard;
=======
export default Dashboard;
>>>>>>> db367188ec5cdd42967f2ccf1a81725ac2a20bad
