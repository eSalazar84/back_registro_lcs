import styles from './footer.module.css'
import { FaPhoneAlt } from "react-icons/fa";
import { LiaPhoneVolumeSolid } from "react-icons/lia";
import { TbMapPin } from "react-icons/tb";
import { FaFacebookF } from "react-icons/fa";
import { FaPlay } from "react-icons/fa";
import { FaLinkedinIn } from "react-icons/fa";
import { FaInstagram } from "react-icons/fa";

function Footer() {


    return (
        <>
            <div className={styles.container_general_footer}>
                <div className={styles.container_numeros_emergencias_footer}>

                    <div className={styles.container_numero}>
                        <FaPhoneAlt className={styles.icon_emergencias} />
                        <div className={styles.numero_texto}>
                            <p className={styles.numero}>100</p>
                            <p className={styles.texto}>BOMBEROS</p>
                        </div>
                    </div>

                    <div className={styles.container_numero}>
                        <FaPhoneAlt className={styles.icon_emergencias} />
                        <div className={styles.numero_texto}>
                            <p className={styles.numero}>101</p>
                            <p className={styles.texto}>POLICIA</p>
                        </div>
                    </div>

                    <div className={styles.container_numero}>
                        <FaPhoneAlt className={styles.icon_emergencias} />
                        <div className={styles.numero_texto}>
                            <p className={styles.numero}>103</p>
                            <p className={styles.texto}>DEFENSA CIVIL</p>
                        </div>
                    </div>

                    <div className={styles.container_numero}>
                        <FaPhoneAlt className={styles.icon_emergencias} />
                        <div className={styles.numero_texto}>
                            <p className={styles.numero}>107</p>
                            <p className={styles.texto}> EMERGENCIAS MEDICAS</p>
                        </div>
                    </div>


                </div>

                <div className={styles.container_contacto_footer}>

                    <div >
                        <img src="/Logo_Muni2024.png" alt="logo" className={styles.logo_footer} />
                    </div>

                    <div className={styles.container_numero_telefono}>

                        <div className={styles.icon_telefono}>
                            <LiaPhoneVolumeSolid className={styles.icon_contacto} />
                        </div>
                        <div className={styles.numero_telefono}>
                            <p className={styles.texto_contacto}>2292 451400</p>
                        </div>

                    </div>

                    <div className={styles.container_direccion}>
                        <div className={styles.icono_ubicacion}>
                            <TbMapPin className={styles.icon_contacto} />
                        </div>

                        <div className={styles.direccion}>
                            <p className={styles.texto_contacto}>Av. Mitre N° 42</p>
                        </div>
                    </div>

                    <div className={styles.container_redes}>
                        <a href="https://www.facebook.com/profile.php?id=100064402131639" target="_blank" rel="noopener noreferrer" className={styles.icon_redes_footer}> <FaFacebookF /></a>

                        <a href="https://www.youtube.com/channel/UCbOe3yOFRtd9rZ7gcTgLhOQ" target="_blank" rel="noopener noreferrer" className={styles.icon_redes_footer}><FaPlay /></a>


                        <a href="https://www.linkedin.com/company/municipalidad-de-benito-ju%C3%A1rez/" target="_blank" rel="noopener noreferrer" className={styles.icon_redes_footer}><FaLinkedinIn /></a>

                        <a href="https://www.instagram.com/municipiobenitojuarez/" target="_blank" rel="noopener noreferrer" className={styles.icon_redes_footer}> <FaInstagram /></a>
                    </div>

                </div>

                <div className={styles.top_footer}>
                    <p>Municipio de Benito Juárez © 2024 - Todos los derechos reservados | EFA.CODE</p>
                </div>

            </div>

        </>
    )
}
export default Footer;