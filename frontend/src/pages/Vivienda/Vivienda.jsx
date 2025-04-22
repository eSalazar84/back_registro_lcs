import { useState, useEffect } from 'react';

import { useParams } from 'react-router-dom';
import styles from './vivienda.module.css';
import Swal from 'sweetalert2';
import { fetchViviendaById, getRegistroDeudorBcra } from '../../services/registroService';
import { formatPeriodo } from '../../services/transformDataDto';
import ClasificacionDeudor from '../../componentes/clasificacionDeudor/ClasificacionDeudor';

const Vivienda = () => {
  const { id } = useParams();
  const [viviendaData, setViviendaData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [morosidadData, setMorosidadData] = useState({}); // Estado para almacenar la morosidad de cada habitante
  const cargarDatos = async () => {
    try {
      setLoading(true);
      const data = await fetchViviendaById(id); // Obtener datos de la vivienda
      setViviendaData(data.data);
      // Obtener la morosidad de cada habitante
      const morosidadPromises = data.data.habitantes.map(async (habitante) => {
        try {
          const deudorBcra = await getRegistroDeudorBcra(habitante.persona.CUIL_CUIT);
          // Extraer solo los campos necesarios
          const morosidadInfo = deudorBcra.results.periodos.flatMap((periodo) => 
            periodo.entidades.map((entidad) => ({
              deuda: entidad.monto,
              entidad: entidad.entidad,
              periodo: periodo.periodo,
              situacion: entidad.situacion,
              procesoJud: entidad.procesoJud,
            }))
          );
          return { idPersona: habitante.persona.idPersona, morosidad: morosidadInfo };
        } catch (error) {
          return { idPersona: habitante.persona.idPersona, morosidad: null };
        }
      });

      const morosidadResults = await Promise.all(morosidadPromises);
      const morosidadMap = morosidadResults.reduce((acc, curr) => {
        acc[curr.idPersona] = curr.morosidad;
        return acc;
      }, {});

      setMorosidadData(morosidadMap); // Almacenar la morosidad en el estado
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudieron cargar los datos del registro',
      });

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, [id]);
  if (loading) {
    return <div className={styles.loading}>Cargando...</div>;
  }
  if (!viviendaData) {
    return <div className={styles.error}>No se encontraron datos del hogar</div>;
  }

  const formatMoney = (amount) => {
    return amount?.toLocaleString('es-AR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Datos del hogar</h2>
      {/* Información de la Vivienda */}
      <div className={styles.section}>
        <h3>Detalles del hogar</h3>
        <div className={styles.viviendaInfo}>
          <p><strong>Dirección:</strong> {viviendaData.vivienda.direccion} {viviendaData.vivienda.numero_direccion}</p>
          <p><strong>Localidad:</strong> {viviendaData.vivienda.localidad}</p>
          {viviendaData.vivienda.departamento && (
            <>
              <p><strong>Piso:</strong> {viviendaData.vivienda.piso_departamento}</p>
              <p><strong>Departamento:</strong> {viviendaData.vivienda.numero_departamento}</p>
            </>
          )}
          <p><strong>Dormitorios:</strong> {viviendaData.vivienda.cantidad_dormitorios}</p>
          <p><strong>Estado:</strong> {viviendaData.vivienda.estado_vivienda}</p>
          {viviendaData.vivienda.alquiler && (
            <>
              <p><strong>Tipo de Alquiler:</strong> {viviendaData.vivienda.tipo_alquiler}</p>
              <p><strong>Valor del Alquiler:</strong> ${formatMoney(viviendaData.vivienda.valor_alquiler)}</p>
            </>
          )}
        </div>
      </div>
      {/* Lista de Habitantes */}
      <div className={styles.section}>
        <h3>Habitantes</h3>
        <div className={styles.habitantesList}>
          {viviendaData.habitantes.map((habitante, index) => (
            <div key={habitante.persona.idPersona} className={styles.habitanteCard}>
              <h4>{habitante.persona.apellido}, {habitante.persona.nombre}</h4>
              <div className={styles.habitanteInfo}>
                <p><strong>DNI:</strong> {habitante.persona.dni}</p>
                <p><strong>CUIL/CUIT:</strong> {habitante.persona.CUIL_CUIT}</p>
                <p><strong>Rol:</strong> {habitante.persona.titular_cotitular}</p>
                <p><strong>Teléfono:</strong> {habitante.persona.telefono}</p>
                {/* Ingresos */}
                <div className={styles.ingresosSection}>
                  <h5>Ingresos</h5>
                  {habitante.ingresos.map((ingreso, idx) => (
                    <div key={idx} className={styles.ingresoItem}>
                      <p><strong>Situación Laboral:</strong> {ingreso.situacion_laboral}</p>
                      <p><strong>Ocupación:</strong> {ingreso.ocupacion}</p>
                      <p><strong>Salario:</strong> ${formatMoney(ingreso.salario)}</p>
                    </div>
                  ))}
                  <p className={styles.totalIngresos}>
                    <strong>Total Ingresos:</strong> ${formatMoney(habitante.totalIngresos)}
                  </p>
                </div>
                {/* Morosidad */}
                <div className={styles.morosidadSection}>
                  <h5>Morosidad <span className={styles.morosidadSection_italic}>(información extraída del Banco Central)</span></h5>
                  {morosidadData[habitante.persona.idPersona] ? (
                    <div>
                      {morosidadData[habitante.persona.idPersona].map((info, index, array) => (
                        <div key={index}>
                          <p><strong>Entidad:</strong> {info.entidad}</p>
                          <p><strong>Ultimo Período Informado:</strong> {formatPeriodo(info.periodo)}</p>
                          {/* <p><strong>Deuda:</strong> ${formatMoney(info.deuda)}</p> */}
                          <ClasificacionDeudor situacion={info.situacion} />
                          <p><strong>En Proceso Judicial:</strong> {info.procesoJud ? 'Sí' : 'No'}</p>
                          {array.length > 1 && index < array.length - 1 && <hr />} {/* Separador entre períodos */}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p>No se pudo obtener la información de morosidad.</p>
                  )}
                </div>
                {/* Lote (si es titular) */}
                {habitante.lote && (
                  <div className={styles.loteInfo}>
                    <h5>Información del Lote elegido para el sorteo</h5>
                    <p><strong>Localidad:</strong> {habitante.lote.localidad}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        {/* Total de Ingresos de la Vivienda */}
        <div className={styles.totalVivienda}>
          <h4>Total Ingresos de la Vivienda: ${formatMoney(viviendaData.totalIngresosVivienda)}</h4>
        </div>
      </div>
    </div>
  );
};

export default Vivienda;