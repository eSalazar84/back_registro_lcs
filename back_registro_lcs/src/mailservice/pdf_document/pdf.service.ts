// pdf.service.ts
import { Injectable } from '@nestjs/common';
import * as PDFDocument from 'pdfkit';
import * as fs from 'fs';
import { CreatePersonaDto } from 'src/persona/dto/create-persona.dto';

@Injectable()
export class PdfService {
    async generateRegistrationPDF(data: CreatePersonaDto[]): Promise<string> {
        return new Promise((resolve, reject) => {
            const doc = new PDFDocument();
            const filePath = `./src/PDFtemp/registro_${Date.now()}.pdf`;
            const stream = fs.createWriteStream(filePath);

            doc.pipe(stream);

            // Estilos reutilizables
            const titleStyle = { fontSize: 18, bold: true, color: '#2c3e50' };
            const sectionStyle = { fontSize: 14, bold: true, color: '#34495e' };
            const subSectionStyle = { fontSize: 12, bold: true, color: '#7f8c8d' };

            // Encabezado
            doc.fillColor(titleStyle.color)
                .fontSize(titleStyle.fontSize)
                .text('Comprobante de registro al programa "Mi hábitat, mi hogar"', { align: 'center' })
                .moveDown(1.5);

            // Iterar sobre todas las personas registradas
            data.forEach((personaData, index) => {
                const { nombre, apellido, dni, CUIL_CUIT, fecha_nacimiento, vinculo, numero_registro } = personaData;

                // Sección de Persona
                doc.fillColor(sectionStyle.color)
                    .fontSize(sectionStyle.fontSize)
                    .text(`${index === 0 ? 'Titular' : 'Persona a cargo'} ${index + 1}:`, { underline: true })
                    .moveDown(0.5);

                // Datos básicos
                this.addField(doc, 'Nombre completo: ', `${nombre} ${apellido}`);
                this.addField(doc, 'DNI/CUIT: ', `${dni} / ${CUIL_CUIT}`);
                this.addField(doc, 'Fecha Nacimiento: ', fecha_nacimiento);
                this.addField(doc, 'Vinculo: ', vinculo);
                this.addField(doc, 'Numero de Registro para el sorteo: ', numero_registro);

                // Solo para el titular
                /* if (index === 0) {
                    doc.moveDown(0.5);
                    this.addField(doc, 'Rol:', persona.rol);
                    this.addField(doc, 'Estado Civil:', persona.estado_civil);

                    // Sección de Vivienda
                    doc.fillColor(sectionStyle.color)
                        .fontSize(sectionStyle.fontSize)
                        .text('Datos de la Vivienda:', { underline: true })
                        .moveDown(0.5);

                    this.addField(doc, 'Dirección:', `${vivienda.direccion} ${vivienda.numero_direccion}`);
                    this.addField(doc, 'Localidad:', vivienda.localidad);
                    this.addField(doc, 'Características:',
                        `${vivienda.cantidad_dormitorios} dormitorios, estado ${vivienda.estado_vivienda}`);

                    // Sección de Ingresos (solo titular)
                    if (ingresos?.length > 0) {
                        doc.fillColor(sectionStyle.color)
                            .fontSize(sectionStyle.fontSize)
                            .text('Situación Laboral:', { underline: true })
                            .moveDown(0.5);

                        ingresos.forEach(ingreso => {
                            this.addField(doc, 'Empleador:', ingreso.ocupacion);
                            this.addField(doc, 'CUIT Empleador:', ingreso.CUIT_empleador);
                            this.addField(doc, 'Salario:', `$${ingreso.salario.toLocaleString()}`);
                            doc.moveDown(0.3);
                        });
                    }
                } */

                doc.moveDown(1.5);
            });

            // Pie de página
            doc.fillColor('#95a5a6')
                .fontSize(10)
                .text('Este documento es válido como comprobante de registro oficial', { align: 'center' });

            doc.end();

            stream.on('finish', () => resolve(filePath));
            stream.on('error', reject);
            console.log('PDF generado correctamente en:', filePath);
        });
    }

    private addField(doc: typeof PDFDocument, label: string, value: any) {
        doc.fillColor('#2c3e50').fontSize(12).text(label, { continued: true })
            .fillColor('#7f8c8d').text(value.toString())
            .moveDown(0.3);
    }
}