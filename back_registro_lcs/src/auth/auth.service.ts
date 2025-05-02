import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
<<<<<<< HEAD
import { Admin } from 'src/admin/entities/admin.entity';
=======
import { Admin } from '../admin/entities/admin.entity';
>>>>>>> db367188ec5cdd42967f2ccf1a81725ac2a20bad

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Admin)
    private adminRepository: Repository<Admin>,
    private jwtService: JwtService,
  ) {}

  async register(adminName: string, email: string, password: string) {
    console.log('Datos antes de guardar:', { adminName, email, password });
    try {
      console.log('🔍 Iniciando registro de usuario...');
      console.log(`📩 Email recibido: ${email}`);

      // Verificar si el usuario ya existe
      const existingAdmin = await this.adminRepository.findOne({ where: { email } });
      if (existingAdmin) {
        console.log('⚠️ Usuario ya existe en la base de datos.');
        return { message: 'El usuario ya está registrado' };
      }

      // Hashear la contraseña
      console.log('🔑 Hasheando contraseña...');
      const hashedPassword = await bcrypt.hash(password, 10);

      // Crear nuevo usuario
      console.log('🆕 Creando nuevo usuario...');
      const admin = this.adminRepository.create({ adminName, email, password: hashedPassword });

      // Guardar en la base de datos
      console.log('Objeto creado antes de guardar en DB:', admin)
      console.log('💾 Guardando usuario en la base de datos...');
      await this.adminRepository.save(admin);

      console.log('✅ Usuario registrado exitosamente');
      return { message: 'Usuario registrado exitosamente' };
    } catch (err) {  // Cambié "error" por "err"
      console.error('❌ Error al registrar usuario:', err);
      throw new Error('Error en el proceso de registro');
    }
  }

  async validateUser(email: string, password: string): Promise<any> {
    try {
      console.log(`🔍 Validando usuario con email: ${email}`);

      const admin = await this.adminRepository.findOne({ where: { email } });
      if (!admin) {
        console.log('❌ Usuario no encontrado');
        throw new UnauthorizedException('Correo o contraseña incorrectos');
      }

      console.log('🔑 Comparando contraseña...');
      const isMatch = await bcrypt.compare(password, admin.password);

      if (!isMatch) {
        console.log('❌ Contraseña incorrecta');
        throw new UnauthorizedException('Correo o contraseña incorrectos');
      }

      console.log('✅ Usuario validado correctamente');
      const { password: _, ...result } = admin; // Evita reutilizar "password"
      return result;
    } catch (err) {
      console.error('❌ Error en validación de usuario:', err);
      throw err;
    }
  }

  async login(admin: Admin) {
    console.log('🔐 Generando token JWT para:', admin.adminName);
    const payload = { adminName: admin.adminName, sub: admin.idAdmin };

    const token = this.jwtService.sign(payload);
    console.log('✅ Token generado:', token);

    return {
      access_token: token,
    };
  }
}
