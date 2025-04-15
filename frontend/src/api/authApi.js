const API_URL = import.meta.env.VITE_API_AUTH // URL del backend
<<<<<<< HEAD
console.log("api_url_auth", API_URL);
=======
>>>>>>> db367188ec5cdd42967f2ccf1a81725ac2a20bad


export const loginUser = async (email, password) => {
  const response = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Error en el login");
  return data;
};

export const registerUser = async (adminName, email, password) => {
<<<<<<< HEAD
  console.log("registro user", adminName, email,password);
=======
>>>>>>> db367188ec5cdd42967f2ccf1a81725ac2a20bad


  const response = await fetch(`${API_URL}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ adminName, email, password }),
  });

  const data = await response.json();
<<<<<<< HEAD
  console.log("data", data);
=======
>>>>>>> db367188ec5cdd42967f2ccf1a81725ac2a20bad
  
  if (!response.ok) throw new Error(data.message || "Error en el registro");
  return data;
};
