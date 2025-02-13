import { Module } from '@nestjs/common';
import { MailserviceService } from './mailservice.service';
import { PdfModule } from './pdf_document/pdf.module';

@Module({
  imports: [PdfModule],
  providers: [MailserviceService, PdfModule],
  exports: [MailserviceService, PdfModule],
})
export class MailserviceModule {}
