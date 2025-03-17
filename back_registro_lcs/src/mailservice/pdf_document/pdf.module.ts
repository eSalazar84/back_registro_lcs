import { Module } from '@nestjs/common';
import { PdfService } from './pdf.service';
import { ViviendaModule } from '../../vivienda/vivienda.module';
import { LoteModule } from '../../lote/lote.module';
import { IngresoModule } from '../../ingreso/ingreso.module';

@Module({
  imports: [
    ViviendaModule, // Asegúrate de importar ViviendaModule
    LoteModule, // Asegúrate de importar LoteModule
    IngresoModule,
  ],
  providers: [PdfService],
  exports: [PdfService],
})
export class PdfModule {}