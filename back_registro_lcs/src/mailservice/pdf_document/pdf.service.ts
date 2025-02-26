// pdf.service.ts
import { Injectable } from '@nestjs/common';
import * as PDFDocument from 'pdfkit';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class PdfService {
    private calcularEdad(fechaNacimiento: Date): number {
        const hoy = new Date();
        const fechaNac = new Date(fechaNacimiento);
        let edad = hoy.getFullYear() - fechaNac.getFullYear();
        const mes = hoy.getMonth() - fechaNac.getMonth();
        if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNac.getDate())) {
            edad--;
        }
        return edad;
    }

    async generateRegistrationPDF(data: any[]): Promise<string> {
        return new Promise((resolve, reject) => {
            const doc = new PDFDocument();
            const filePath = path.join(process.cwd(), `src/temp/registro_${Date.now()}.pdf`);
            const stream = fs.createWriteStream(filePath);

            doc.pipe(stream);

            // Estilos reutilizables
            const titleStyle = { fontSize: 18, bold: true, color: '#2c3e50' };
            const sectionStyle = { fontSize: 14, bold: true, color: '#34495e' };

            // Cargar imagen con validación
            const logoPath = path.join(process.cwd(), 'https://res.cloudinary.com/dnzpobyip/image/upload/v1739280883/logo_muni_2024.png');
            if (fs.existsSync(logoPath)) {
                doc.image(logoPath, 50, 50, { width: 100 });
            } else {
                console.warn('Logo no encontrado en:', logoPath);
            }

            // Encabezado
            doc.fillColor(titleStyle.color)
                .fontSize(titleStyle.fontSize)
                .text('Comprobante de registro al programa "Mi hábitat, mi hogar"', { align: 'center' })
                .moveDown(1.5);

            // Iterar sobre todas las personas
            data.forEach((personaData, index) => {
                const {
                    nombre,
                    apellido,
                    dni,
                    CUIL_CUIT,
                    fecha_nacimiento,
                    vinculo,
                    numero_registro,
                    vivienda,
                    ingresos,
                    estado_civil,
                    certificado_discapacidad,
                    genero,
                    email,
                    telefono,
                    nacionalidad,
                    lote
                } = personaData;

                const edad = this.calcularEdad(new Date(fecha_nacimiento));
                const esMenor = edad < 18;

                if (index === 0) {
                    this.addFieldBold(doc, 'Número de registro: ', numero_registro || 'N/D');
                }

                // Sección de Persona
                doc.fillColor(sectionStyle.color)
                    .fontSize(sectionStyle.fontSize)
                    .text(`${index === 0 ? 'Interesado Titular' : 'Persona a cargo (Co-Titular - Conviviente)'}:`, {
                        underline: true
                    })
                    .moveDown(0.5);

                // Datos básicos comunes
                this.addField(doc, 'Nombre completo: ', `${nombre || 'N/D'} ${apellido || ''}`);
                this.addField(doc, 'Documento: ', dni || 'N/D');
                this.addField(doc, 'CUIL/CUIT: ', CUIL_CUIT || 'N/D');
                this.addField(doc, 'Fecha nacimiento: ', new Date(fecha_nacimiento + 'T0:00:00').toLocaleDateString('es-AR'));
                this.addField(doc, 'Edad: ', `${edad} años`);
                this.addField(doc, 'Género: ', genero || 'N/D');
                this.addField(doc, 'Email: ', email || 'N/D');
                this.addField(doc, 'Teléfono: ', telefono || 'N/D');
                this.addField(doc, 'Nacionalidad: ', nacionalidad || 'N/D');
                this.addField(doc, 'Estado civil: ', estado_civil || 'N/D');
                this.addField(doc, 'Posee Certificado de Discapacidad: ', certificado_discapacidad || 'N/D');

                if (index > 0) {
                    this.addField(doc, 'Vínculo con titular: ', vinculo || 'N/D');
                }

                // Sección de Vivienda para todos
                if (vivienda) {
                    doc.fillColor(sectionStyle.color)
                        .fontSize(sectionStyle.fontSize)
                        .text('\nDatos de la vivienda:', { underline: true })
                        .moveDown(0.5);

                    this.addField(doc, 'Dirección: ', `${vivienda.direccion || 'N/D'} ${vivienda.numero_direccion || ''}`);
                    this.addField(doc, 'Localidad: ', vivienda.localidad || 'N/D');
                    this.addField(doc, 'Cantidad dormitorios: ', vivienda.cantidad_dormitorios?.toString() || 'N/D');
                    this.addField(doc, 'Estado vivienda: ', vivienda.estado_vivienda || 'N/D');

                    if (vivienda.departamento) {
                        this.addField(doc, 'Piso: ', vivienda.piso_departamento?.toString() || 'N/D');
                        this.addField(doc, 'N° departamento: ', vivienda.numero_departamento || 'N/D');
                    }
                }

                // Sección de Lote para el titular
                if (lote && index === 0) {
                    doc.fillColor(sectionStyle.color)
                        .fontSize(sectionStyle.fontSize)
                        .text('\nDatos del lote:', { underline: true })
                        .moveDown(0.5);

                    this.addField(doc, 'Ubicación del lote elegido: ', lote.localidad || 'N/D');
                }

                // Sección de Ingresos solo para mayores de edad
                if (!esMenor) {
                    doc.fillColor(sectionStyle.color)
                        .fontSize(sectionStyle.fontSize)
                        .text('\nSituación laboral:', { underline: true })
                        .moveDown(0.5);

                    if (ingresos?.length > 0) {
                        ingresos.forEach((ingreso, i) => {
                            this.addField(doc, `Empleador ${i + 1}: `, ingreso.ocupacion || 'N/D');
                            this.addField(doc, 'CUIT empleador: ', ingreso.CUIT_empleador?.toString() || 'N/D');
                            this.addField(doc, 'Salario: ', ingreso.salario ?
                                `$${ingreso.salario.toLocaleString('es-AR')}` : 'N/D');
                            doc.moveDown(0.3);
                        });
                    } else {
                        this.addField(doc, 'Información laboral: ', 'No registrada');
                    }
                } else {
                    doc.fillColor(sectionStyle.color)
                        .fontSize(sectionStyle.fontSize)
                        .text('\nSituación laboral:', { underline: true })
                        .moveDown(0.5);
                    this.addField(doc, 'Información laboral: ', 'No aplica (menor de edad)');
                }

                doc.moveDown(1.5);
            });

            // Pie de documento
            doc.fillColor('#2c3e50')
                .fontSize(12)
                .text(`Fecha de emisión: ${new Date().toLocaleDateString('es-AR')}`, { align: 'center' })
                .moveDown(0.5);

            doc.fillColor('#95a5a6')
                .fontSize(10)
                .text('N/D = Dato no proporcionado', { align: 'left' })
                .moveDown(0.5);

            doc.fillColor('#7f8c8d')
                .fontSize(10)
                .text('Este documento es válido como comprobante de registro oficial.', { align: 'center' });

            doc.end();

            stream.on('finish', () => resolve(filePath));
            stream.on('error', reject);
            console.log('PDF generado correctamente en:', filePath);
        });
    }

    private addField(doc: typeof PDFDocument, label: string, value: any) {
        const displayValue = value !== undefined && value !== null ? value.toString() : 'N/D';
        doc.fillColor('#2c3e50')
            .fontSize(12)
            .text(label, { continued: true })
            .fillColor('#7f8c8d')
            .text(displayValue)
            .moveDown(0.3);
    }

    private addFieldBold(doc: typeof PDFDocument, label: string, value: any) {
        const displayValue = value !== undefined && value !== null ? value.toString() : 'N/D';
        doc.fillColor('#007bff')
            .fontSize(28)
            .text(label, { continued: true })
            .fillColor('#7f8c8d')
            .text(displayValue)
            .moveDown(0.3);
    }
}