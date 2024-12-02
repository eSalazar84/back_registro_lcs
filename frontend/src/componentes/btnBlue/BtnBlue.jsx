import React from 'react'
import styles from './btnBlue.module.css';

function BtnBlue({text}) {
    const handlePress = () => {
        console.log('Clic')
    }
    return (
        <button onClick={handlePress} className={styles.button_general}>
            {text}
        </button>
    )
}

export default BtnBlue;