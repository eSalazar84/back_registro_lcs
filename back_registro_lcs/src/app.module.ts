import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';

import { RegistroModule } from './registro/registro.module';
import { ViviendaModule } from './vivienda/vivienda.module';
import { PersonaModule } from './persona/persona.module';
import { LoteModule } from './lote/lote.module';
import { IngresoModule } from './ingreso/ingreso.module';
import { MailserviceModule } from './mailservice/mailservice.module';
import { AuthModule } from './auth/auth.module';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [
        '.env', // Variables comunes
<<<<<<< HEAD
        `.env.${process.env.NODE_ENV || 'development'}`, // Variables por entorno
=======
        `.env.${process.env.NODE_ENV || 'development'}.local`, // Variables según el entorno
>>>>>>> db367188ec5cdd42967f2ccf1a81725ac2a20bad
      ],
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get<string>('DB_HOST'),
<<<<<<< HEAD
        port: parseInt(configService.get<string>('DB_PORT'), 10), // ✅ CORREGIDO
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_DATABASE'),
        entities: [join(__dirname, '/**/*.entity{.ts,.js}')],
=======
        port: parseInt(configService.get<string>('DB_PORT'), 10),  // Corregido: 'port' en lugar de 'db_port'
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_DATABASE'),
        entities: [join(__dirname, '/**/*.entity{.js,.ts}')],
>>>>>>> db367188ec5cdd42967f2ccf1a81725ac2a20bad
        synchronize: configService.get<boolean>('DB_SYNC', false),
      }),
    }),

    RegistroModule,
    ViviendaModule,
    PersonaModule,
    LoteModule,
    IngresoModule,
    MailserviceModule,
    AuthModule,
    AdminModule,
  ],
})
<<<<<<< HEAD
export class AppModule {}
=======
export class AppModule { }
>>>>>>> db367188ec5cdd42967f2ccf1a81725ac2a20bad
