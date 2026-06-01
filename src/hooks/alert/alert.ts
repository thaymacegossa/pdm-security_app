import { deleteAlert, saveAlert } from "@/src/services/firebase/alert.service";
import { getCurrentLocation, LocationData } from "@/src/services/location.service";
import { devLog } from '@utils/dev-log';

export async function alertTrigger(userId: string): Promise<{
    alertId: string;
    location: LocationData;
} | null> {
    try {
        const location = await getCurrentLocation();
        if (!location) {
            throw new Error('Não foi possível obter a localização.');
        }

        const address = location.address || `${location.latitude.toFixed(5)}, ${location.longitude.toFixed(5)}`;
        const geolocation = {
            latitude: location.latitude,
            longitude: location.longitude,
        };

        const alertId = await saveAlert(userId, {
            actualAlert: true,
            geolocation,
            location: address,
        });

        devLog('[alertTrigger] alerta salvo no Firebase', { alertId });

        return {
            alertId,
            location,
        };
    } catch (error) {
        devLog('[alertTrigger] erro ao salvar alerta no Firebase', { error });
        return null;
    }
}

export async function cancelAlert(userId: string, alertId: string) {
    try {
        await deleteAlert(userId, alertId);
        devLog('[cancelAlert] alerta cancelado', { userId, alertId });
    } catch (error) {
        devLog('[cancelAlert] erro ao cancelar alerta', { error });
        throw error;
    }
}