import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './vivienda.module.css';
import Swal from 'sweetalert2';
import { fetchViviendaById, getRegistroDeudorBcra, updateVivienda } from '../../services/registroService';
import { formatPeriodo } from '../../services/transformDataDto';
import ClasificacionDeudor from '../../componentes/clasificacionDeudor/ClasificacionDeudor';
import FormularioEdicion from '../../componentes/formularioEdicion/FormularioEdicion'; // Componente nuevo que crearemos

const Vivienda = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [viviendaData, setViviendaData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [morosidadData, setMorosidadData] = useState({});
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState(null);

  // Cargar datos iniciales
  const cargarDatos = async () => {
    try {
      setLoading(true);
      const data = await fetchViviendaById(id);
      setViviendaData(data.data);
      setFormData(data.data); // Inicializar datos del formulario
      
      // Código existente para morosidad...
      const morosidadPromises = data.data.habitantes.map(async (habitante) => {
        try {
          const deudorBcra = await getRegistroDeudorBcra(habitante.persona.CUIL_CUIT);
          const morosidadInfo = deudorBcra.results.periodos.map((periodo) => ({
            deuda: periodo.entidades[0].monto,
            entidad: periodo.entidades[0].entidad,
            periodo: periodo.periodo,
            situacion: periodo.entidades[0].situacion,
            procesoJud: periodo.entidades[0].procesoJud,
          }));
          return { idPersona: habitante.persona.idPersona, morosidad: morosidadInfo };
        } catch (error) {
          console.error(`Error al obtener morosidad para ${habitante.persona.CUIL_CUIT}:`, error);
          return { idPersona: habitante.persona.idPersona, morosidad: null };
        }
      });
      
      const morosidadResults = await Promise.all(morosidadPromises);
      const morosidadMap = morosidadResults.reduce((acc, curr) => {
        acc[curr.idPersona] = curr.morosidad;
        return acc;
      }, {});
      setMorosidadData(morosidadMap);
    } catch (error) {
      console.error('Error al cargar los datos:', error);
      Swal.fire('Error', 'No se pudieron cargar los datos del registro', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Manejar cambios en el formulario
  const handleChange = (path, value, index = null) => {
    if (!path || typeof path !== 'string') {
      console.warn("Path inválido:", path);
      return;
    }
  
    setFormData(prev => {
      const newData = structuredClone(prev); // mejor que JSON.parse(JSON.stringify(...))
  
      const keys = path.split('.');
      let current;
  
      if (index !== null) {
        current = newData.habitantes[index];
      } else {
        current = newData;
      }
  
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {};
        current = current[keys[i]];
      }
  
      current[keys[keys.length - 1]] = value;
      return newData;
    });
  };
  

  // Guardar cambios
  const handleSave = async () => {
    try {
      setLoading(true);
      await updateVivienda(id, formData);
      await cargarDatos();
      setEditMode(false);
      Swal.fire('Éxito', 'Los cambios se guardaron correctamente', 'success');
    } catch (error) {
      console.error('Error al guardar:', error);
      Swal.fire('Error', 'No se pudieron guardar los cambios', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Cancelar edición
  const handleCancel = () => {
    setFormData(viviendaData);
    setEditMode(false);
  };

  useEffect(() => {
    cargarDatos();
  }, [id]);

  if (loading) {
    return <div className={styles.loading}>Cargando...</div>;
  }

  if (!viviendaData) {
    return <div className={styles.error}>No se encontraron datos de la vivienda</div>;
  }

  const formatMoney = (amount) => {
    return amount?.toLocaleString('es-AR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Datos de la Vivienda</h2>
        {!editMode && (
          <button 
            onClick={() => setEditMode(true)}
            className={styles.editButton}
          >
            Editar Vivienda
          </button>
        )}
      </div>

      {editMode ? (
        <FormularioEdicion 
          formData={formData}
          onChange={handleChange}
          onSave={handleSave}
          onCancel={handleCancel}
          formatMoney={formatMoney}
        />
      ) : (
        <>
          {/* Vista normal (igual a tu código actual) */}
          <div className={styles.section}>
            <h3>Detalles de la Vivienda</h3>
            {/* ... resto de tu código de visualización ... */}
          </div>
        </>
      )}
    </div>
  );
};

export default Vivienda;