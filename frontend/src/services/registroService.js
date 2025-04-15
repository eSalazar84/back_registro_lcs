
<<<<<<< HEAD
// const API_URL = import.meta.env.VITE_API_REGISTRO;
const API_URL = 'http://localhost:3000/registro'; // 

const API_BASE = 'http://localhost:3000';


console.log("API_URL", API_URL);


=======
const API_URL = import.meta.env.VITE_API_REGISTRO;
>>>>>>> db367188ec5cdd42967f2ccf1a81725ac2a20bad

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
<<<<<<< HEAD
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
=======
export const fetchRegistroById = async (id) => {

  try {
    const response = await fetch(`${API_URL}/${id}`);

    if (!response.ok) {
      // Lanzar error detallado
      throw new Error(`Error al obtener el registro. Status: ${response.status}`);
    }

    const data = await response.json();

    // Ahora, directamente accedemos a data
    if (!data || !data.data) {
      throw new Error("La respuesta no contiene el campo 'data' esperado.");
    }

    return data; // Retorna el objeto data directamente
  } catch (error) {
    throw new Error(error.message); // Propagar el error para que lo maneje el componente
  }
};

export const updateRegistroById = async (id, formData) => {
  try {
>>>>>>> db367188ec5cdd42967f2ccf1a81725ac2a20bad
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
<<<<<<< HEAD
    console.log('Datos de respuesta:', responseData);
    return responseData;  // Devuelve los datos de respuesta
  } catch (error) {
    console.error('Error en la actualización:', error.message);
=======
    return responseData;  // Devuelve los datos de respuesta
  } catch (error) {
>>>>>>> db367188ec5cdd42967f2ccf1a81725ac2a20bad
    // Aquí puedes manejar el error y relanzarlo o pasarlo a otro lugar según lo necesites
    throw error;  // Relanza el error para que lo maneje el código que llama a esta función
  }
};

<<<<<<< HEAD

// src/services/registroService.js




export async function fetchRegistroById(registroId) {
  const res = await fetch(`${API_BASE}/registro/${registroId}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Error al obtener el registro');
  }
  return res.json(); // { status, data: {...} }
}

export async function updateRegistro(registroId, payload) {
  const res = await fetch(`${API_BASE}/registro/${registroId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Error al actualizar el registro');
  }
  return res.json();
}


=======
>>>>>>> db367188ec5cdd42967f2ccf1a81725ac2a20bad
export const fetchViviendaById = async (id) => {

  try {
    const response = await fetch(`${API_URL}/vivienda/${id}`);
    if (!response.ok) {
      throw new Error(`Error al obtener  la vivienda. Status ${response.status}`)
    }
    const data = await response.json();
<<<<<<< HEAD
    console.log("data", data);

=======
>>>>>>> db367188ec5cdd42967f2ccf1a81725ac2a20bad

    // Ahora, directamente accedemos a data
    if (!data || !data.data) {
      throw new Error("La respuesta no contiene el campo 'data' esperado.");
    }
    return data; // Retorna el objeto data directamente
  } catch (error) {
<<<<<<< HEAD
    console.error("Error al obtener el registro:", error.message);
=======
>>>>>>> db367188ec5cdd42967f2ccf1a81725ac2a20bad
    throw new Error(error.message); // Propagar el error para que lo maneje el componente
  }

}

<<<<<<< HEAD
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

=======
>>>>>>> db367188ec5cdd42967f2ccf1a81725ac2a20bad
export const getRegistroDeudorBcra = async (cuilCuit) => {
  try {
    // URL de la API de BCRA
    const url = `https://api.bcra.gob.ar/CentralDeDeudores/v1.0/Deudas/${cuilCuit}`;
<<<<<<< HEAD
    console.log('Realizando solicitud a la API de BCRA:', url);
=======
>>>>>>> db367188ec5cdd42967f2ccf1a81725ac2a20bad
    // Realizar la solicitud fetch
    const res = await fetch(url);
    // Verificar si la respuesta es exitosa
    if (!res.ok) {
<<<<<<< HEAD
      const errorData = await res.json();
      console.error('Error en la respuesta de la API de BCRA:', {
        status: res.status,
        statusText: res.statusText,
        errorData,
      });
=======
>>>>>>> db367188ec5cdd42967f2ccf1a81725ac2a20bad
      throw new Error("Error al obtener el registro de deudor en BCRA");
    }
    // Procesar la respuesta JSON
    const data = await res.json();
<<<<<<< HEAD
    console.log('Datos recibidos de la API de BCRA:', data);
    return data;
  } catch (error) {
    console.error('Error en la solicitud fetch:', error);
=======
    return data;
  } catch (error) {
>>>>>>> db367188ec5cdd42967f2ccf1a81725ac2a20bad
    throw new Error(error.message);
  }
};
