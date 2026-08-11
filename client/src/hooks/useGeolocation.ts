// useGeolocation hook - get user's GPS location with smart fallbacks
'use client';
import { useState, useEffect, useCallback, useRef } from 'react';

interface UseGeolocationOptions {
  autoRun?: boolean;
  /** Enable IP-based region fallback when browser geolocation is unavailable/blocked */
  enableIpFallback?: boolean;
}

interface Coords {
  lat: number;
  lon: number;
}

export type LocationErrorCode =
  | 'PERMISSION_DENIED'
  | 'POSITION_UNAVAILABLE'
  | 'TIMEOUT'
  | 'UNSUPPORTED'
  | 'NONE';

type PermissionState = 'prompt' | 'granted' | 'denied' | 'unsupported' | 'unknown';

interface GeolocationResult {
  lat: number | null;
  lon: number | null;
  loading: boolean;
  error: string | null;
  errorCode: LocationErrorCode;
  /** Current permission state from the Permissions API (best-effort) */
  permissionState: PermissionState;
  /** true when coords came from IP fallback rather than GPS */
  isIpFallback: boolean;
  getLocation: () => Promise<Coords | null>;
}

const ERROR_MESSAGES: Record<LocationErrorCode, string> = {
  PERMISSION_DENIED:
    'Location permission was blocked in your browser. Click the location icon in the address bar to allow access, then try again.',
  POSITION_UNAVAILABLE:
    'Unable to determine your position. Please check that Windows location services are enabled (Settings → Privacy → Location).',
  TIMEOUT: 'Location request timed out. Please try again.',
  UNSUPPORTED: 'Geolocation is not supported by your browser.',
  NONE: '',
};

/** IP-based fallback so the app still detects a region when GPS is blocked/unavailable. */
async function getIpLocation(): Promise<Coords | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    const res = await fetch('http://ip-api.com/json/?fields=lat,lon,status', {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    if (!res.ok) return null;
    const data = await res.json();
    if (data.status !== 'success' || typeof data.lat !== 'number' || typeof data.lon !== 'number') {
      return null;
    }
    return { lat: data.lat, lon: data.lon };
  } catch {
    return null;
  }
}

export const useGeolocation = (options?: UseGeolocationOptions): GeolocationResult => {
  const { autoRun = true, enableIpFallback = true } = options || {};
  const [lat, setLat] = useState<number | null>(null);
  const [lon, setLon] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<LocationErrorCode>('NONE');
  const [permissionState, setPermissionState] = useState<PermissionState>('unknown');
  const [isIpFallback, setIsIpFallback] = useState(false);
  const mountedRef = useRef(false);

  // Track permission state via the Permissions API when available
  useEffect(() => {
    if (typeof navigator === 'undefined' || !('geolocation' in navigator) || !('permissions' in navigator)) {
      setPermissionState('unsupported');
      return;
    }
    let cancelled = false;
    navigator.permissions
      .query({ name: 'geolocation' as PermissionName })
      .then((status) => {
        if (cancelled) return;
        setPermissionState(status.state);
        const onChange = () => {
          if (!cancelled) setPermissionState(status.state);
        };
        status.addEventListener('change', onChange);
      })
      .catch(() => {
        if (!cancelled) setPermissionState('unknown');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const getLocation = useCallback((): Promise<Coords | null> => {
    return new Promise((resolve) => {
      if (typeof navigator === 'undefined' || !navigator.geolocation) {
        setErrorCode('UNSUPPORTED');
        setError(ERROR_MESSAGES.UNSUPPORTED);
        resolve(null);
        return;
      }

      setLoading(true);
      setError(null);
      setErrorCode('NONE');

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          };
          setLat(coords.lat);
          setLon(coords.lon);
          setIsIpFallback(false);
          setLoading(false);
          resolve(coords);
        },
        async (err) => {
          // Map browser error codes
          let code: LocationErrorCode = 'POSITION_UNAVAILABLE';
          if (err.code === 1) code = 'PERMISSION_DENIED';
          else if (err.code === 2) code = 'POSITION_UNAVAILABLE';
          else if (err.code === 3) code = 'TIMEOUT';

          // If permission is denied or position unavailable, try IP fallback
          if (enableIpFallback && (code === 'PERMISSION_DENIED' || code === 'POSITION_UNAVAILABLE')) {
            const ipCoords = await getIpLocation();
            if (ipCoords) {
              setLat(ipCoords.lat);
              setLon(ipCoords.lon);
              setIsIpFallback(true);
              setError(null);
              setErrorCode('NONE');
              setLoading(false);
              resolve(ipCoords);
              return;
            }
          }

          setErrorCode(code);
          setError(ERROR_MESSAGES[code]);
          setLoading(false);
          resolve(null);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      );
    });
  }, [enableIpFallback]);

  useEffect(() => {
    mountedRef.current = true;
    if (autoRun) {
      getLocation();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoRun]);

  return { lat, lon, loading, error, errorCode, permissionState, isIpFallback, getLocation };
};

export { ERROR_MESSAGES };
