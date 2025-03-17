import { Module } from '@nestjs/common';
import { MailserviceService } from './mailservice.service';
import { PdfModule } from './pdf_document/pdf.module';
import { ViviendaModule } from '../vivienda/vivienda.module';
import { LoteModule } from '../lote/lote.module';
import { IngresoModule } from '../ingreso/ingreso.module';

@Module({
  imports: [PdfModule, ViviendaModule, LoteModule, IngresoModule],
  providers: [MailserviceService],
  exports: [MailserviceService, PdfModule],
})
export class MailserviceModule {}