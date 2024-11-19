import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent } from "@ionic/react";
import { SplitLayout } from "../components/SplitLayout";

export default function HomePage() {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle>¡Bienvenidos!</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <SplitLayout />
      </IonContent>
    </IonPage>
  );
}
