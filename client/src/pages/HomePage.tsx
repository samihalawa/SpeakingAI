import { IonPage, IonContent } from "@ionic/react";
import { SplitLayout } from "../components/SplitLayout";

export default function HomePage() {
  return (
    <IonPage>
      <IonContent className="ion-padding">
        <SplitLayout />
      </IonContent>
    </IonPage>
  );
}
