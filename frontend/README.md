# Sistema de Registro para Sorteo de Lotes

## Descripción
Sistema web desarrollado para la gestión y registro de personas interesadas en participar en sorteos de lotes municipales. Permite la carga de datos personales, información de vivienda actual, situación laboral y preferencias de localidad para el sorteo.

## Características Principales
- Registro de datos personales del titular, 		cotitular y grupo familiar
- Gestión de información de vivienda actual
- Registro de ingresos y situación laboral
- Selección de localidad para el sorteo
- Validaciones en tiempo real
- Interfaz responsiva y amigable

## Tecnologías Utilizadas
### Frontend
- React.js
- CSS Modules
- SweetAlert2 para notificaciones
- React Router DOM

### Backend
- Node.js
- Express.js
- MySQL
- Sequelize ORM

## Requisitos Previos
- Node.js (v14 o superior)
- MySQL (v8 o superior)
- npm o yarn
## Instalación

  ### Backend
  bash

cd backend

npm install
Configurar el archivo .env con las variables de entorno:
env

DB_HOST=localhost

DB_USER=tu_usuario

DB_PASSWORD=tu_contraseña

DB_NAME=nombre_base_datos

PORT=3000
### Frontend
bash

cd frontend

npm instal

## Estructura del Proyecto
├── backend/

│ ├── src/

│ │ ├── controllers/

│ │ ├── models/

│ │ ├── routes/

│ │ └── services/

│ ├── package.json

│ └── server.js

└── frontend/

├── public/

├── src/

│ ├── components/

│ ├── services/

│ └── styles/

└── package.json

## Funcionalidades Principales

### Registro de Datos Personales
- Nombre y apellido
- Tipo y número de documento
- CUIL/CUIT
- Género
- Fecha de nacimiento
- Contacto (email y teléfono)
- Estado civil
- Nacionalidad
- Certificado de discapacidad
- Vínculo familiar
- Rol (Titular/Cotitular/Conviviente)

### Información de Vivienda
- Dirección completa
- Tipo de vivienda (casa/departamento)
- Información de alquiler (si corresponde)
- Estado de la vivienda
- Cantidad de dormitorios

### Registro de Ingresos
- Situación laboral
- Ocupación
- CUIT del empleador (si corresponde)
- Ingresos mensuales

### Selección de Lote
- Localidad preferida para el sorteo

## Validaciones
- Campos obligatorios
- Formato de email
- Formato de DNI (8 dígitos)
- Formato de CUIL/CUIT (11 dígitos)
- Formato de teléfono
- Validaciones específicas según situación laboral

## Contribución
1. Fork del repositorio
2. Crear una nueva rama (`git checkout -b feature/nueva-caracteristica`)
3. Commit de cambios (`git commit -am 'Agrega nueva característica'`)
4. Push a la rama (`git push origin feature/nueva-caracteristica`)
5. Crear Pull Request

## Mantenimiento
- Actualización regular de dependencias
- Backup periódico de la base de datos
- Monitoreo de logs y errores
- Actualizaciones de seguridad

## Soporte
Para reportar problemas o solicitar ayuda:
- Contactar al equipo de desarrollo

## Licencia
Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles