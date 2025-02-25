import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './editarRegistro.module.css';
import Swal from 'sweetalert2';
import { fetchRegistroById } from '../../services/registroService';
import { updateRegistroById } from '../../services/registroService';
import { transformarDatos } from '../../services/transformDataDto';

const EditarRegistro = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState(null);

  console.log("id", id);

  // Función para cargar los datos del registro
  const cargarDatos = async () => {
    try {
      setLoading(true);
      const data = await fetchRegistroById(id); // Llama a fetchRegistroById directamente
      console.log('Datos cargados:', data);
      setFormData(data.data); // Se pasa directamente el objeto 'data'
    } catch (error) {
      console.error('Error al cargar los datos:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudieron cargar los datos del registro'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, [id]);

  // Manejador genérico de cambios para todos los campos
  const handleChange = (section, e) => {
    const { name, value, type } = e.target;

    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [name]: type === 'checkbox' ? e.target.checked : value || '' // Asegurarse de que el valor vacío se maneje correctamente
      }
    }));
  };


  // Manejador específico para ingresos (debido a ser un array de objetos)
  const handleIngresoChange = (index, e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      ingresos: prev.ingresos.map((ingreso, i) =>
        i === index ? { ...ingreso, [name]: value } : ingreso
      )
    }));
  };

  const addIngreso = () => {
    setFormData(prev => ({
      ...prev,
      ingresos: [...prev.ingresos, {
        situacion_laboral: '',
        ocupacion: '',
        CUIT_empleador: '',
        salario: ''
      }]
    }));
  };

  const removeIngreso = (index) => {
    if (formData.ingresos.length > 1) {
      setFormData(prev => ({
        ...prev,
        ingresos: prev.ingresos.filter((_, i) => i !== index)
      }));
    }
  };

  // Función para manejar el submit del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Asegúrate de que cada ingreso mantenga su idIngreso
      const datosTransformados = formData.ingresos.map(ingreso => ({
        ...ingreso, // Mantener todos los datos del ingreso
        idIngreso: ingreso.idIngreso // Asegurarse de que el idIngreso se incluya
      }));
  
      // Agregar otros datos si es necesario
      const datosParaEnviar = {
        ...formData, // Los demás datos del formulario
        ingresos: datosTransformados, // Los ingresos con el idIngreso intacto
      };
  
      console.log("Datos transformados a enviar:", datosParaEnviar);
  
      // Llama a la función updateRegistroById con los datos transformados
      const response = await updateRegistroById(id, datosParaEnviar);
      console.log("Respuesta de la actualización:", response);
  
      // Verifica si la respuesta es exitosa
      if (response && response.status === 200) {
        Swal.fire({
          icon: 'success',
          title: 'Éxito',
          text: 'Registro actualizado correctamente'
        });
        navigate('/dashboard');
      } else {
        throw new Error(response.message || 'Error desconocido');
      }
    } catch (error) {
      console.error('Error al actualizar:', error);
  
      // Verifica si el error es de tipo "Conflict" o "InternalServerError"
      if (error.response && error.response.status === 409) {
        Swal.fire({
          icon: 'error',
          title: 'Error de Conflicto',
          text: error.response.message || 'El registro ya existe o hay un conflicto con los datos.'
        });
      } else if (error.response && error.response.status === 500) {
        Swal.fire({
          icon: 'error',
          title: 'Error Interno del Servidor',
          text: error.response.message || 'Hubo un problema en el servidor al procesar la solicitud.'
        });
      } else {
        // Si el error no es de los esperados, muestra un error genérico
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.message || 'Ha ocurrido un error inesperado.'
        });
      }
    }
  };
  

  // Mientras cargamos los datos
  // if (loading) {
  //   return <div className={styles.loading}>Cargando datos...</div>;
  // }

  // Si no se encontraron datos
  if (!formData) {
    return <div className={styles.noData}>No se encontraron datos</div>;
  }

  return (
    <form onSubmit={handleSubmit} className={styles.container}>
      <h2>Editar Registro</h2>

      {/* Sección Datos Personales */}
      <div className={styles.section}>
        <h3>Datos Personales</h3>
        <div className={styles.inputGroup}>
          <label className={styles.label}>
            <span>Nombres:</span>
            <input
              type="text"
              name="nombre"
              value={formData.persona.nombre}
              onChange={(e) => handleChange('persona', e)}
              className={styles.input}
            />
          </label>

          <label className={styles.label}>
            <span>Apellido:</span>
            <input
              type="text"
              name="apellido"
              value={formData.persona.apellido}
              onChange={(e) => handleChange('persona', e)}
              className={styles.input}
            />
          </label>

          <label className={styles.label}>
            <span>DNI:</span>
            <input
              type="text"
              name="dni"
              value={formData.persona.dni}
              onChange={(e) => handleChange('persona', e)}
              className={styles.input}
              maxLength="8"
            />
          </label>

          <label className={styles.label}>
            <span>CUIL/CUIT:</span>
            <input
              type="text"
              name="CUIL_CUIT"
              value={formData.persona.CUIL_CUIT}
              onChange={(e) => handleChange('persona', e)}
              className={styles.input}
              maxLength="11"
            />
          </label>

          <label className={styles.label}>
            <span>Email:</span>
            <input
              type="email"
              name="email"
              value={formData.persona.email ?? ''}
              onChange={(e) => handleChange('persona', e)}
              className={styles.input}
            />
          </label>

          <label className={styles.label}>
            <span>Teléfono:</span>
            <input
              type="text"
              name="telefono"
              value={formData.persona.telefono}
              onChange={(e) => handleChange('persona', e)}
              className={styles.input}
            />
          </label>

          <label className={styles.label}>
            <span>Estado Civil:</span>
            <select
              name="estado_civil"
              value={formData.persona.estado_civil}
              onChange={(e) => handleChange('persona', e)}
              className={styles.select}
            >
              <option value="">Seleccione estado civil</option>
              <option value="Soltero/a">Soltero/a</option>
              <option value="Casado/a">Casado/a</option>
              <option value="Divorciado/a">Divorciado/a</option>
              <option value="Viudo/a">Viudo/a</option>
              <option value="Concubinato">Concubinato</option>
            </select>
          </label>

          <label className={styles.label}>
            <span>Nacionalidad:</span>
            <select
              name="nacionalidad"
              value={formData.persona.nacionalidad}
              onChange={(e) => handleChange('persona', e)}
              className={styles.select}
            >
              <option value="">Seleccione nacionalidad</option>
              <option value="Argentina">Argentina</option>
              <option value="Chilena">Chilena</option>
              <option value="Uruguaya">Uruguaya</option>
              <option value="Paraguaya">Paraguaya</option>
              <option value="Boliviana">Boliviana</option>
              <option value="Brasileña">Brasileña</option>
              <option value="Otra">Otra</option>
            </select>
          </label>
        </div>
      </div>

      {/* Sección Vivienda */}
      <div className={styles.section}>
        <h3>Datos de la Vivienda</h3>
        <div className={styles.inputGroup}>
          <label className={styles.label}>
            <span>Dirección:</span>
            <input
              type="text"
              name="direccion"
              value={formData.vivienda.direccion}
              onChange={(e) => handleChange('vivienda', e)}
              className={styles.input}
            />
          </label>

          <label className={styles.label}>
            <span>Número:</span>
            <input
              type="text"
              name="numero_direccion"
              value={formData.vivienda.numero_direccion}
              onChange={(e) => handleChange('vivienda', e)}
              className={styles.input}
            />
          </label>

          <label className={styles.label}>
            <span>Localidad:</span>
            <select
              name="localidad"
              value={formData.vivienda.localidad}
              onChange={(e) => handleChange('vivienda', e)}
              className={styles.select}
            >
              <option value="">Seleccione localidad</option>
              <option value="Benito Juarez">Benito Juárez</option>
              <option value="Barker">Barker</option>
              <option value="Villa Cacique">Villa Cacique</option>
              <option value="Tedín Uriburu">Tedín Uriburu</option>
              <option value="El Luchador">El Luchador</option>
            </select>
          </label>

          <label className={styles.label}>
            <span>¿Es departamento?</span>
            <select
              name="departamento"
              value={formData.vivienda.departamento === null ? "" :
                formData.vivienda.departamento ? "Si" : "No"}
              onChange={(e) => handleChange('vivienda', { target: { name: 'departamento', value: e.target.value === "Si" } })}
              className={styles.select}
            >
              <option value="No">No</option>
              <option value="Si">Sí</option>
            </select>
          </label>

          {formData.vivienda.departamento && (
            <>
              <label className={styles.label}>
                <span>Piso:</span>
                <input
                  type="text"
                  name="piso_departamento"
                  value={formData.vivienda.piso_departamento ?? ""}
                  onChange={(e) => handleChange('vivienda', e)}
                  className={styles.input}
                />
              </label>

              <label className={styles.label}>
                <span>Número de Departamento:</span>
                <input
                  type="text"
                  name="numero_departamento"
                  value={formData.vivienda.numero_departamento ?? ""}
                  onChange={(e) => handleChange('vivienda', e)}
                  className={styles.input}
                />
              </label>
            </>
          )}
        </div>
      </div>

      {/* Sección Ingresos */}
      <div className={styles.section}>
        <h3 className={styles.title}>Ingresos</h3>
        {formData.ingresos.map((ingreso, index) => (
          <div key={index} className={styles.inputGroup}>

            <label className={styles.label}>
              <span className={styles.labelText}>Situación laboral *</span>
              <select
                required
                name="situacion_laboral"
                value={ingreso.situacion_laboral}
                onChange={(e) => handleIngresoChange(index, e)}
                className={styles.select}
              >
                <option value="" disabled>Situación laboral</option>
                <option value="Relación de dependencia">Relación de dependencia</option>
                <option value="Autónomo">Autónomo</option>
                <option value="Relación de dependencia y Autonomo">Relación de dependencia y Autónomo</option>
                <option value="Jubilado">Jubilado</option>
                <option value="Pensionado">Pensionado</option>
                <option value="Jubilado y Pensionado">Jubilado y Pensionado</option>
                <option value="Informal">Informal</option>
                <option value="Desempleado">Desempleado</option>
              </select>
            </label>

            <label className={styles.label}>
              <span>Ocupación:</span>
              <input
                type="text"
                name="ocupacion"
                value={ingreso.ocupacion}
                onChange={(e) => handleIngresoChange(index, e)}
                className={styles.input}
              />
            </label>

            <label className={styles.label}>
              <span>CUIT Empleador:</span>
              <input
                type="text"
                name="CUIT_empleador"
                value={ingreso.CUIT_empleador ?? ""}
                onChange={(e) => handleIngresoChange(index, e)}
                className={styles.input}
              />
            </label>

            <label className={styles.label}>
              <span>Salario:</span>
              <input
                type="text"
                name="salario"
                value={ingreso.salario}
                onChange={(e) => handleIngresoChange(index, e)}
                className={styles.input}
              />
            </label>

            <button
              type="button"
              className={styles.removeIngresoButton}
              onClick={() => removeIngreso(index)}
            >
              Eliminar Ingreso
            </button>
          </div>
        ))}
        <button
          type="button"
          className={styles.addIngresoButton}
          onClick={addIngreso}
        >
          Agregar Ingreso
        </button>
        
        <button type="submit" className={styles.submitButton}>
        Guardar Cambios
      </button>
      </div>

      {/* Botón de envío */}
      
    </form>
  );
};

export default EditarRegistro;
