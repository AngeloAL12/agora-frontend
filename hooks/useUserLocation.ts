import * as Location from 'expo-location';
import { useEffect, useRef, useState } from 'react';

import { CAMPUS_BOUNDS, GPS_REFERENCE_POINTS } from '@/constants/mapData';
import type { MapPosition } from '@/types/map';
import { gpsToPixel, initTransform } from '@/utils/coordinateTransform';

function isInsideCampus(latitude: number, longitude: number): boolean {
  return (
    latitude >= CAMPUS_BOUNDS.south &&
    latitude <= CAMPUS_BOUNDS.north &&
    longitude >= CAMPUS_BOUNDS.west &&
    longitude <= CAMPUS_BOUNDS.east
  );
}

interface UserLocationState {
  pixelPosition: MapPosition | null;
  isOnCampus: boolean;
  heading: number | null;
  error: string | null;
  permissionGranted: boolean;
}

export function useUserLocation(): UserLocationState {
  const [state, setState] = useState<UserLocationState>({
    pixelPosition: null,
    isOnCampus: false,
    heading: null,
    error: null,
    permissionGranted: false,
  });
  const subscriptionRef = useRef<Location.LocationSubscription | null>(null);
  const transformReady = useRef(false);

  useEffect(() => {
    const hasValidRefs = GPS_REFERENCE_POINTS.some(
      (r) => r.gps.latitude !== 0 || r.gps.longitude !== 0,
    );

    if (hasValidRefs) {
      transformReady.current = initTransform(GPS_REFERENCE_POINTS);
    }

    let cancelled = false;

    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (cancelled) return;

      if (status !== 'granted') {
        setState((s) => ({
          ...s,
          error: 'Permiso de ubicación denegado',
          permissionGranted: false,
        }));
        return;
      }

      setState((s) => ({ ...s, permissionGranted: true, error: null }));

      subscriptionRef.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          distanceInterval: 3,
          timeInterval: 2000,
        },
        (location) => {
          if (cancelled) return;
          const { latitude, longitude } = location.coords;
          const onCampus = isInsideCampus(latitude, longitude);
          const pixel =
            onCampus && transformReady.current
              ? gpsToPixel(latitude, longitude)
              : null;

          setState((s) => ({
            ...s,
            pixelPosition: pixel,
            isOnCampus: onCampus,
            heading: location.coords.heading ?? null,
          }));
        },
      );
    })();

    return () => {
      cancelled = true;
      subscriptionRef.current?.remove();
      subscriptionRef.current = null;
    };
  }, []);

  return state;
}
