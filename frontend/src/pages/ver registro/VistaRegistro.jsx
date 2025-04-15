// src/pages/VistaRegistro.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './vistaRegistro.module.css'; // reutilizamos estilos
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

  console.log(registroId);
  
  // cargar datos
  const cargar = async () => {
    try {
      setLoading(true);
      const res = await fetchRegistroById(registroId);
      console.log(res);
      
      setRegistro(res);
      setFormData(res);
    } catch (err) {
      console.error(err);
      Swal.fire('Error','No se pudo cargar el registro','error');
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };

  console.log("registro", registro);
  console.log("formData:", formData);

  

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
      await updateRegistro(registro.idRegistro, formData);
      Swal.fire('Éxito','Registro actualizado','success');
      setEditMode(false);
      cargar();
    } catch(err) {
      console.error(err);
      Swal.fire('Error','No se pudo guardar','error');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData(registro);
    setEditMode(false);
  };

  if(loading) return <div className={styles.loading}>Cargando...</div>;
  if(!registro) return null;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Registro #{registro.idRegistro}</h2>
        {!editMode && (
          <button onClick={()=>setEditMode(true)} className={styles.editButton}>
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
          {/* Vivienda */}
          <div className={styles.section}>
            <h3>Vivienda</h3>
            <div className={styles.viviendaInfo}>
              <p><strong>Dirección:</strong> {registro.vivienda.direccion} #{registro.vivienda.numero_direccion}</p>
              <p><strong>Localidad:</strong> {registro.vivienda.localidad}</p>
              <p><strong>Alquiler:</strong> {registro.vivienda.alquiler ? 'Sí' : 'No'}</p>
              {registro.vivienda.alquiler && (
                <p><strong>Valor:</strong> ${registro.vivienda.valor_alquiler}</p>
              )}
            </div>
          </div>

          {/* Lote */}
          {registro.lote && (
            <div className={styles.section}>
              <h3>Lote</h3>
              <p><strong>ID Lote:</strong> {registro.lote.idLote}</p>
              <p><strong>Localidad:</strong> {registro.lote.localidad}</p>
            </div>
          )}

          {/* Personas */}
          <div className={styles.section}>
            <h3>Personas</h3>
            <div className={styles.habitantesList}>
              {registro.personas.map((p, i) => (
                <div key={p.idPersona} className={styles.habitanteCard}>
                  <h4>{p.titular_cotitular}: {p.nombre} {p.apellido}</h4>
                  <div className={styles.habitanteInfo}>
                    <p><strong>DNI:</strong> {p.dni}</p>
                    <p><strong>Email:</strong> {p.email}</p>
                    <p><strong>Teléfono:</strong> {p.telefono}</p>
                    <p><strong>Vínculo:</strong> {p.vinculo || '-'}</p>
                  </div>

                  {/* Ingresos */}
                  <div className={styles.ingresosSection}>
                    <h5>Ingresos</h5>
                    {p.ingresos.length > 0 ? p.ingresos.map(ing => (
                      <div key={ing.idIngreso} className={styles.ingresoItem}>
                        <p><strong>Situación:</strong> {ing.situacion_laboral}</p>
                        <p><strong>Salario:</strong> ${ing.salario}</p>
                      </div>
                    )) : <p>No registra ingresos</p>}
                  </div>

                  {/* Morosidad */}
                  {p.morosidad && (
                    <div className={styles.morosidadSection}>
                      <ClasificacionDeudor morosidad={p.morosidad} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default VistaRegistro;
