import BtnBlue from '../../componentes/btnBlue/BtnBlue';
import styles from './home.module.css'
import { Link, useNavigate } from "react-router-dom";


function Home() {
    const navigate = useNavigate();



    return (
        <>
            <div className={styles.container_general_home}>


                <div className={styles.h2_home}>
                    <h2>Programa Mi Hábitat, mi Hogar.</h2>
                </div>

                <div className={styles.container_descripcion_img_home}>
                    <p className={styles.texto_descripcion}>El "Programa Mi Hábitat, mi Hogar" es una iniciativa del Municipio de Benito Juárez diseñada para ayudar a las familias del distrito a acceder a lotes con servicios, destinados a la construcción de su vivienda familiar únicas y permanente. Este programa surge en respuesta a la necesidad urgente de muchas familias que, debido a la crisis socioeconómica actual, encuentran difícil acceder a un lote con serviciosen el mercado formal.<br />Para garantizar que los lotes se distribuyan de manera justa y equitativa, el programa establece un Registro Municipal de Aspirantes. Este registro es fundamental para agilizar la inscripción y asegurar que quienes cumplan los requisitos,tengan la oportunidad de acceder a la compra del lote.Además,el registro ayuda a verificar que los solicitantes cumplen con los requisitos establecidos por ordenanza.<br />A partir de esta base, el sorteo de los lotes se realiza de manera transparente y pública, con la presencia de un escribano que certifica el proceso.Esto garantiza que todos los participantes tengan las mismas oportunidades. Este enfoque no solo asegura la equidad, sino que también refuerza la confianza de la comunidad en el programa, asegurando que los lotes se destinen efectivamente a quienes los utilizarán para construir su hogar.<br />El programa no solo facilita el acceso al suelo sino que también promueve un desarrollo urbano sostenible, donde el uso de la tierra se orienta hacia el bienestar de las familias y la comunidad en general.</p>

                    <img src="/lotes.jpeg" alt="imagen lotes" />

                </div>

                <div className={styles.container_requisitos}>
                    <h3>Requisitos para registrarse:</h3>
                    
                    <ul>
                        <li>Número de documento y CUIL/CUIT del solicitante y grupo familiar.</li>
                        <li>CUIT empleador.</li>
                        <li>Poseer una cuenta de correo electrónico.</li>
                        <li>No poseer vivienda propia.</li>
                        <li>Mayor de 18 años.</li>
                    </ul>
                </div>

                <div className={styles.container_pasos_botones}>
                    <div className={styles.container_pasos}>
                        <h3>Pasos para registrarse:</h3>
                        <ol>
                            <li>Ir al boton "INGRESO AL REGISTRO".</li>
                            <li>Complete el formulario con los datos del solicitante.</li>
                            <li>Complete el formulario con los datos de la/s persona/s que conviven y sumen ingresos formales.</li>
                            <li>Complete el formulario con los datos de la/s persona/s que conviven y no sumen ingresos formales o informales.</li>
                            <li>Al finalizar presionar el botón "REGISTRAR".</li>
                                 <p className={styles.texto_importante}>IMPORTANTE: todos los datos cargados por el usuario revisten carácter de declaracion jurada.</p>
                        </ol>

                    </div>

                    <div className={styles.container_buttons_home}>
                        <Link to={'/bases-y-condiciones'}>
                            <BtnBlue text="Bases y condiciones" />
                        </Link>
                        <Link to={'/registro'}>
                              <BtnBlue text="Ingreso al Registro" />
                        </Link>



                    </div>

                </div>

            </div>
        </>
    )
}

export default Home;