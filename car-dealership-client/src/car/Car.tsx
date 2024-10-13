import React, {memo} from 'react';
import {IonCheckbox, IonDatetime, IonItem, IonLabel} from '@ionic/react';
import {getLogger} from '../core';
import {CarProps} from './CarProps';

const log = getLogger('Car');

interface CarPropsExt extends CarProps {
    onEdit: (id?: string) => void;
}

const Car: React.FC<CarPropsExt> = ({id, model, price, sellDate, isElectric, onEdit}) => {
    console.log(isElectric);
    console.log('selldate = ' + sellDate);
    const formattedSellDate = parseIsoDate(sellDate.toString());
    return (
        <IonItem onClick={() => onEdit(id)}>
            <IonLabel>{model}</IonLabel>
            <IonLabel>{price}</IonLabel>
            <IonCheckbox slot="start" checked={isElectric}/>
            <IonLabel>{formattedSellDate}</IonLabel> {/* Display formatted sell date */}
        </IonItem>
    );
};

function parseIsoDate(dateString: string): string {
    // Extract year, month, and day from the ISO string
    const dateParts = dateString.split('T')[0].split('-');
    const year = dateParts[0];
    const month = dateParts[1];
    const day = dateParts[2];

    // Return formatted date as dd/MM/yyyy
    return `${day}/${month}/${year}`;
}


export default memo(Car);
