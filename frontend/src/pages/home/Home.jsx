import styles from "./home.module.css"
import { Link } from "react-router-dom"
<<<<<<< HEAD
import { ArrowRight, CheckCircle, Info, Users, FileText, Leaf } from "lucide-react"
=======
import { ArrowRight, CheckCircle, Info, Users, FileText, Leaf, MapPin } from "lucide-react"
>>>>>>> db367188ec5cdd42967f2ccf1a81725ac2a20bad

function Home() {
  return (
    <div className={styles.page_wrapper}>
      <div className={styles.container_general_home}>
        <div className={styles.hero_section}>
          <div className={styles.h2_home}>
<<<<<<< HEAD
            <h2>Programa Mi Hábitat, mi Hogar</h2>
=======
            <h2>Registro de demanda socio habitacional</h2>
>>>>>>> db367188ec5cdd42967f2ccf1a81725ac2a20bad
            <p className={styles.hero_subtitle}>Construyendo el futuro de nuestra comunidad</p>
          </div>
        </div>

        <div className={styles.container_descripcion_img_home}>
          <div className={styles.texto_descripcion_wrapper}>
            <div className={styles.section_title}>
              <Info className={styles.section_icon} />
              <h3>Acerca del Programa</h3>
            </div>
            <div className={styles.texto_descripcion}>
              <p>
                El "Programa Mi Hábitat, mi Hogar" es una iniciativa del Municipio de Benito Juárez diseñada para ayudar
                a las familias del distrito a acceder a lotes con servicios, destinados a la construcción de su vivienda
                familiar únicas y permanente. Este programa surge en respuesta a la necesidad urgente de muchas familias
                que, debido a la crisis socioeconómica actual, encuentran difícil acceder a un lote con servicios en el
                mercado formal.
              </p>

              <p>
                Para garantizar que los lotes se distribuyan de manera justa y equitativa, el programa establece un
                Registro Municipal de Aspirantes. Este registro es fundamental para agilizar la inscripción y asegurar
                que quienes cumplan los requisitos, tengan la oportunidad de acceder a la compra del lote. Además, el
                registro ayuda a verificar que los solicitantes cumplen con los requisitos establecidos por ordenanza.
              </p>

              <p>
                A partir de esta base, el sorteo de los lotes se realiza de manera transparente y pública, con la
                presencia de un escribano que certifica el proceso. Esto garantiza que todos los participantes tengan
                las mismas oportunidades. Este enfoque no solo asegura la equidad, sino que también refuerza la
                confianza de la comunidad en el programa, asegurando que los lotes se destinen efectivamente a quienes
                los utilizarán para construir su hogar.
              </p>

              <p>
                El programa no solo facilita el acceso al suelo sino que también promueve un desarrollo urbano
                sostenible, donde el uso de la tierra se orienta hacia el bienestar de las familias y la comunidad en
                general.
              </p>
            </div>

            <div className={styles.feature_cards}>
              <div className={styles.feature_card}>
                <Users className={styles.feature_icon} />
                <h4>Registro Municipal</h4>
                <p>Sistema de registro transparente y equitativo para todas las familias</p>
              </div>
              <div className={styles.feature_card}>
                <FileText className={styles.feature_icon} />
                <h4>Proceso Certificado</h4>
                <p>Sorteo público con presencia de escribano que certifica el proceso</p>
              </div>
              <div className={styles.feature_card}>
                <Leaf className={styles.feature_icon} />
                <h4>Desarrollo Sostenible</h4>
                <p>Promoción del uso responsable de la tierra para el bienestar comunitario</p>
              </div>
            </div>
          </div>

          <div className={styles.imagen_container}>
            <img src="/lotes.jpeg" alt="imagen lotes" className={styles.responsive_image} />
          </div>
        </div>

        <div className={styles.info_sections_grid}>
          <div className={styles.container_requisitos}>
            <h3>
              <CheckCircle className={styles.section_icon} />
              Requisitos para registrarse
            </h3>

            <ul className={styles.requisitos_list}>
              <li>
                <span className={styles.check_icon}>✓</span>
                Número de documento y CUIL/CUIT del solicitante y grupo familiar
              </li>
              <li>
                <span className={styles.check_icon}>✓</span>
                CUIT empleador
              </li>
              <li>
                <span className={styles.check_icon}>✓</span>
                Poseer una cuenta de correo electrónico
              </li>
              <li>
                <span className={styles.check_icon}>✓</span>
                No poseer vivienda propia
              </li>
              <li>
                <span className={styles.check_icon}>✓</span>
                Mayor de 18 años
              </li>
            </ul>
          </div>

          <div className={styles.container_pasos}>
            <h3>
              <ArrowRight className={styles.section_icon} />
              Pasos para registrarse
            </h3>
            <div className={styles.steps_container}>
              {[
                'Ir al botón "INGRESO AL REGISTRO"',
                "Complete el formulario con los datos del solicitante",
                "Complete el formulario con los datos de las personas que conviven y sumen ingresos formales",
                "Complete el formulario con los datos de las personas que conviven y no sumen ingresos",
                'Al finalizar presionar el botón "REGISTRAR"',
              ].map((step, index) => (
                <div key={index} className={styles.step_item}>
                  <div className={styles.step_number}>{index + 1}</div>
                  <p>{step}</p>
                </div>
              ))}
            </div>
            <p className={styles.texto_importante}>
              <Info className={styles.info_icon} />
              IMPORTANTE: todos los datos cargados por el usuario revisten carácter de declaracion jurada.
            </p>
          </div>
        </div>

        <div className={styles.container_buttons_home}>
<<<<<<< HEAD
          <Link to={"/bases-y-condiciones"} className={styles.button_link}>
            <div className={styles.modern_button}>
              <span>Bases y condiciones</span>
=======
          <a href="/" className={styles.button_link}>
            <div className={styles.modern_button_location}>
              <span>Ubicación de los Lotes</span>
              <MapPin className={styles.button_icon} />
            </div>
          </a>
          <Link to={"/bases-y-condiciones"} className={styles.button_link}>
            <div className={styles.modern_button}>
              <span>Requisitos Generales</span>
>>>>>>> db367188ec5cdd42967f2ccf1a81725ac2a20bad
              <FileText className={styles.button_icon} />
            </div>
          </Link>
          <Link to={"/registro"} className={styles.button_link}>
            <div className={styles.modern_button_primary}>
<<<<<<< HEAD
              <span>Ingreso al Registro</span>
=======
              <span>Ingreso al Registro Lotes</span>
>>>>>>> db367188ec5cdd42967f2ccf1a81725ac2a20bad
              <ArrowRight className={styles.button_icon} />
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Home

