import * as Location from 'expo-location';

export type LocationData = {
  latitude: number;
  longitude: number;
  street: string | null;
  district: string | null;
  city: string | null;
  region: string | null;
  country: string | null;
  address: string | null;
};

export async function getCurrentLocation(): Promise<LocationData | null> {
  try {
    const perm = await Location.requestForegroundPermissionsAsync();
    if (perm.status !== 'granted') return null;

    const pos = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    const [place] = await Location.reverseGeocodeAsync({
      latitude: pos.coords.latitude,
      longitude: pos.coords.longitude,
    });

    // criação de variáveis para componentes passíveis de receber nulo "place?. ??"
    const street = place?.street ?? null;
    const district = place?.district ?? null;
    const city = place?.city ?? null;
    const region = place?.region ?? null;
    const country = place?.country ?? null;

    const address = [street, district, city, region, country]
      .filter(Boolean)
      .join(', ');

      return {
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        street,
        district,
        city,
        region,
        country,
        address: address || null,
      };
  } catch (error) {
    return null;
  }
}
