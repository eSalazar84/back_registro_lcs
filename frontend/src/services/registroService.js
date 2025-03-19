
const API_URL = import.meta.env.VITE_API_REGISTRO;

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
    return responseData;  // Devuelve los datos de respuesta
  } catch (error) {
    // Aquí puedes manejar el error y relanzarlo o pasarlo a otro lugar según lo necesites
    throw error;  // Relanza el error para que lo maneje el código que llama a esta función
  }
};

export const fetchViviendaById = async (id) => {

  try {
    const response = await fetch(`${API_URL}/vivienda/${id}`);
    if (!response.ok) {
      throw new Error(`Error al obtener  la vivienda. Status ${response.status}`)
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

}

export const getRegistroDeudorBcra = async (cuilCuit) => {
  try {
    // URL de la API de BCRA
    const url = `https://api.bcra.gob.ar/CentralDeDeudores/v1.0/Deudas/${cuilCuit}`;
    // Realizar la solicitud fetch
    const res = await fetch(url);
    // Verificar si la respuesta es exitosa
    if (!res.ok) {
      throw new Error("Error al obtener el registro de deudor en BCRA");
    }
    // Procesar la respuesta JSON
    const data = await res.json();
    return data;
  } catch (error) {
    throw new Error(error.message);
  }
};
