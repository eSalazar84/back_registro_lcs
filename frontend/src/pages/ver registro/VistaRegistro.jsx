// src/pages/VistaRegistro.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './vistaRegistro.module.css'; // reutilizamos estilos
import Swal from 'sweetalert2';
import { fetchRegistroById, updateRegistro, transformarParaBackend, fetchViviendaById, getRegistroDeudorBcra } from '../../services/registroService';
import ClasificacionDeudor from '../../componentes/clasificacionDeudor/ClasificacionDeudor';
import FormularioEdicion from '../../componentes/formularioEdicion/FormularioEdicion';
import { formatPeriodo, formatearPrecio } from '../../services/transformDataDto';

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

      // 1. Cargar el registro completo
      const res = await fetchRegistroById(registroId);
      const registro = res.data;

      setRegistro(registro);
      setFormData(registro);
      console.log('Registro cargado:', registro);

      // 2. Cargar morosidad de cada persona del registro
      const morosidadPromises = registro.personas?.map(async (persona) => {
        const cuit = persona?.CUIL_CUIT;
        const idPersona = persona?.idPersona;

        if (!cuit || !idPersona) return { idPersona, morosidad: null };

        try {
          console.log(`Cargando morosidad para ${cuit}`);
          const deudorBcra = await getRegistroDeudorBcra(cuit);
          const morosidadInfo = deudorBcra?.results?.periodos?.flatMap((periodo) =>
            (periodo.entidades || []).map((entidad) => ({
              deuda: entidad?.monto,
              entidad: entidad?.entidad,
              periodo: periodo?.periodo,
              situacion: entidad?.situacion,
              procesoJud: entidad?.procesoJud,
            }))
          ) || [];


          return { idPersona, morosidad: morosidadInfo };
        } catch (error) {
          console.error(`Error al obtener morosidad para ${cuit}:`, error);
          return { idPersona, morosidad: null };
        }
      }) || [];

      const morosidadResults = await Promise.all(morosidadPromises);
      const morosidadMap = morosidadResults.reduce((acc, curr) => {
        acc[curr.idPersona] = curr.morosidad;
        return acc;
      }, {});

      setMorosidadData(morosidadMap);

    } catch (error) {
      console.error('Error al cargar los datos:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudieron cargar los datos del registro',
      });
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => { cargarDatos(); }, [registroId]);

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
      cargarDatos();
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
        <h2 className={styles.title}>Registro N°{registro.idRegistro}</h2>
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
          {registro.personas && registro.personas.some(p => p.lote) && (
            <div className={styles.section}>
              <h3>Lote</h3>
              {(() => {
                const personaConLote = registro.personas.find(p => p.lote);
                if (!personaConLote) return null;
                return (
                  <>
                    <p><strong>Ubicación del lote a sortear</strong></p>
                    <p><strong>Localidad:</strong> {personaConLote.lote.localidad}</p>
                  </>
                );
              })()}
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
              
              return agrupadas.map(({ vivienda, personas }, index) => {
                const totalIngresosVivienda = personas.reduce((total, persona) => {
                  const ingresosPersona = persona.ingresos || [];
                  return total + ingresosPersona.reduce((sum, ing) => sum + (parseFloat(ing.salario) || 0), 0);
                }, 0);

              return  (
                
                <div key={index} className={styles.viviendaAgrupada}>
                  <div className={styles.viviendaInfo}>
                    <h4>🏠 {vivienda.direccion} {vivienda.numero_direccion} - {vivienda.localidad}</h4>
                    <p><strong>Dormitorios:</strong> {vivienda.cantidad_dormitorios || '-'}</p>
                    <p><strong>Estado:</strong> {vivienda.estado_vivienda || '-'}</p>
                    <p><strong>Alquiler:</strong> {vivienda.alquiler ? 'Sí' : 'No'}</p>
                    {vivienda.alquiler && vivienda.valor_alquiler && (
                      <p><strong>Valor alquiler:</strong> ${vivienda.valor_alquiler}</p>
                    )}
                    <p className={styles.totalIngresos}><strong>Total ingresos del hogar:</strong> {formatearPrecio(totalIngresosVivienda)}</p>
                  </div>

                  <div className={styles.habitantesList}>
                    {personas.map((p) => (
                      <div key={p.idPersona} className={styles.habitanteCard}>
                        <h4>{p.titular_cotitular}: {p.nombre} {p.apellido}</h4>
                        <div className={styles.habitanteInfo}>
                              <p><strong>DNI:</strong> {p.dni}</p>
                              <p><strong>CUIT:</strong> {p.CUIL_CUIT}</p>
                              <p><strong>Email:</strong> {p.email}</p>
                              <p><strong>Teléfono:</strong> {p.telefono}</p>
                              {p.titular_cotitular !== 'Titular' && (
                                <p><strong>Vínculo con el titular:</strong> {p.vinculo || '-'}</p>
                              )}
                            </div>
                        <div className={styles.ingresosSection}>
                              <h5>Ingresos</h5>
                              <p><strong>Total ingresos:</strong> {formatearPrecio(p.ingresos.reduce((sum, ing) => sum + (parseFloat(ing.salario) || 0), 0))}</p>
                              {p.ingresos.length > 0 ? (
                                p.ingresos.map(ing => (
                                  <div key={ing.idIngreso} className={styles.ingresoItem}>
                                    <p><strong>Situación laboral:</strong> {ing.situacion_laboral}</p>
                                    <p><strong>Ocupación:</strong> {ing.ocupacion}</p>
                                    <p><strong>Cuit Empleador:</strong> {ing.CUIT_empleador}</p>
                                    <p><strong>Salario:</strong>{formatearPrecio (ing.salario)}</p>
                                  </div>
                                ))
                              ) : (
                                <p>No registra ingresos</p>
                              )}
                            </div>
                        <div className={styles.morosidadSection}>
                          <h5>Morosidad</h5>
                          {morosidadData[p.idPersona] && morosidadData[p.idPersona].length > 0 ? (
                            <>
                              {morosidadData[p.idPersona].map((info, index) => (
                                <div key={index}>
                                  <p><strong>Ultimo Período Informado:</strong> {formatPeriodo(info.periodo)}</p>
                                  <p><strong>Entidad:</strong> {info.entidad}</p>
                                  <ClasificacionDeudor situacion={info.situacion} />
                                  <p><strong>En Proceso Judicial:</strong> {info.procesoJud ? 'Sí' : 'No'}</p>
                                  <hr />
                                </div>
                              ))}
                            </>
                          ) : (
                            <p>No se pudo obtener la información de morosidad.</p>
                          )}

                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            });
          })()
        }
          </div>
        </>
      )
      }
    </div >
  );
};

export default VistaRegistro;