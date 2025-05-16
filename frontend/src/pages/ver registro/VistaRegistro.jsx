// src/pages/VistaRegistro.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './vistaRegistro.module.css'; // reutilizamos estilos
import Swal from 'sweetalert2';
import { fetchRegistroById, updateRegistro, transformarParaBackend } from '../../services/registroService';
import ClasificacionDeudor from '../../componentes/clasificacionDeudor/ClasificacionDeudor';
import FormularioEdicion from '../../componentes/formularioEdicion/FormularioEdicion';

const VistaRegistro = () => {
  const { registroId } = useParams();
  const navigate = useNavigate();
  const [registro, setRegistro] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState(null);
  const [morosidadData, setMorosidadData] = useState({});
  const [viviendaData, setViviendaData] = useState(null);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const data = await fetchViviendaById(id); // Obtener datos de la vivienda
      console.log('Datos cargados:', data);
      setViviendaData(data.data);
      // Obtener la morosidad de cada habitante
      const morosidadPromises = data.data.habitantes.map(async (habitante) => {
        try {
          const deudorBcra = await getRegistroDeudorBcra(habitante.persona.CUIL_CUIT);
          console.log('Datos deudor bcra:', deudorBcra);
          // Extraer solo los campos necesarios
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
      setMorosidadData(morosidadMap); // Almacenar la morosidad en el estado
    } catch (error) {
      console.error('Error al cargar los datos:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudieron cargar los datos del registro',
      });
    } finally {
      setLoading(false);
    }
  };

  const cargar = async () => {
    try {
      setLoading(true);
      const res = await fetchRegistroById(registroId);
      setRegistro(res.data);
      setFormData(res.data);
      
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'No se pudo cargar el registro', 'error');
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };
 
  useEffect(() => { cargar(); }, [registroId]);

  const handleChange = (path, value) => {
    setFormData(prev => {
      const draft = structuredClone(prev);
      const keys = path.split('.');
      let cur = draft;
      for (let i = 0; i < keys.length - 1; i++) {
        if (!cur[keys[i]]) cur[keys[i]] = {};
        cur = cur[keys[i]];
      }
      cur[keys[keys.length - 1]] = value;
      return draft;
    });
  };

  const handleSave = async () => {
    try {
      setLoading(true);
  
      // 🔁 Convertimos formData a array compatible con backend
      const datosTransformados = transformarParaBackend(formData);
  
      await updateRegistro(registro.idRegistro, datosTransformados);
  
      Swal.fire('Éxito', 'Registro actualizado', 'success');
      setEditMode(false);
      cargar();
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'No se pudo guardar', 'error');
    } finally {
      setLoading(false);
    }
  };
  
  const handleCancel = () => {
    setFormData(registro);
    setEditMode(false);
  };

  if (loading) return <div className={styles.loading}>Cargando...</div>;
  if (!registro) return null;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Registro #{registro.idRegistro}</h2>
        {!editMode && (
          <button onClick={() => setEditMode(true)} className={styles.editButton}>
            Editar Registro
          </button>
        )}
      </div>

      {editMode ? (
        <FormularioEdicion
          formData={formData}
          onChange={handleChange}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      ) : (
        <>
          {/* Lote */}
          {registro.lote && (
            <div className={styles.section}>
              <h3>Lote</h3>
              <p><strong>ID Lote:</strong> {registro.lote.idLote}</p>
              <p><strong>Localidad:</strong> {registro.lote.localidad}</p>
            </div>
          )}

          {/* Viviendas y Personas agrupadas */}
          <div className={styles.section}>
            <h3>Viviendas y Habitantes</h3>
            {(() => {
              const viviendasMap = new Map();

              registro.personas.forEach((persona) => {
                const vivienda = persona.vivienda || {};
                const key = JSON.stringify({
                  direccion: vivienda.direccion || '',
                  numero_direccion: vivienda.numero_direccion || '',
                  localidad: vivienda.localidad || ''
                });

                if (!viviendasMap.has(key)) {
                  viviendasMap.set(key, {
                    vivienda,
                    personas: []
                  });
                }
                viviendasMap.get(key).personas.push(persona);
              });

              const agrupadas = Array.from(viviendasMap.values());

              return agrupadas.map(({ vivienda, personas }, index) => (
                <div key={index} className={styles.viviendaAgrupada}>
                  <div className={styles.viviendaInfo}>
                    <h4>🏠 {vivienda.direccion} {vivienda.numero_direccion} - {vivienda.localidad}</h4>
                    <p><strong>Dormitorios:</strong> {vivienda.cantidad_dormitorios || '-'}</p>
                    <p><strong>Estado:</strong> {vivienda.estado_vivienda || '-'}</p>
                    <p><strong>Alquiler:</strong> {vivienda.alquiler ? 'Sí' : 'No'}</p>
                    {vivienda.alquiler && vivienda.valor_alquiler && (
                      <p><strong>Valor alquiler:</strong> ${vivienda.valor_alquiler}</p>
                    )}
                  </div>

                  <div className={styles.habitantesList}>
                    {personas.map((p) => (
                      <div key={p.idPersona} className={styles.habitanteCard}>
                        <h4>{p.titular_cotitular}: {p.nombre} {p.apellido}</h4>
                        <div className={styles.habitanteInfo}>
                          <p><strong>DNI:</strong> {p.dni}</p>
                          <p><strong>Email:</strong> {p.email}</p>
                          <p><strong>Teléfono:</strong> {p.telefono}</p>
                          <p><strong>Vínculo:</strong> {p.vinculo || '-'}</p>
                        </div>

                        <div className={styles.ingresosSection}>
                          <h5>Ingresos</h5>
                          {p.ingresos.length > 0 ? p.ingresos.map(ing => (
                            <div key={ing.idIngreso} className={styles.ingresoItem}>
                              <p><strong>Situación:</strong> {ing.situacion_laboral}</p>
                              <p><strong>Salario:</strong> ${ing.salario}</p>
                            </div>
                          )) : <p>No registra ingresos</p>}
                        </div>

                        <div className={styles.morosidadSection}>
                  <h5>Morosidad</h5>
                  {morosidadData[p.idPersona] ? (
                    <div>
                      {morosidadData[p.idPersona].map((info, index) => (
                        <div key={index}>
                          <p><strong>Ultimo Período Informado:</strong> {formatPeriodo(info.periodo)}</p>
                          <p><strong>Entidad:</strong> {info.entidad}</p>
                          {/* <p><strong>Deuda:</strong> ${formatMoney(info.deuda) + '.000'}</p> */}
                          <ClasificacionDeudor situacion={info.situacion} />
                          <p><strong>En Proceso Judicial:</strong> {info.procesoJud ? 'Sí' : 'No'}</p>
                          <hr /> {/* Separador entre períodos */}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p>No se pudo obtener la información de morosidad.</p>
                  )}
                </div>
                      </div>
                    ))}
                  </div>
                </div>
              ));
            })()}
          </div>
        </>
      )}
    </div>
  );
};

export default VistaRegistro;
