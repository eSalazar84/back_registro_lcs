
// const API_URL = import.meta.env.VITE_API_REGISTRO;
const API_URL = 'http://localhost:3000/registro'; // 

const API_BASE = 'http://localhost:3000';


console.log("API_URL", API_URL);

import { esMenorDeEdad } from "./transformDataDto";



export const fetchRegistros = async () => {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error("Error al obtener los registros");
    const data = await response.json();
    return data.data; // Asegúrate de que la estructura coincida con tu backend
  } catch (error) {
    throw new Error(error.message);
  }
};
// export const fetchRegistroById = async (id) => {
//   console.log("registroService: ID solicitado", id);

//   try {
//     const response = await fetch(`${API_URL}/${id}`);
//     console.log("response status", response.status); // Ver el estado de la respuesta
//     console.log("response headers", response.headers); // Ver los encabezados de la respuesta

//     if (!response.ok) {
//       // Lanzar error detallado
//       throw new Error(`Error al obtener el registro. Status: ${response.status}`);
//     }

//     const data = await response.json();
//     console.log("data recibida:", data);

//     // Ahora, directamente accedemos a data
//     if (!data || !data.data) {
//       throw new Error("La respuesta no contiene el campo 'data' esperado.");
//     }

//     return data; // Retorna el objeto data directamente
//   } catch (error) {
//     console.error("Error al obtener el registro:", error.message);
//     throw new Error(error.message); // Propagar el error para que lo maneje el componente
//   }
// };

export const updateRegistroById = async (id, formData) => {
  try {
    console.log('Enviando datos a la API:', formData);  // Verifica qué datos estás enviando
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData)
    });

    // Verifica si la respuesta fue exitosa (status 200-299)
    if (!response.ok) {
      // Si la respuesta no es exitosa, lanza un error con el código de estado
      const errorData = await response.json();  // Obtener datos del error
      const errorMessage = errorData.message || 'Error desconocido';
      const status = response.status;
      throw new Error(`${status}: ${errorMessage}`);
    }

    const responseData = await response.json();
    console.log('Datos de respuesta:', responseData);
    return responseData;  // Devuelve los datos de respuesta
  } catch (error) {
    console.error('Error en la actualización:', error.message);
    // Aquí puedes manejar el error y relanzarlo o pasarlo a otro lugar según lo necesites
    throw error;  // Relanza el error para que lo maneje el código que llama a esta función
  }
};


export async function fetchRegistroById(registroId) {
  const res = await fetch(`${API_BASE}/registro/${registroId}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Error al obtener el registro');
  }
  return res.json(); // { status, data: {...} }
}

export const transformarParaBackend = (formData) => {
  if (!formData || !Array.isArray(formData.personas)) {
    console.error("El campo personas no es un array o formData es inválido:", formData);
    return [];
  }

  return formData.personas.map((persona) => {
   

    const esMenor = esMenorDeEdad(persona.fecha_nacimiento);

    return {
      persona: {
        idRegistro: persona.idRegistro || null,
        idPersona: persona.idPersona || null,
        idVivienda: persona.idVivienda || null,
        idLote: persona.idLote || null,
        numero_registro: persona.numero_registro || null,
        nombre: persona.nombre || "",
        apellido: persona.apellido || "",
        tipo_dni: persona.tipo_dni || "",
        dni: persona.dni || "",
        CUIL_CUIT: esMenor ? "0" : (persona.CUIL_CUIT || ""),
        genero: persona.genero || "",
        fecha_nacimiento: persona.fecha_nacimiento || "",
        email: esMenor ? "no@aplica.com" : (persona.email || ""),
        telefono: esMenor ? "0000000000" : (persona.telefono || ""),
        estado_civil: esMenor ? "Soltero/a" : (persona.estado_civil || ""),
        nacionalidad: persona.nacionalidad || "",
        certificado_discapacidad: persona.certificado_discapacidad || false,
        vinculo: persona.vinculo || "",
        titular_cotitular: persona.titular_cotitular || ""
      },
      vivienda: persona.vivienda
        ? {
            idVivienda: persona.vivienda.idVivienda || null,
            idRegistro: persona.vivienda.idRegistro || null,
            direccion: persona.vivienda.direccion || "",
            numero_direccion: persona.vivienda.numero_direccion || "",
            departamento: persona.vivienda.departamento || false,
            piso_departamento: persona.vivienda.piso_departamento || null,
            numero_departamento: persona.vivienda.numero_departamento || null,
            alquiler: persona.vivienda.alquiler || false,
            valor_alquiler: persona.vivienda.valor_alquiler || 0,
            localidad: persona.vivienda.localidad || "",
            cantidad_dormitorios: persona.vivienda.cantidad_dormitorios || 0,
            estado_vivienda: persona.vivienda.estado_vivienda || "",
            tipo_alquiler: persona.vivienda.tipo_alquiler || null
          }
        : null,
      lote: persona.lote
        ? {
            idLote: persona.lote.idLote || null,
            localidad: persona.lote.localidad || ""
          }
        : null,
      ingresos: esMenor
        ? []
        : Array.isArray(persona.ingresos)
        ? persona.ingresos.map((ingreso) => ({
            idIngreso: ingreso.idIngreso || null,
            situacion_laboral: ingreso.situacion_laboral || "",
            ocupacion: ingreso.ocupacion || "",
            CUIT_empleador: ingreso.CUIT_empleador || "0",
            salario: ingreso.salario || 0,
            idPersona: persona.idPersona || null
          }))
        : []
    };
  });
};

export async function updateRegistro(registroId, datosTranformados) {
   
  const res = await fetch(`${API_BASE}/registro/${registroId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(datosTranformados),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Error al actualizar el registro');
  }
  return res.json();
}


export const fetchViviendaById = async (id) => {

  try {
    const response = await fetch(`${API_URL}/vivienda/${id}`);
    if (!response.ok) {
      throw new Error(`Error al obtener  la vivienda. Status ${response.status}`)
    }
    const data = await response.json();
    console.log("data", data);


    // Ahora, directamente accedemos a data
    if (!data || !data.data) {
      throw new Error("La respuesta no contiene el campo 'data' esperado.");
    }
    return data; // Retorna el objeto data directamente
  } catch (error) {
    console.error("Error al obtener el registro:", error.message);
    throw new Error(error.message); // Propagar el error para que lo maneje el componente
  }

}

export const updateVivienda = async (id, data) => {
  try {
    const response = await fetch(`${API_URL}/vivienda/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error('Error al actualizar la vivienda');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error en updateVivienda:', error);
    throw error;
  }
};

export const getRegistroDeudorBcra = async (cuilCuit) => {
  try {
    // URL de la API de BCRA
   
    // Realizar la solicitud fetch
    const res = await fetch(`https://api.bcra.gob.ar/CentralDeDeudores/v1.0/Deudas/${cuilCuit}`);
    // Verificar si la respuesta es exitosa
    if (!res.ok) {
      const errorData = await res.json();
      console.error('Error en la respuesta de la API de BCRA:', {
        status: res.status,
        statusText: res.statusText,
        errorData,
      });
      throw new Error("Error al obtener el registro de deudor en BCRA");
    }
    // Procesar la respuesta JSON
    const data = await res.json();
    console.log('Datos recibidos de la API de BCRA:', data);
    return data;
  } catch (error) {
    console.error('Error en la solicitud fetch:', error);
    throw new Error(error.message);
  }
};


