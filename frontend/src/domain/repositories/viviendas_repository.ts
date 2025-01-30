export interface ViviendasRepository {
    getViviendas(): Promise<Vivienda[]>
    createVivienda()
}