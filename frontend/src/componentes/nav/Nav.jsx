import styles from './nav.module.css'
import { FaFacebookF } from "react-icons/fa";
import { FaYoutube } from "react-icons/fa";
import { FaLinkedin } from "react-icons/fa";
import { Link } from 'react-router-dom';



function Nav() {
    // Obtener la fecha actual
    const fechaActual = new Date().toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
    });

    return (
        <>
            <div className={styles.container_general_nav}>
                <div className={styles.logo}>
                    <img src="/Logo_Muni2024.png" alt="logo" />
                </div>

                <div className={styles.container_h2_nav}>
                    <h2>LOTES CON SERVICIOS</h2>
                </div>

                <div className={styles.container_redes}>
                    <a
                        href="https://www.facebook.com/profile.php?id=100064402131639"
                        target="_blank"
                        rel="noopener noreferrer">
                        <FaFacebookF />
                    </a>

                    <a href="https://www.youtube.com/channel/UCbOe3yOFRtd9rZ7gcTgLhOQ" target="_blank"
                        rel="noopener noreferrer">
                        <FaYoutube />
                    </a>

                    <a href="https://www.linkedin.com/company/municipalidad-de-benito-ju%C3%A1rez/" target="_blank" rel="noopener noreferrer">
                        <FaLinkedin />
                    </a>
                </div>

                <div className={styles.container_fecha}>
                    <p>{fechaActual}</p>
                </div>
            </div>
        </>
    );
}

export default Nav;
