import React, { useState } from 'react';
import styles from "./Formulario.module.css";
import { transformarDatos } from '../../services/transformDataDto';
import Swal from 'sweetalert2';

const Formulario = ({ onSubmit }) => {
  const [loading, setLoading] = useState(false);
  const [personas, setPersonas] = useState([{
    persona: {
      nombre: '',
      apellido: '',
      tipo_dni: '',
      dni: '',
      CUIL_CUIT: '',
      genero: '',
      fecha_nacimiento: '',
      email: '',
      telefono: '',
      estado_civil: '',
      nacionalidad: '',
      certificado_discapacidad: null,
      rol: 'User',
      vinculo: '',
      titular_cotitular: ''
    },
    ingresos: [{
      situacion_laboral: '',
      ocupacion: '',
      CUIT_empleador: '',
      salario: ''
    }],
    lote: {
      localidad: ''
    },
    vivienda: {
      direccion: '',
      numero_direccion: '',
      departamento: null,
      piso_departamento: '',
      numero_departamento: '',
      alquiler: null,
      valor_alquiler: '',
      localidad: '',
      cantidad_dormitorios: '',
      estado_vivienda: '',
      tipo_alquiler: ''
    }
  }]);


  const handleInputChange = (index, path, value) => {
    const updatedPersonas = [...personas];
    let current = updatedPersonas[index];

    path.split('.').reduce((acc, key, i, arr) => {
      if (i === arr.length - 1) {
        acc[key] = value; // Actualiza el valor
      } else {
        return acc[key]; // Navega al siguiente nivel del objeto
      }
    }, current);

    setPersonas(updatedPersonas);
  };


  const addIngreso = (personaIndex) => {
    const updatedPersonas = [...personas];
    updatedPersonas[personaIndex].ingresos.push({
      situacion_laboral: '',
      ocupacion: '',
      CUIT_empleador: '',
      salario: ''
    });
    setPersonas(updatedPersonas);
  };

  const addPersona = () => {
    setPersonas([...personas, {
      persona: {
        nombre: '',
        apellido: '',
        tipo_dni: '',
        dni: '',
        CUIL_CUIT: '',
        genero: '',
        fecha_nacimiento: '',
        email: '',
        telefono: '',
        estado_civil: '',
        nacionalidad: '',
        certificado_discapacidad: null,
        rol: 'User',
        vinculo: '',
        titular_cotitular: ''
      },
      ingresos: [{
        situacion_laboral: '',
        ocupacion: '',
        CUIT_empleador: '',
        salario: ''
      }],
      lote: {
        localidad: ''
      },
      vivienda: {
        direccion: '',
        numero_direccion: "",
        departamento: null,
        piso_departamento: '',
        numero_departamento: '',
        alquiler: null,
        valor_alquiler: '',
        localidad: '',
        cantidad_dormitorios: '',
        estado_vivienda: '',
        tipo_alquiler: ''
      }
    }]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Datos a enviar:", personas);
    setLoading(true); // Activa el indicador de carga

    const datosTransformados = personas.map(persona => transformarDatos(persona));
    console.log(datosTransformados);  // Aquí tendrás todos los datos transformados correctamente


try {
  const response = await fetch("http://localhost:3000/registro", {
    method: "POST",
    body: JSON.stringify(datosTransformados),
    headers: {
      "Content-Type": "application/json",
    },
  });

  const responseData = await response.json(); // Convertir la respuesta en JSON

  if (!response.ok) {
    console.log('❌ Error en la respuesta del backend:', responseData);

    // Si el error es por DNI ya registrado
    if (responseData.error && responseData.error.includes("DNI")) {
      Swal.fire({
        icon: 'warning',
        title: 'DNI ya registrado',
        text: 'El DNI que intentas registrar ya está en la base de datos.',
      });
    }
    // Si el error es por vivienda ya registrada
    else if (responseData.error && responseData.error.includes("La vivienda en")) {
      Swal.fire({
        icon: 'warning',
        title: 'Vivienda ya registrada',
        text: 'La vivienda que intentas registrar ya está en la base de datos.',
      });
    }
    // Si el error es por departamento ya registrado
    else if (responseData.error && responseData.error.includes("El departamento en")) {
      Swal.fire({
        icon: 'warning',
        title: 'Departamento ya registrado',
        text: 'El departamento que intentas registrar ya está en la base de datos.',
      });
    }
    else {
      throw new Error(responseData.error || 'Error desconocido');
    }
    return;
  }

  // Si la respuesta es exitosa
  Swal.fire({
    icon: 'success',
    title: 'Registro Exitoso',
    text: 'Los datos se han registrado correctamente.',
  });

} catch (error) {
  console.error('Error en el frontend:', error);

  // Mostrar mensaje de error con SweetAlert
  Swal.fire({
    icon: 'error',
    title: 'Error en el registro',
    text: error.message,
  });

} finally {
  setLoading(false); // Desactiva el indicador de carga
}
};
   



  return (
    <form onSubmit={handleSubmit}>
      {personas.map((personaData, index) => (
        <div key={index} className={styles.container}>
          <h3>Datos de la persona</h3>

          <label htmlFor="" className={styles.label}>
            <input
              required
              type="text"
              placeholder="Nombres"
              value={personaData.persona.nombre}
              onChange={(e) => handleInputChange(index, 'persona.nombre', e.target.value)}
              className={styles.input} />
          </label>

          <label htmlFor="" className={styles.label}>
            <input
              type="text"
              placeholder="Apellido"
              value={personaData.persona.apellido}
              onChange={(e) => handleInputChange(index, 'persona.apellido', e.target.value)}
              className={styles.input} />
          </label>


          <select
            name="tipo_dni"
            id="tipo_dni"
            value={personaData.persona.tipo_dni || ""}  // Sincroniza con el estado
            onChange={(e) => handleInputChange(index, 'persona.tipo_dni', e.target.value)}  // Actualiza el estado
            className={styles.select}>
            <option value="" disabled>Seleccione Tipo de Documento</option>
            <option value="Documento unico">DNI</option>
            <option value="Libreta enrolamiento">Libreta de enrolamiento</option>
            <option value="Libreta civica">Libreta cívica</option>
            <option value="Otro">Otro</option>
          </select>


          <label htmlFor="" className={styles.label}>
            <input type="number"
              placeholder='Número de documento'
              value={personaData.persona.dni}
              onChange={(e) => handleInputChange(index, 'persona.dni', e.target.value)} className={styles.input} />
          </label>

          <label htmlFor="">
            <input type="text"
              placeholder='Cuit/Cuil'
              value={personaData.persona.CUIL_CUIT}
              onChange={(e) => handleInputChange(index, 'persona.CUIL_CUIT', e.target.value)} className={styles.input} />
          </label>

          <select
            name="genero"
            id="genero"
            value={personaData.persona.genero || ""}  // Aquí, si no hay valor, se asigna un valor vacío
            onChange={(e) => handleInputChange(index, 'persona.genero', e.target.value)}
            className={styles.select}>
            <option value="" disabled>Seleccione género</option>
            <option value="Masculino">Masculino</option>
            <option value="Femenino">Femenino</option>
            <option value="Femenino">Otro</option>
          </select>

          <label htmlFor="" className={styles.label}>
            <input
              type="text"
              placeholder="Fecha de nacimiento (aa/mm/dd)"
              value={personaData.persona.fecha_nacimiento}
              onChange={(e) => {
                let valor = e.target.value.replace(/[^0-9]/g, ''); // Eliminar caracteres no numéricos

                // Añadir separadores automáticamente
                if (valor.length >= 5) valor = valor.slice(0, 4) + '/' + valor.slice(4);
                if (valor.length >= 8) valor = valor.slice(0, 7) + '/' + valor.slice(7);

                // Limitar la longitud del valor a 10 caracteres (año/mes/día)
                if (valor.length > 10) valor = valor.slice(0, 10);

                handleInputChange(index, 'persona.fecha_nacimiento', valor);
              }}
              onBlur={(e) => {
                // Validar que el formato sea correcto
                const regex = /^\d{2}\/\d{2}\/\d{2}$/; // aa/mm/dd
                if (!regex.test(e.target.value)) {
                  alert("Formato incorrecto. Use aa/mm/dd");
                  handleInputChange(index, "persona.fecha_nacimiento", "");
                }
              }}
              className={styles.input}
            />
          </label>






          <label htmlFor="" className={styles.label}>
            <input type="text"
              placeholder='Email'
              value={personaData.persona.email}
              onChange={(e) => handleInputChange(index, 'persona.email', e.target.value)} className={styles.input} />
          </label>

          <label htmlFor="" className={styles.label}>
            <input type="text"
              placeholder='Teléfono'
              value={personaData.persona.telefono}
              onChange={(e) => handleInputChange(index, 'persona.telefono', e.target.value)} className={styles.input} />
          </label>

          <select name="estado_civil" id="estado_civil" onChange={(e) => handleInputChange(index, 'persona.estado_civil', e.target.value)} value={personaData.persona.estado_civil} className={styles.select}>
            <option value="" disabled>Seleccione estado civil</option>
            <option value="Soltero/a">Soltero/a</option>
            <option value="Casado/a">Casado/a</option>
            <option value="Concubinato/a">Concubinato/a</option>
            <option value="Divorciado/a">Divorsiado/a</option>
            <option value="Viudo/a">Viudo/a</option>
            <option value="Otro">Otro</option>
          </select>

          <select
            name="nacionalidad"
            id="nacionalidad"
            value={personaData.persona.nacionalidad || ""}  // Solo usa el valor controlado
            onChange={(e) => handleInputChange(index, 'persona.nacionalidad', e.target.value)}
            className={styles.select}>
            <option value="" disabled>Seleccione nacionalidad</option>
            <option value="Argentina">Argentina</option>
            <option value="Bolivia">Bolivia</option>
            <option value="Chilena">Chilena</option>
            <option value="Paraguaya">Paraguaya</option>
            <option value="Uruguaya">Uruguaya</option>
            <option value="Peruana">Peruana</option>
            <option value="Brasileña">Brasileña</option>
            <option value="Venezolana">Venezolana</option>
            <option value="Colombiana">Colombiana</option>
            <option value="Española">Española</option>
            <option value="Italiana">Italiana</option>
            <option value="China">China</option>
            <option value="Japonesa">Japonesa</option>
            <option value="Coreana">Coreana</option>
            <option value="Siria">Siria</option>
            <option value="Libanesa">Libanesa</option>
            <option value="Otro">Otro</option>
          </select>

          <select
            name="certificado_discapacidad"
            id="certificado_discapacidad"
            value={personaData.persona.certificado_discapacidad === true ? "Si" : personaData.persona.certificado_discapacidad === false ? "No" : ""}
            onChange={(e) => handleInputChange(index, 'persona.certificado_discapacidad', e.target.value === 'Si')}
            className={styles.select}
          >
            <option value="" disabled>¿Posee certificado de discapacidad?</option>
            <option value="Si">Sí</option>
            <option value="No">No</option>
          </select>




          <select name="vinculo" id="vinculo" value={personaData.persona.vinculo || ""}
            onChange={(e) => handleInputChange(index, 'persona.vinculo', e.target.value)} className={styles.select}>
            <option value="" disabled>Seleccione Vinculo</option>
            <option value="Esposo/a">Esposo/a</option>
            <option value="Concuvino/a">Concuvino/a</option>
            <option value="Conyuge">Conyuge</option>
            <option value="Hermano/a">Hermano/a</option>
            <option value="Hijo/a">Hijo/a</option>
            <option value="Madre">Madre</option>
            <option value="Padre">Padre</option>
            <option value="Primo/a">Primo/a</option>
            <option value="Nieto/a">Nieto/a</option>
            <option value="Tio/a">Tío/a</option>
            <option value="Sobrino/a">Sobrino/a</option>
            <option value="Suegro/a">Suegro/a</option>
            <option value="Abuelo/a">Abuelo/a</option>
            <option value="Otro">Otro</option>
          </select>

          <select name="titular_cotitular" id="titular_cotitular" value={personaData.persona.titular_cotitular || ""} onChange={(e) => handleInputChange(index, 'persona.titular_cotitular', e.target.value)} className={styles.select}>
            <option value="" disabled>Titular - Cotitular - Conviviente</option>
            <option value="Titular">Titular</option>
            <option value="Cotitular">Cotitular</option>
            <option value="Conviviente">Conviviente</option>
          </select>




          {/* Add more inputs for "persona" fields here */}

          <h4>Datos de la Vivienda</h4>
          <label htmlFor="" className={styles.label}>
            <input
              type="text"
              placeholder="Dirección"
              value={personaData.vivienda.direccion}
              onChange={(e) => handleInputChange(index, 'vivienda.direccion', e.target.value)} className={styles.input}
            />
          </label>

          <label htmlFor="" className={styles.label}>
            <input type="number"
              placeholder='Numero de dirección'
              value={personaData.vivienda.numero_direccion}
              onChange={(e) => handleInputChange(index, 'vivienda.numero_direccion', +e.target.value)}
              className={styles.input} />
          </label>


          <select
            name="departamento"
            id="departamento"
            value={personaData.vivienda.departamento === null ? "" : personaData.vivienda.departamento ? "Si" : "No"}
            onChange={(e) => handleInputChange(index, 'vivienda.departamento', e.target.value === 'Si')}
            className={styles.select}>
            <option value="" disabled>
              ¿Es departamento?
            </option>
            <option value="Si">Sí</option>
            <option value="No">No</option>
          </select>


          <label htmlFor="" className={styles.label}>
            <input type="text"
              placeholder='Número de piso departamento'
              value={personaData.vivienda.piso_departamento}
              onChange={(e) => handleInputChange(index, 'vivienda.piso_departamento', e.target.value)}
              className={styles.input} />
          </label>

          <label htmlFor="" className={styles.label}>
            <input type="text"
              placeholder='Número de departamento'
              value={personaData.vivienda.numero_departamento}
              onChange={(e) => handleInputChange(index, 'vivienda.numero_departamento', e.target.value)}
              className={styles.input} />
          </label>

          <select
            name="alquiler"
            id="alquiler"
            value={personaData.vivienda.alquiler === null ? "" : personaData.vivienda.alquiler ? "Si" : "No"}
            onChange={(e) => handleInputChange(index, 'vivienda.alquiler', e.target.value === 'Si')}
            className={styles.select}>
            <option value="" disabled>¿Alquila?</option>
            <option value="Si">Sí</option>
            <option value="No">No</option>
          </select>


          <label htmlFor="" className={styles.label}>
            <input type="text"
              placeholder='Valor alquiler'
              value={personaData.vivienda.valor_alquiler}
              onChange={(e) => handleInputChange(index, 'vivienda.valor_alquiler', e.target.value)}
              className={styles.input} />
          </label>

          <select
            name="localidad"
            id="localidad"
            value={personaData.vivienda.localidad}
            onChange={(e) => handleInputChange(index, 'vivienda.localidad', e.target.value)}
            className={styles.select}>
            <option value="" disabled>
              Localidad
            </option>
            <option value="Benito Juarez">Benito Juárez</option>
            <option value="Barker">Barker</option>
            <option value="Villa Cacique">Villa Cacique</option>
            <option value="Estacion Lopez">Estación López</option>
            <option value="El Luchador">El Luchador</option>
            <option value="Tedin Uriburu">Tedín Uriburu</option>
            <option value="Coronel Rodolfo Bunge">Coronel Rodolfo Bunge</option>
          </select>

          <label htmlFor="" className={styles.label}>
            <input type="text"
              placeholder='Cantidad de dormitorios'
              value={personaData.vivienda.cantidad_dormitorios}
              onChange={(e) => handleInputChange(index, 'vivienda.cantidad_dormitorios', e.target.value)}
              className={styles.input} />
          </label>

          <select
            name="estado_vivienda"
            id="estado_vivienda"
            value={personaData.vivienda.estado_vivienda}
            onChange={(e) => handleInputChange(index, 'vivienda.estado_vivienda', e.target.value)}
            className={styles.select}>
            <option value="" disabled>
              ¿Estado de la Vivienda?
            </option>
            <option value="Muy bueno">Muy bueno</option>
            <option value="Bueno">Bueno</option>
            <option value="Regular">Regular</option>
            <option value="Malo">Malo</option>
            <option value="Muy malo">Muy malo</option>
          </select>

          <select
            name="tipo_alquiler"
            id="tipo_alquiler"
            value={personaData.vivienda.tipo_alquiler}
            onChange={(e) => handleInputChange(index, 'vivienda.tipo_alquiler', e.target.value)}
            className={styles.select}>
            <option value="" disabled>
              ¿Alquila por Inmobiliaria o particular?
            </option>
            <option value="Inmobiliaria">Inmobiliaria</option>
            <option value="Particular">Particular</option>
          </select>
          {/* Add more inputs for "vivienda" fields here */}

          <h4>Ingresos por persona</h4>
          {personaData.ingresos.map((ingreso, ingresoIndex) => (
            <div key={ingresoIndex}>
              <select
                name="situacion_laboral"
                id="situacion_laboral"
                value={ingreso.situacion_laboral}
                onChange={(e) => handleInputChange(index, `ingresos.${ingresoIndex}.situacion_laboral`, e.target.value)}
                className={styles.select}>
                <option value="" disabled>
                  ¿Situación laboral?
                </option>
                <option value="Relación de dependencia">Relación de dependencia</option>
                <option value="Autónomo">Autónomo</option>
                <option value="Relación de dependencia y Autonomo">Relación de dependencia y Autónomo</option>
                <option value="Jubilado">Jubilado</option>
                <option value="Pensionado">Pensionado</option>
                <option value="Jubilado y Pensionado">Jubilado y Pensionado</option>
                <option value="Informal">Informal</option>
                <option value="Desempleado">Desempleado</option>
              </select>

              <label htmlFor="" className={styles.label}>
                <input type="text"
                  placeholder='Ocupación'
                  value={personaData.ingresos.ocupacion}
                  onChange={(e) => handleInputChange(index, `ingresos.${ingresoIndex}.ocupacion`, e.target.value)}
                  className={styles.input} />
              </label>

              <label htmlFor="" className={styles.label}>
                <input type="text"
                  placeholder='Cuit del Empleador'
                  value={personaData.ingresos.CUIT_empleador}
                  onChange={(e) => handleInputChange(index, `ingresos.${ingresoIndex}.CUIT_empleador`, e.target.value)}
                  className={styles.input} />
              </label>

              <label htmlFor="" className={styles.label}>
                <input type="text"
                  placeholder='Ingreso Mensual'
                  value={personaData.ingresos.salario}
                  onChange={(e) => handleInputChange(index, `ingresos.${ingresoIndex}.salario`, e.target.value)}
                  className={styles.input} />
              </label>

              <h4>Ubicación del Lote Sortear</h4>


              <select
                name="localidad"
                id="localidad"
                value={personaData.lote.localidad || ""} // Maneja valores vacíos
                onChange={(e) => handleInputChange(index, 'lote.localidad', e.target.value)} // Actualiza el estado
                className={styles.select} >
                <option value="" disabled>Localidad</option>
                <option value="Benito Juarez">Benito Juárez</option>
                <option value="Barker">Barker</option>
                <option value="Estacion Lopez">Estación López</option>
                <option value="El Luchador">El Luchador</option>
                <option value="Tedin Uriburu">Tedín Uriburu</option>
              </select>


              {/* Add more inputs for "ingresos" fields here */}
            </div>
          ))}
          <button type="button" onClick={() => addIngreso(index)}>Añadir Ingreso</button>
        </div>
      ))}
      <button type="button" onClick={addPersona} disabled={loading}>
        Añadir Persona
      </button>
      <button type="submit" disabled={loading}>
        {loading ? "Enviando..." : "Enviar"}
      </button>
    </form>
  );
};

export default Formulario;