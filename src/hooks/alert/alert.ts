import { saveAlert } from "@/src/services/firebase/alert.service";
import { getCurrentLocation } from "@/src/services/location.service";
import { useAuthStore } from "@/src/store/auth-store";
import { devLog } from '@utils/dev-log';


export async function alertTrigger() {
    try {
        const { user } = useAuthStore();
        const location = await getCurrentLocation();
        const address = location?.address || "Unknown Location";
        const geolocation = {
            latitude: location?.latitude || 0,
            longitude: location?.longitude || 0,
        };

        const triggerAlert = await saveAlert(user?.userId || "unknown_user", {
            actualAlert: true,
            geolocation,
            location: address,
        });
        devLog("[useSosTrigger] alerta salvo no Firebase", { triggerAlert });
    } catch (error) {
        devLog("[useSosTrigger] erro ao salvar alerta no Firebase", { error });
    }

    return location;
}