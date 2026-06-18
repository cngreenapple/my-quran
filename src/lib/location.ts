/**
 * Location service untuk jadwal sholat dan arah kiblat
 * Strategy: GPS → IP Geolocation → Default (Jakarta)
 */

export interface Location {
  lat: number;
  lng: number;
  city?: string;
  country?: string;
  method?: "gps" | "ip" | "default" | "manual";
}

const DEFAULT_LOCATION: Location = {
  lat: -6.2088,
  lng: 106.8456,
  city: "Jakarta",
  country: "Indonesia",
  method: "default",
};

const STORAGE_KEY = "quran-user-location";
const PERMISSION_KEY = "quran-location-permission";

/**
 * Hitung jarak antara dua koordinat (km) — Haversine formula
 */
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6371; // radius bumi dalam km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Get cached location from localStorage
 */
export function getCachedLocation(): Location | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    const parsed = JSON.parse(stored) as Location;
    if (typeof parsed.lat !== "number" || typeof parsed.lng !== "number") {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function saveLocation(loc: Location) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(loc));
    localStorage.setItem(PERMISSION_KEY, loc.method || "default");
  } catch (err) {
    console.error("[Location] Failed to save", err);
  }
}

export function clearLocation() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(PERMISSION_KEY);
  } catch (err) {
    console.error("[Location] Failed to clear", err);
  }
}

export function getSavedPermissionMethod(): Location["method"] | null {
  try {
    const stored = localStorage.getItem(PERMISSION_KEY);
    if (stored === "gps" || stored === "ip" || stored === "default" || stored === "manual") {
      return stored;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Get GPS location dari browser (butuh HTTPS + permission)
 */
export function getGPSLocation(timeoutMs = 10000): Promise<Location> {
  return new Promise((resolve, reject) => {
    if (!("geolocation" in navigator)) {
      reject(new Error("Geolocation tidak didukung browser"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const loc: Location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          method: "gps",
        };
        // Reverse geocode untuk dapat nama kota (optional, best-effort)
        try {
          const name = await reverseGeocode(loc.lat, loc.lng);
          if (name) {
            loc.city = name.city;
            loc.country = name.country;
          }
        } catch (err) {
          console.warn("[Location] Reverse geocode failed", err);
        }
        resolve(loc);
      },
      (err) => {
        reject(new Error(err.message || "Gagal mendapatkan lokasi GPS"));
      },
      {
        enableHighAccuracy: true,
        timeout: timeoutMs,
        maximumAge: 5 * 60 * 1000, // 5 menit cache
      },
    );
  });
}

/**
 * IP-based geolocation fallback (gratis, no API key)
 * Pakai ip-api.com — rate limited 45 req/min
 */
export async function getIPLocation(): Promise<Location> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const res = await fetch("http://ip-api.com/json/?fields=status,country,regionName,city,lat,lon", {
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    if (data.status !== "success") {
      throw new Error("IP geolocation failed");
    }

    return {
      lat: data.lat,
      lng: data.lon,
      city: data.city,
      country: data.country,
      method: "ip",
    };
  } catch (err) {
    console.warn("[Location] IP fallback failed", err);
    throw err;
  }
}

/**
 * Optional: reverse geocode ke nama kota (best-effort, pakai Nominatim)
 */
async function reverseGeocode(
  lat: number,
  lng: number,
): Promise<{ city: string; country: string } | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=id`,
      { signal: controller.signal, headers: { "User-Agent": "AlQuranApp/1.0" } },
    );
    clearTimeout(timeout);

    if (!res.ok) return null;
    const data = await res.json();
    return {
      city: data.address?.city || data.address?.town || data.address?.village || data.address?.county || "",
      country: data.address?.country || "",
    };
  } catch {
    return null;
  }
}

/**
 * Smart location fetcher: GPS → IP → default
 * Returns cached location kalau ada dan < 1 jam
 */
export async function fetchLocation(options: {
  force?: boolean;
  preferGPS?: boolean;
} = {}): Promise<Location> {
  const { force = false, preferGPS = true } = options;

  // 1. Check cache (kecuali force)
  if (!force) {
    const cached = getCachedLocation();
    if (cached) {
      console.log("[Location] Using cached location:", cached);
      return cached;
    }
  }

  // 2. Try GPS
  if (preferGPS) {
    try {
      const gps = await getGPSLocation();
      saveLocation(gps);
      console.log("[Location] Got GPS:", gps);
      return gps;
    } catch (err) {
      console.warn("[Location] GPS failed, trying IP...", err);
    }
  }

  // 3. Try IP
  try {
    const ip = await getIPLocation();
    saveLocation(ip);
    console.log("[Location] Got IP:", ip);
    return ip;
  } catch (err) {
    console.warn("[Location] IP failed, using default", err);
  }

  // 4. Default
  saveLocation(DEFAULT_LOCATION);
  return DEFAULT_LOCATION;
}

/**
 * Save manual location (user pilih dari search/city list)
 */
export function saveManualLocation(loc: Omit<Location, "method">): Location {
  const finalLoc: Location = { ...loc, method: "manual" };
  saveLocation(finalLoc);
  return finalLoc;
}