export class CrearVivienda {
    constructor(
        private viviendaRepostory: ViviendasRepository,
      ) {}
    
      async execute({}) {
        this.viviendaRepostory.createVivienda()
      }
        
}