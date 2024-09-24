import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RegistroModule } from './registro/registro.module';

@Module({
  imports: [RegistroModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
