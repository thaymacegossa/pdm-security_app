import { getCurrentLocation } from '@services/location.service';
import * as Location from 'expo-location';

jest.mock('expo-location');

const mockedRequestPermissions = Location.requestForegroundPermissionsAsync as jest.MockedFunction<
  typeof Location.requestForegroundPermissionsAsync
>;
type PermissionResponse = Awaited<ReturnType<typeof Location.requestForegroundPermissionsAsync>>;
const mockedGetPosition = Location.getCurrentPositionAsync as jest.MockedFunction<typeof Location.getCurrentPositionAsync>;
const mockedReverseGeocode = Location.reverseGeocodeAsync as jest.MockedFunction<typeof Location.reverseGeocodeAsync>;

describe('location.service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('retorna null quando permissao e negada', async () => {
    mockedRequestPermissions.mockResolvedValue({ status: 'denied', expires: 0, canAskAgain: true, granted: false } as PermissionResponse);

    const result = await getCurrentLocation();

    expect(result).toBeNull();
    expect(mockedGetPosition).not.toHaveBeenCalled();
  });

  it('retorna localizacao com sucesso', async () => {
    mockedRequestPermissions.mockResolvedValue({ status: 'granted', expires: 0, canAskAgain: false, granted: true } as PermissionResponse);
    mockedGetPosition.mockResolvedValue({
      coords: {
        latitude: -7.2273,
        longitude: -36.5022,
        altitude: 100,
        accuracy: 5,
        altitudeAccuracy: 2,
        heading: 0,
        speed: 0,
      },
      timestamp: Date.now(),
    } as Location.LocationObject);

    mockedReverseGeocode.mockResolvedValue([
      {
        street: 'Rua Teste',
        district: 'Bairro Teste',
        city: 'Campina Grande',
        region: 'Paraíba',
        country: 'Brasil',
      } as Location.LocationGeocodedAddress,
    ]);

    const result = await getCurrentLocation();

    expect(result).toEqual({
      latitude: -7.2273,
      longitude: -36.5022,
      street: 'Rua Teste',
      district: 'Bairro Teste',
      city: 'Campina Grande',
      region: 'Paraíba',
      country: 'Brasil',
      address: 'Rua Teste, Bairro Teste, Campina Grande, Paraíba, Brasil',
    });
    expect(mockedGetPosition).toHaveBeenCalled();
    expect(mockedReverseGeocode).toHaveBeenCalled();
  });

  it('retorna localizacao com fields nulos quando geocode nao retorna dados', async () => {
    mockedRequestPermissions.mockResolvedValue({ status: 'granted', expires: 0, canAskAgain: false, granted: true } as PermissionResponse);
    mockedGetPosition.mockResolvedValue({
      coords: {
        latitude: -7.2273,
        longitude: -36.5022,
        altitude: 100,
        accuracy: 5,
        altitudeAccuracy: 2,
        heading: 0,
        speed: 0,
      },
      timestamp: Date.now(),
    } as Location.LocationObject);

    mockedReverseGeocode.mockResolvedValue([]);

    const result = await getCurrentLocation();

    expect(result).toEqual({
      latitude: -7.2273,
      longitude: -36.5022,
      street: null,
      district: null,
      city: null,
      region: null,
      country: null,
      address: null,
    });
  });

  it('retorna localizacao com address parcial quando alguns fields nao sao retornados', async () => {
    mockedRequestPermissions.mockResolvedValue({ status: 'granted', expires: 0, canAskAgain: false, granted: true } as PermissionResponse);
    mockedGetPosition.mockResolvedValue({
      coords: {
        latitude: -7.2273,
        longitude: -36.5022,
        altitude: 100,
        accuracy: 5,
        altitudeAccuracy: 2,
        heading: 0,
        speed: 0,
      },
      timestamp: Date.now(),
    } as Location.LocationObject);

    mockedReverseGeocode.mockResolvedValue([
      {
        city: 'Campina Grande',
        country: 'Brasil',
      } as Location.LocationGeocodedAddress,
    ]);

    const result = await getCurrentLocation();

    expect(result?.address).toBe('Campina Grande, Brasil');
    expect(result?.street).toBeNull();
    expect(result?.city).toBe('Campina Grande');
  });

  it('retorna null quando ocorre erro', async () => {
    mockedRequestPermissions.mockRejectedValue(new Error('Erro ao pedir permissao'));

    const result = await getCurrentLocation();

    expect(result).toBeNull();
  });

  it('retorna null quando getCurrentPosition falha', async () => {
    mockedRequestPermissions.mockResolvedValue({ status: 'granted', expires: 0, canAskAgain: false, granted: true } as PermissionResponse);
    mockedGetPosition.mockRejectedValue(new Error('Erro ao obter posicao'));

    const result = await getCurrentLocation();

    expect(result).toBeNull();
  });

  it('retorna null quando reverseGeocode falha', async () => {
    mockedRequestPermissions.mockResolvedValue({ status: 'granted', expires: 0, canAskAgain: false, granted: true } as PermissionResponse);
    mockedGetPosition.mockResolvedValue({
      coords: {
        latitude: -7.2273,
        longitude: -36.5022,
        altitude: 100,
        accuracy: 5,
        altitudeAccuracy: 2,
        heading: 0,
        speed: 0,
      },
      timestamp: Date.now(),
    } as Location.LocationObject);
    mockedReverseGeocode.mockRejectedValue(new Error('Erro ao fazer reverse geocode'));

    const result = await getCurrentLocation();

    expect(result).toBeNull();
  });
});
