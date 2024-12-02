import BtnBlue from '../componentes/btnBlue/BtnBlue';
import styles from './home.module.css'

function Home() {


    return (
        <>
            <div className={styles.container_general_home}>


                <div className={styles.h2_home}>
                    <h2>Programa Mi Hábitat, mi Hogar</h2>
                </div>

                <div className={styles.container_descripcion_img_home}>
                    <p className={styles.texto_descripcion}>El "Programa Mi Hábitat, mi Hogar" es una iniciativa del Municipio de Benito Juárez diseñada para ayudar a las familias a acceder a lotes con servicios, destinados a la construcción de viviendas familiares únicas y permanentes. Este programa surge en respuesta a la necesidad urgente de muchas familias que, debido a la crisis socioeconómica actual, encuentran difícil acceder a tierras urbanizadas.<br />Para garantizar que los lotes se distribuyan de manera justa y equitativa, el programa establece un Registro Municipal de Aspirantes. Este registro es fundamental, ya que permite a las autoridades municipales conocer la demanda real de lotes en cada localidad del municipio y asegurar que quienes más lo necesitan tengan la oportunidad de participar en el sorteo. Además, el registro ayuda a verificar que los solicitantes cumplen con los requisitos establecidos.<br />El sorteo de los lotes se realiza de manera transparente y pública, con la presencia de un escribano que certifica el proceso, lo que garantiza que todos los participantes tengan las mismas oportunidades. Este enfoque no solo asegura la equidad, sino que también refuerza la confianza de la comunidad en el programa, asegurando que los lotes se destinen efectivamente a quienes los utilizarán para construir su hogar.<br />El programa no solo facilita el acceso al suelo sino que también promueve un desarrollo urbano sostenible, donde el uso de la tierra se orienta hacia el bienestar de las familias y la comunidad en general.</p>

                    <img src="/home.png" alt="imagen familia" />

                </div>

                <div className={styles.container_requisitos}>
                    <h3>Requisitos para registrarse:</h3>
                    <ul>
                        <li>Numero de documento y CUIL/CUIT.</li>
                        <li>Poseer una cuenta de correo electronico.</li>
                        <li>No poseer vivienda propia.</li>
                        <li>Mayor de 18 años.</li>
                    </ul>
                </div>

                <div className={styles.container_pasos_botone}>
                    <div className={styles.container_pasos}>
                        <h3>Pasos para registrarse:</h3>
                        <ol>
                            <li>Vaya al boton "INGRESO AL REGISTRO".</li>
                            <li>Complete el formulario con los datos del solicitante.</li>
                            <li>Complete el formulario con los datos de la/s persona/s conviviente que sumarian salarios si los tuviese.</li>
                            <li>Complete el formulario con los datos de la/s persona/s que conviven y no sumarian salarios.</li>
                            <li>Al finalizar presiona el boton "REGISTRAR". Se aclara que todos los datos cargados por el usuario revisten caracter de declaracion jurada.</li>
                        </ol>

                    </div>

                    <div className={styles.container_buttons_home}>

                        <BtnBlue text="Bases y condiciones"/>
                        <BtnBlue text="Ingreso al Registro"/>


                    </div>

                </div>

            </div>
        </>
    )
}

export default Home;