import { ViviendasRepository } from './../../domain/repositories/viviendas_repository';

export class ViviendasRepositoryImpl implements ViviendasRepository {
    getViviendas(): Promise<Vivienda[]> {
        throw new Error('Method not implemented.');
    }
    createVivienda() {
        throw new Error('Method not implemented.');
    }
}