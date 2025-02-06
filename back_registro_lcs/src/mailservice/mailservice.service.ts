// mailservice.service.ts
import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import fs from 'fs';
import { PdfService } from './pdf_document/pdf.service';
import { path } from 'pdfkit';

@Injectable()
export class MailserviceService {
    private transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'somos.agrotech@gmail.com',
            pass: 'qeez xykd olcr gscn'
        }
    });

    constructor(private readonly pdfService: PdfService) { }

    async sendRegisterEmail(to: string, subject: string, numero: number, data: any[]) {
        try {
            // Generar PDF dinámico
            const pdfPath = await this.pdfService.generateRegistrationPDF(data);

            const mailOptions = {
                from: '"no-responder" <somos.agrotech@gmail.com>',
                to,
                subject: `Registro al Programa 'Mi Hábitat, Mi Hogar'`,
                html: `
          <h1 style="color: #2c3e50;">¡Te informamos que tuviste un registro exitoso al programa!</h1>
          <p>Adjunto encontrarás el comprobante detallado de tu registro.</p>
          <p style="color: #7f8c8d;">Municipalidad de Benito Juarez </p>
          <p style="color: #7f8c8d; font-weight: bold; font-size: 18px;">Número de registro al Programa: ${numero}</p>
        `,
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
