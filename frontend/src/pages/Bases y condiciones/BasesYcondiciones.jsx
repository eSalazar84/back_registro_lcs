import { useNavigate } from "react-router-dom";
import React, { useEffect } from 'react';
import styles from "./BasesYcondiciones.module.css";
import { FaWhatsapp } from "react-icons/fa";
<<<<<<< HEAD
=======
import { Info } from "lucide-react";
>>>>>>> db367188ec5cdd42967f2ccf1a81725ac2a20bad

function BasesYCondiciones() {
    const navigate = useNavigate();
    useEffect(() => {
        window.scrollTo(0, 0);
<<<<<<< HEAD
      }, []);

    return (
        <div className={styles.container_ByC}>
    <div className={styles.header_ByC}>
        <h2>Bases y Condiciones</h2>
    </div>

    <div className={styles.container_descripcion_ByC}>
        <p className={styles.texto_descripcion_ByC}>
            Para postularse, los aspirantes deben cumplir con los siguientes requisitos:
        </p>
        <ul className={styles.lista_requisitos_ByC}>
            <li>Ningún integrante del grupo conviviente debe ser propietario de otro inmueble.</li>
            <li>Los miembros mayores del núcleo familiar deben tener residencia efectiva y comprobable en el distrito por al menos 5 años.</li>
            <li>Las cuotas no deben superar el 30% del ingreso total del grupo familiar (empleos registrados y no registrados).</li>
            <li>No deben figurar en el registro de deudores del Banco Central.</li>
            <li>No deben tener intereses opuestos al municipio ni obligaciones pendientes con él.</li>
            <li>No deben aparecer en el Registro de Deudores Alimentarios Morosos (RDAM).</li>
            <li>El ingreso familiar debe estar entre 3 y 10 salarios mínimos vitales y móviles netos.</li>
        </ul>

        <p className={styles.texto_descripcion_ByC}>
            Por cada hogar (mismo domicilio) podrá inscribirse un solo postulante titular.
            Los titulares o cotitulares no podrán inscribirse en más de un formulario.
        </p>

        <div className={styles.contacto_ByC}>
            <p>Ante cualquier duda, comunícate al:</p>
            <div className={styles.telefono_ByC}>
                <FaWhatsapp />
                <span>2281 57 3109</span>
            </div>
        </div>

        <button className={styles.button_ByC} onClick={() => navigate('/')}>
            Volver al Inicio
        </button>
    </div>
</div>
=======
    }, []);

    return (
        <div className={styles.container_ByC}>
            <div className={styles.header_ByC}>
                <h2>Requisitos Generales</h2>
            </div>

            <div className={styles.container_descripcion_ByC}>
                <p className={styles.texto_descripcion_ByC}>
                    Para postularse, los aspirantes deben cumplir con los siguientes requisitos:
                </p>
                <ul className={styles.lista_requisitos_ByC}>
                    <li>Ningún integrante del grupo conviviente debe ser propietario de otro inmueble.</li>
                    <li>Los miembros mayores del núcleo familiar deben tener residencia efectiva y comprobable en el distrito por al menos 5 años.</li>
                    <li>Las cuotas no deben superar el 30% del ingreso total del grupo familiar (empleos registrados y no registrados).</li>
                    <li>No deben figurar en el registro de deudores del Banco Central.</li>
                    <li>No deben tener intereses opuestos al municipio ni obligaciones pendientes con él.</li>
                    <li>No deben aparecer en el Registro de Deudores Alimentarios Morosos (RDAM).</li>
                    <li>El ingreso familiar debe estar entre 3 y 10 salarios mínimos vitales y móviles netos.</li>
                </ul>

                <p className={styles.texto_importante}>
                    <Info className={styles.info_icon} />
                    Por cada hogar (mismo domicilio) podrá inscribirse un solo postulante titular.
                    Los titulares o cotitulares no podrán inscribirse en más de un formulario.
                </p>

                <div className={styles.contacto_ByC}>
                    <p>Ante cualquier duda, comunícate al:</p>
                    <div className={styles.telefono_ByC}>
                        <FaWhatsapp />
                        <span>2281 57 3109</span>
                    </div>
                </div>

                <button className={styles.button_ByC} onClick={() => navigate('/')}>
                    Volver al Inicio
                </button>
            </div>
        </div>
>>>>>>> db367188ec5cdd42967f2ccf1a81725ac2a20bad
    )
}
export default BasesYCondiciones;