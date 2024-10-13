import React, {useCallback, useContext, useEffect, useState} from 'react';
import {
    IonButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonInput,
    IonLoading,
    IonPage,
    IonTitle,
    IonToolbar
} from '@ionic/react';
import {getLogger} from '../core';
import {CarContext} from './CarProvider';
import {RouteComponentProps} from 'react-router';
import {CarProps} from './CarProps';

const log = getLogger('CarEdit');

interface CarEditProps extends RouteComponentProps<{
    id?: string;
}> {
}

const CarEdit: React.FC<CarEditProps> = ({history, match}) => {
    const {cars, saving, savingError, saveCar} = useContext(CarContext);
    const [model, setModel] = useState('');
    const [sellDate, setSellDate] = useState(new Date());
    const [price, setPrice] = useState(0);
    const [isElectric, setIsElectric] = useState(false);

    const [car, setCar] = useState<CarProps>();
    useEffect(() => {
        log('useEffect');
        const routeId = match.params.id || '';
        console.log("Route id is " + routeId);
        const car = cars?.find(it => it.id === routeId);
        console.log("Car is " + car);
        if (car) {
            setCar(car);
            setModel(car.model);
            setSellDate(car.sellDate);
            setPrice(car.price);
        }
    }, [match.params.id, cars]);
    const handleSave = useCallback(() => {
        const editedCar: CarProps = car ? {...car, model, sellDate, price, isElectric} : {
            model,
            sellDate,
            price,
            isElectric
        };
        saveCar && saveCar(editedCar).then(() => history.goBack());
    }, [car, saveCar, model, sellDate, price, isElectric, history]);
    log('render');
    console.log(model);
    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Edit</IonTitle>
                    <IonButtons slot="end">
                        <IonButton onClick={handleSave}>
                            Save
                        </IonButton>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>
            <IonContent>
                <IonInput value={model} onIonChange={e => setModel(e.detail.value || '')}/>
                <IonLoading isOpen={saving}/>
                {savingError && (
                    <div>{savingError.message || 'Failed to save car'}</div>
                )}
            </IonContent>
        </IonPage>
    );
};

export default CarEdit;
