const API_URL = "http://localhost:3000/registro"; // Ajusta la URL según tu backend

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
  console.log("registroService: ID solicitado", id);

  try {
    const response = await fetch(`${API_URL}/${id}`);
    console.log("response status", response.status); // Ver el estado de la respuesta
    console.log("response headers", response.headers); // Ver los encabezados de la respuesta

    if (!response.ok) {
      // Lanzar error detallado
      throw new Error(`Error al obtener el registro. Status: ${response.status}`);
    }

    const data = await response.json();
    console.log("data recibida:", data);

    // Ahora, directamente accedemos a data
    if (!data || !data.data) {
      throw new Error("La respuesta no contiene el campo 'data' esperado.");
    }

    return data; // Retorna el objeto data directamente
  } catch (error) {
    console.error("Error al obtener el registro:", error.message);
    throw new Error(error.message); // Propagar el error para que lo maneje el componente
  }
};

export const updateRegistroById = async (id, formData) => {
  try {
    console.log('Enviando datos a la API:', formData);  // Verifica qué datos estás enviando
    const response = await fetch(`http://localhost:3000/registro/${id}`, {
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
