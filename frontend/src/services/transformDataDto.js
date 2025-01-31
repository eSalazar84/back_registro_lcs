export function transformarVivienda(data) {
    return {
        idVivienda: Number(data.idVivienda) || 0, // Asigna 0 si no hay ID

        direccion: String(data.direccion),
        numero_direccion: Number(data.numero_direccion), // Convertir a número
        
        departamento: data.departamento === "true" || data.departamento === true, // Convertir a booleano
        piso_departamento: data.piso_departamento ? Number(data.piso_departamento) : null,
        numero_departamento: data.numero_departamento || null, 
        
        alquiler: data.alquiler === "true" || data.alquiler === true, // Convertir a booleano
        valor_alquiler: data.valor_alquiler ? Number(data.valor_alquiler) : null,
        
        localidad: data.localidad, // Mantener el valor sin casting de TypeScript
        cantidad_dormitorios: Number(data.cantidad_dormitorios), 
        
        estado_vivienda: data.estado_vivienda, // Mantener el valor sin casting de TypeScript
        tipo_alquiler: data.tipo_alquiler ? data.tipo_alquiler : null, // Dejar como null si no hay valor
    };
}

export function transformarPersona(data) {
    return {
        nombre: String(data.nombre), // Asegurarse de que sea una cadena
        apellido: String(data.apellido),
        tipo_dni: String(data.tipo_dni),
        dni: Number(data.dni), // Si lo necesitas como número, conviértelo
        CUIL_CUIT: Number(data.CUIL_CUIT),
        genero: String(data.genero),
        fecha_nacimiento: String(data.fecha_nacimiento), // Si es una fecha, conviértela correctamente
        email: String(data.email),
        telefono: String(data.telefono),
        estado_civil: String(data.estado_civil),
        nacionalidad: String(data.nacionalidad),
        certificado_discapacidad: data.certificado_discapacidad === "true" || data.certificado_discapacidad === true, // Convertir a booleano
        rol: String(data.rol),
        vinculo: String(data.vinculo),
        titular_cotitular: String(data.titular_cotitular),
    };
}

export function transformarIngresos(data) {
    return data.map(ingreso => ({
        situacion_laboral: String(ingreso.situacion_laboral),
        ocupacion: String(ingreso.ocupacion),
        CUIT_empleador: Number(ingreso.CUIT_empleador),
        salario: Number(ingreso.salario) || 0, // Convertir a número
    }));
}

export function transformarDatos(data) {
    return {
        persona: transformarPersona(data.persona),
        ingresos: transformarIngresos(data.ingresos),
        lote: data.lote, // Mantener tal cual
        vivienda: transformarVivienda(data.vivienda),
    };
}
