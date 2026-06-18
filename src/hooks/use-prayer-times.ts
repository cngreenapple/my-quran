import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  fetchPrayerSchedule,
  getPrayerList,
  getNextPrayer,
  type PrayerSchedule,
  type PrayerTime,
} from "@/lib/prayer-times";
import { fetchLocation, type Location } from "@/lib/location";

const PRAYER_METHOD_KEY = "quran-prayer-method";
const PRAYER_SCHOOL_KEY = "quran-prayer-school";

function getStoredMethod(): number {
  try {
    const stored = localStorage.getItem(PRAYER_METHOD_KEY);
    if (stored) {
      const n = parseInt(stored, 10);
      if (!isNaN(n)) return n;
    }
  } catch {}
  return 11; // KEMENAG default
}

function getStoredSchool(): 0 | 1 {
  try {
    const stored = localStorage.getItem(PRAYER_SCHOOL_KEY);
    if (stored === "1") return 1;
  } catch {}
  return 0; // Shafii default
}

export function setStoredMethod(method: number) {
  try {
    localStorage.setItem(PRAYER_METHOD_KEY, method.toString());
  } catch {}
}

export function setStoredSchool(school: 0 | 1) {
  try {
    localStorage.setItem(PRAYER_SCHOOL_KEY, school.toString());
  } catch {}
}

export function usePrayerTimes() {
  const [method, setMethodState] = useState<number>(() => getStoredMethod());
  const [school, setSchoolState] = useState<0 | 1>(() => getStoredSchool());
  const [location, setLocation] = useState<Location | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);
  const [now, setNow] = useState(() => new Date());
  const hasInitializedRef = useRef(false);
  // Track mounted state supaya async callback tidak update state
  // setelah component unmount (avoid memory leak warning & spurious renders)
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Initial location fetch (once on mount)
  useEffect(() => {
    if (hasInitializedRef.current) return;
    hasInitializedRef.current = true;

    const cached = (() => {
      try {
        const stored = localStorage.getItem("quran-user-location");
        if (!stored) return null;
        const parsed = JSON.parse(stored);
        if (typeof parsed.lat === "number" && typeof parsed.lng === "number") {
          return parsed as Location;
        }
      } catch {}
      return null;
    })();

    if (cached) {
      setLocation(cached);
    } else {
      // Try to fetch location
      setIsFetchingLocation(true);
      fetchLocation({ preferGPS: false }) // Default: prefer IP (less intrusive)
        .then((loc) => {
          if (isMountedRef.current) setLocation(loc);
        })
        .catch((err) => {
          if (!isMountedRef.current) return;
          console.warn("[Prayer] Location fetch failed", err);
          setLocationError(
            err instanceof Error ? err.message : "Gagal mendapatkan lokasi",
          );
        })
        .finally(() => {
          if (isMountedRef.current) setIsFetchingLocation(false);
        });
    }
  }, []);

  const setMethod = useCallback((m: number) => {
    setMethodState(m);
    setStoredMethod(m);
  }, []);

  const setSchool = useCallback((s: 0 | 1) => {
    setSchoolState(s);
    setStoredSchool(s);
  }, []);

  const requestLocation = useCallback(async (force = false) => {
    setIsFetchingLocation(true);
    setLocationError(null);
    try {
      const loc = await fetchLocation({ force, preferGPS: true });
      if (isMountedRef.current) setLocation(loc);
      return loc;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Gagal mendapatkan lokasi";
      if (isMountedRef.current) setLocationError(msg);
      throw err;
    } finally {
      if (isMountedRef.current) setIsFetchingLocation(false);
    }
  }, []);

  // Query for prayer schedule
  const query = useQuery<PrayerSchedule>({
    queryKey: ["prayer-times", location?.lat, location?.lng, method, school],
    queryFn: () => {
      if (!location) throw new Error("Location not available");
      return fetchPrayerSchedule(location, new Date(), { method, school });
    },
    enabled: !!location,
    staleTime: 1000 * 60 * 60, // 1 jam
    gcTime: 1000 * 60 * 60 * 24,
    refetchOnWindowFocus: false,
    retry: 2,
  });

  // Tick `now` setiap detik untuk countdown
  // Pakai ref untuk cleanup supaya interval jelas
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  /**
   * Memoize derived data.
   *
   * Sebelumnya `prayerList` & `nextPrayerData` di-compute di setiap render.
   * Karena `now` update setiap detik dari setInterval, ini = re-compute
   * setiap detik. Sekarang di-memoize: hanya re-compute kalau schedule/now
   * berubah. Component yang consume (PrayerTimes.tsx) tidak re-render
   * kalau reference sama.
   *
   * NOTE: PrayerTime objects created fresh each time, tapi referensi
   * equality tetap OK selama `now` ms sama dan schedule sama.
   */
  const prayerList: PrayerTime[] = useMemo(
    () => (query.data ? getPrayerList(query.data, now) : []),
    [query.data, now],
  );

  const nextPrayerData = useMemo(
    () => (query.data ? getNextPrayer(query.data, now) : null),
    [query.data, now],
  );

  return {
    schedule: query.data,
    prayerList,
    nextPrayer: nextPrayerData?.prayer ?? null,
    countdownMs: nextPrayerData?.countdownMs ?? 0,
    location,
    locationError,
    isFetchingLocation,
    method,
    school,
    setMethod,
    setSchool,
    requestLocation,
    isLoading: query.isLoading || isFetchingLocation,
    isError: query.isError,
    refetch: () => query.refetch(),
  };
}