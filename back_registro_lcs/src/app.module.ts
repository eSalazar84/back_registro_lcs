import { ViviendaModule } from './vivienda/vivienda.module';
import { Module } from '@nestjs/common';

import { RegistroModule } from './registro/registro.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { PersonaModule } from './persona/persona.module';
import { LoteModule } from './lote/lote.module';
import { IngresoModule } from './ingreso/ingreso.module';
import { MailserviceModule } from './mailservice/mailservice.module';
import { PdfService } from './mailservice/pdf_document/pdf.service';
import { AuthModule } from './auth/auth.module';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [RegistroModule,
    TypeOrmModule.forRoot({
      type: "mysql",
      host: "LOCALHOST",
      port: 3306,
      username: "root",
      password: "root",
      database: "registro_lcs",
      entities:[ join(__dirname, '/**/*.entity{.js,.ts}')],
      synchronize: true
    }),
    ViviendaModule,
    PersonaModule,
    LoteModule,
    IngresoModule,
    MailserviceModule,
    AuthModule,
    AdminModule
  ],
  
  controllers: [],
  providers: [],
})
export class AppModule {}
