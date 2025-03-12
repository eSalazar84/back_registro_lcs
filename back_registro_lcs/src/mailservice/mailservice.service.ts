// mailservice.service.ts
import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import * as fs from 'fs';
import { PdfService } from './pdf_document/pdf.service';
import * as path from 'path';
import * as handlebars from 'handlebars';


@Injectable()
export class MailserviceService {
    private transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'no-responder@benitojuarez.gov.ar',
            pass: 'hgme mjqn igos kywi'
        },
        secure: false,
    });

    constructor(private readonly pdfService: PdfService) { }

    async sendRegisterEmail(to: string, nombreTitular: string, numero_registro: number, data: any[]) {
        try {

            // 1. Cargar y compilar el template
            const templatePath = path.join(process.cwd(), 'src/mailservice/template/confirmacionRegistro.hbs');
            const templateSource = fs.readFileSync(templatePath, 'utf8');
            const template = handlebars.compile(templateSource);
            // Generar PDF dinámico
            const pdfPath = await this.pdfService.generateRegistrationPDF(data);

            const mailOptions = {
                from: '"no-responder" <somos.agrotech@gmail.com>',
                to,
                subject: `🏠 Registro al Programa 'Mi Hábitat, Mi Hogar'`,
                html: template({ nombreTitular, numero_registro }),
                attachments: [
                    {
                        filename: 'registro.pdf',
                        path: pdfPath,
                    }
                ]
            };

            await this.transporter.sendMail(mailOptions);

            // Limpiar archivo temporal
            //fs.unlinkSync(pdfPath);
        } catch (error) {
            console.error('Error sending email:', error);
            throw new Error('Failed to send registration email');
        }
    }
}
