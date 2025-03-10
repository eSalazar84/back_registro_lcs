import React from 'react';
import { clasificacionesDeudor } from '../../services/clasificacionDeudor';

const ClasificacionDeudor = ({ situacion }) => {
    const clasificacion = clasificacionesDeudor[situacion] || {
        descripcion: 'Desconocido',
        color: 'gray',
    };

    return (
        <div>
            <p>
                <strong>Clasificación Deudor:</strong>{' '}
                <span style={{ color: clasificacion.color, fontWeight: 'bold' }}>
                    {situacion}
                </span>{' '}
                - {clasificacion.descripcion}
            </p>
        </div>
    );
};

export default ClasificacionDeudor;