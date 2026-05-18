import * as Location from 'expo-location';
import { useEffect, useRef, useState } from 'react';

import { GPS_REFERENCE_POINTS } from '@/constants/mapData';
import type { MapPosition } from '@/types/map';
import { gpsToPixel, initTransform } from '@/utils/coordinateTransform';

interface UserLocationState {
  pixelPosition: MapPosition | null;
  heading: number | null;
  error: string | null;
  permissionGranted: boolean;
}

export function useUserLocation(enabled: boolean): UserLocationState {
  const [state, setState] = useState<UserLocationState>({
    pixelPosition: null,
    heading: null,
    error: null,
    permissionGranted: false,
  });
  const subscriptionRef = useRef<Location.LocationSubscription | null>(null);
  const transformReady = useRef(false);

  useEffect(() => {
    if (!enabled) {
      subscriptionRef.current?.remove();
      subscriptionRef.current = null;
      return;
    }

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
          const pixel = transformReady.current
            ? gpsToPixel(latitude, longitude)
            : null;

          setState((s) => ({
            ...s,
            pixelPosition: pixel,
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
  }, [enabled]);

  return state;
}
