import { Redirect, Route } from 'react-router-dom';
import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/**
 * Ionic Dark Mode
 * -----------------------------------------------------
 * For more info, please see:
 * https://ionicframework.com/docs/theming/dark-mode
 */

/* import '@ionic/react/css/palettes/dark.always.css'; */
/* import '@ionic/react/css/palettes/dark.class.css'; */
import '@ionic/react/css/palettes/dark.system.css';

/* Theme variables */
import './theme/variables.css';
import { CarProvider } from './car/CarProvider';
import CarEdit from './car/CarEdit';
import CarList from "./car/CarList";

setupIonicReact();

const App: React.FC = () => (
  <IonApp>
    <CarProvider>
      <IonReactRouter>
        <IonRouterOutlet>
          <Route path="/cars" component={CarList} exact={true}/>
          <Route path="/car" component={CarEdit} exact={true}/>
          <Route path="/car/:id" component={CarEdit} exact={true}/>
          <Route exact path="/" render={() => <Redirect to="/cars"/>}/>
        </IonRouterOutlet>
      </IonReactRouter>
    </CarProvider>
  </IonApp>
);

export default App;
