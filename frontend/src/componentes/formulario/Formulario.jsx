import styles from './formulario.module.css'
import { useState } from 'react';

function Formulario (){

    const [formData, setFormData] = useState({
        nombres: "",
        apellido: "",
        tipoDocumento: "",
        numeroDocumento: "",
        cuitCuil: "",
        fechaNacimiento: { dia: "", mes: "", anio: "" },
        genero: "",
        estadoCivil: "",
        email: "",
        telefono: "",
        nacionalidad: "",
        discapacidad: "",
      });
    
      const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
      };
    
      const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Datos enviados:", formData);
      };

    return (
        <form onSubmit={handleSubmit}>
          <div className="form-container">
            <h3>Datos Beneficiario</h3>
            <div className="form-group">
              <label>Nombres(*)</label>
              <input type="text" name="nombres" value={formData.nombres} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Apellido(*)</label>
              <input type="text" name="apellido" value={formData.apellido} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Tipo documento (*)</label>
              <select name="tipoDocumento" value={formData.tipoDocumento} onChange={handleChange} required>
                <option value="">Seleccione</option>
                <option value="DNI">DNI</option>
                <option value="Pasaporte">Pasaporte</option>
              </select>
            </div>
            <div className="form-group">
              <label>Nro Documento(*)</label>
              <input type="text" name="numeroDocumento" value={formData.numeroDocumento} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Cuit/Cuil(*)</label>
              <input type="text" name="cuitCuil" value={formData.cuitCuil} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Fecha nacimiento(*)</label>
              <div className="date-group">
                <input type="text" name="dia" placeholder="Día" value={formData.fechaNacimiento.dia} onChange={(e) => setFormData({ ...formData, fechaNacimiento: { ...formData.fechaNacimiento, dia: e.target.value } })} />
                <input type="text" name="mes" placeholder="Mes" value={formData.fechaNacimiento.mes} onChange={(e) => setFormData({ ...formData, fechaNacimiento: { ...formData.fechaNacimiento, mes: e.target.value } })} />
                <input type="text" name="anio" placeholder="Año" value={formData.fechaNacimiento.anio} onChange={(e) => setFormData({ ...formData, fechaNacimiento: { ...formData.fechaNacimiento, anio: e.target.value } })} />
              </div>
            </div>
            <div className="form-group">
              <label>Género</label>
              <select name="genero" value={formData.genero} onChange={handleChange}>
                <option value="">Seleccione</option>
                <option value="Masculino">Masculino</option>
                <option value="Femenino">Femenino</option>
                <option value="Otro">Otro</option>
              </select>
            </div>
            <div className="form-group">
              <label>Estado civil</label>
              <select name="estadoCivil" value={formData.estadoCivil} onChange={handleChange}>
                <option value="">Seleccione</option>
                <option value="Soltero">Soltero</option>
                <option value="Casado">Casado</option>
              </select>
            </div>
            <div className="form-group">
              <label>Email(*)</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Teléfono(*)</label>
              <input type="tel" name="telefono" value={formData.telefono} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Nacionalidad</label>
              <select name="nacionalidad" value={formData.nacionalidad} onChange={handleChange}>
                <option value="">Seleccione</option>
                <option value="Argentina">Argentina</option>
                <option value="Otra">Otra</option>
              </select>
            </div>
            <div className="form-group">
              <label>Certificado de discapacidad</label>
              <div>
                <label>
                  <input type="radio" name="discapacidad" value="SI" onChange={handleChange} /> Sí
                </label>
                <label>
                  <input type="radio" name="discapacidad" value="NO" onChange={handleChange} /> No
                </label>
              </div>
            </div>
            <button type="submit">Enviar</button>
          </div>
        </form>
      );
    };

export default Formulario;