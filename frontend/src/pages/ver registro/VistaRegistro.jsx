// src/pages/VistaRegistro.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './vistaRegistro.module.css';
import Swal from 'sweetalert2';
import { fetchRegistroById, updateRegistro } from '../../services/registroService';
import ClasificacionDeudor from '../../componentes/clasificacionDeudor/ClasificacionDeudor';
import FormularioEdicion from '../../componentes/formularioEdicion/FormularioEdicion';

const VistaRegistro = () => {
  const { registroId } = useParams();
  const navigate = useNavigate();
  const [registro, setRegistro] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState(null);

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

  useEffect(() => {
    cargar();
  }, [registroId]);

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
      const payload = formData.personas.map(persona => {
        return {
          persona,
          ingresos: persona.ingresos || [],
          vivienda: persona.vivienda || null,
          lote: formData.lote || null,
        };
      });

      await updateRegistro(registro.idRegistro, payload);
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
            {
              (() => {
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

                  return (
                    <div key={index} className={styles.viviendaAgrupada}>
                      <div className={styles.viviendaInfo}>
                        <h4>🏠 Dirección: {vivienda.direccion} {vivienda.numero_direccion}</h4>
                        <h4>Localidad: {vivienda.localidad}</h4>
                        <p><strong>Dormitorios:</strong> {vivienda.cantidad_dormitorios || '-'}</p>
                        <p><strong>Estado:</strong> {vivienda.estado_vivienda || '-'}</p>
                        <p><strong>Alquiler:</strong> {vivienda.alquiler ? 'Sí' : 'No'}</p>
                        {vivienda.alquiler && vivienda.valor_alquiler && (
                          <p><strong>Valor alquiler:</strong> ${vivienda.valor_alquiler}</p>
                        )}
                        <p className={styles.totalIngresos}><strong>Total ingresos del hogar:</strong> ${totalIngresosVivienda}</p>
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
                              <p><strong>Total ingresos:</strong> ${p.ingresos.reduce((sum, ing) => sum + (parseFloat(ing.salario) || 0), 0)}</p>
                              {p.ingresos.length > 0 ? (
                                p.ingresos.map(ing => (
                                  <div key={ing.idIngreso} className={styles.ingresoItem}>
                                    <p><strong>Situación laboral:</strong> {ing.situacion_laboral}</p>
                                    <p><strong>Ocupación:</strong> {ing.ocupacion}</p>
                                    <p><strong>Cuit Empleador:</strong> {ing.CUIT_empleador}</p>
                                    <p><strong>Salario:</strong> ${ing.salario}</p>
                                  </div>
                                ))
                              ) : (
                                <p>No registra ingresos</p>
                              )}
                            </div>

                            <div className={styles.morosidadSection}>
                              {p.morosidad ? (
                                <ClasificacionDeudor situacion={p.morosidad} />
                              ) : (
                                <p className={styles.sinMorosidad}>Sin información de morosidad</p>
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
      )}
    </div>
  );
};

export default VistaRegistro;
