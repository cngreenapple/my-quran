import { useState, useEffect, useCallback, useRef } from "react";
import { calculateQiblaBearing, normalizeDeviceHeading, type QiblaInfo, type DeviceOrientation } from "@/lib/qibla";
import type { Location } from "@/lib/location";

export type PermissionState = "unknown" | "granted" | "denied" | "unsupported" | "prompt";

interface UseQiblaReturn {
  qibla: QiblaInfo | null;
  deviceHeading: number | null;
  rotation: number; // rotation needed to face qibla
  isAligned: boolean; // tolerance ±5°
  permission: PermissionState;
  requestPermission: () => Promise<PermissionState>;
  startTracking: () => void;
  stopTracking: () => void;
  isTracking: boolean;
}

const ALIGN_TOLERANCE = 5; // degrees

export function useQibla(location: Location | null): UseQiblaReturn {
  const [deviceHeading, setDeviceHeading] = useState<number | null>(null);
  const [permission, setPermission] = useState<PermissionState>("unknown");
  const [isTracking, setIsTracking] = useState(false);

  // Compute qibla info
  const qibla = location
    ? calculateQiblaBearing(location.lat, location.lng)
    : null;

  // Compute rotation
  const rotation = qibla && deviceHeading !== null
    ? (qibla.bearing - deviceHeading + 360) % 360
    : 0;

  const isAligned = qibla !== null && deviceHeading !== null && Math.abs(rotation) <= ALIGN_TOLERANCE;

  // Check support
  useEffect(() => {
    if (typeof window === "undefined") return;
    const hasDeviceOrientation = "DeviceOrientationEvent" in window;
    // iOS 13+ permission API
    const hasPermissionApi = typeof (DeviceOrientationEvent as unknown as {
      requestPermission?: () => Promise<"granted" | "denied">;
    }).requestPermission === "function";

    if (!hasDeviceOrientation) {
      setPermission("unsupported");
    } else if (!hasPermissionApi) {
      // Android: granted by default, no prompt needed
      setPermission("granted");
    }
  }, []);

  const requestPermission = useCallback(async (): Promise<PermissionState> => {
    if (typeof window === "undefined") return "unsupported";

    const eventClass = DeviceOrientationEvent as unknown as {
      requestPermission?: () => Promise<"granted" | "denied">;
    };

    if (typeof eventClass.requestPermission === "function") {
      try {
        const result = await eventClass.requestPermission();
        const state = result === "granted" ? "granted" : "denied";
        setPermission(state);
        return state;
      } catch (err) {
        console.error("[Qibla] Permission request failed", err);
        setPermission("denied");
        return "denied";
      }
    }

    setPermission("granted");
    return "granted";
  }, []);

  // Stabilkan handleOrientation dengan ref supaya referensi tidak pernah berubah
  const handleOrientationRef = useRef<(e: DeviceOrientationEvent) => void>(() => {});
  handleOrientationRef.current = (e: DeviceOrientationEvent) => {
    const orient: DeviceOrientationEvent = e;
    const heading = normalizeDeviceHeading({
      alpha: orient.alpha,
      webkitCompassHeading: (orient as unknown as { webkitCompassHeading?: number }).webkitCompassHeading,
      webkitCompassAccuracy: (orient as unknown as { webkitCompassAccuracy?: number }).webkitCompassAccuracy,
    });
    if (heading !== null) {
      setDeviceHeading(heading);
    }
  };

  const startTracking = useCallback(() => {
    if (isTracking) return;
    const handler = handleOrientationRef.current;
    window.addEventListener("deviceorientation", handler, true);
    setIsTracking(true);
  }, [isTracking]);

  const stopTracking = useCallback(() => {
    if (!isTracking) return;
    const handler = handleOrientationRef.current;
    window.removeEventListener("deviceorientation", handler, true);
    setIsTracking(false);
  }, [isTracking]);

  // Cleanup on unmount — selalu pakai handler terakhir via ref
  useEffect(() => {
    const handler = handleOrientationRef.current;
    return () => {
      window.removeEventListener("deviceorientation", handler, true);
    };
  }, []);

  return {
    qibla,
    deviceHeading,
    rotation,
    isAligned,
    permission,
    requestPermission,
    startTracking,
    stopTracking,
    isTracking,
  };
}