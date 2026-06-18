import { useEffect, useState } from "react";
import { Compass, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQibla } from "@/hooks/use-qibla";
import type { Location } from "@/lib/location";
import { cn } from "@/lib/utils";

interface QiblaCompassProps {
  location: Location | null;
}

export function QiblaCompass({ location }: QiblaCompassProps) {
  const { qibla, rotation, isAligned, permission, requestPermission, startTracking, stopTracking, isTracking } = useQibla(location);
  const [displayRotation, setDisplayRotation] = useState(0);

  useEffect(() => {
    if (!isTracking) {
      setDisplayRotation(0);
      return;
    }
    let raf = 0;
    const animate = () => {
      setDisplayRotation((prev) => {
        const target = rotation;
        const diff = ((target - prev + 540) % 360) - 180;
        if (Math.abs(diff) < 0.1) return target;
        return (prev + diff * 0.15 + 360) % 360;
      });
      raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [rotation, isTracking]);

  const handleStart = async () => {
    if (permission === "prompt" || permission === "denied") {
      const result = await requestPermission();
      if (result === "granted") startTracking();
    } else if (permission === "granted") {
      startTracking();
    }
  };

  if (!location) {
    return (
      <div className="text-center py-10">
        <Loader2 className="w-7 h-7 mx-auto animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-56 h-56 sm:w-64 sm:h-64 mb-4">
        <div
          className={cn(
            "absolute inset-0 rounded-full border-4 transition-colors duration-500",
            isAligned ? "border-emerald-500 shadow-xl shadow-emerald-500/30" : "border-border/60",
          )}
        />
        <div
          className="absolute inset-2 rounded-full bg-gradient-to-br from-card to-muted shadow-inner overflow-hidden"
          style={{
            transform: isTracking ? `rotate(${-displayRotation}deg)` : undefined,
            transition: isTracking ? "none" : "transform 0.5s ease-out",
          }}
        >
          <div className="absolute inset-0">
            <span className="absolute top-2 left-1/2 -translate-x-1/2 text-xs font-bold text-foreground">U</span>
            <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs font-bold text-muted-foreground">S</span>
            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">B</span>
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">T</span>
          </div>
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 200">
            {Array.from({ length: 72 }).map((_, i) => {
              const angle = i * 5;
              const isMajor = angle % 30 === 0;
              const isMid = angle % 10 === 0;
              const length = isMajor ? 12 : isMid ? 8 : 4;
              const opacity = isMajor ? 0.7 : isMid ? 0.4 : 0.2;
              return (
                <line
                  key={i}
                  x1="100"
                  y1="20"
                  x2="100"
                  y2={20 + length}
                  stroke="currentColor"
                  strokeWidth={isMajor ? 1.5 : 1}
                  opacity={opacity}
                  className="text-foreground"
                  transform={`rotate(${angle} 100 100)`}
                />
              );
            })}
            <g transform={`rotate(${qibla?.bearing || 0} 100 100)`}>
              <path d="M 95 15 L 100 5 L 105 15 L 100 10 Z" fill="#059669" stroke="#047857" strokeWidth="0.5" />
              <text x="100" y="0" textAnchor="middle" className="fill-emerald-700 dark:fill-emerald-400" fontSize="8" fontWeight="bold">
                Ka'bah
              </text>
            </g>
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-primary" />
          </div>
        </div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
          <div className="w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[16px] border-t-emerald-600 dark:border-t-emerald-400" />
        </div>
      </div>

      <div className="text-center mb-3 px-4">
        {isAligned ? (
          <div className="space-y-0.5">
            <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-2">
              <Compass className="w-4 h-4" />
              Anda menghadap Ka'bah
            </p>
            <p className="text-[11px] text-muted-foreground">Arah sudah tepat</p>
          </div>
        ) : isTracking && qibla ? (
          <div className="space-y-0.5">
            <p className="text-xs font-semibold text-foreground">
              {rotation < 180
                ? `Putar ${Math.round(rotation)}° ke kanan`
                : `Putar ${Math.round(360 - rotation)}° ke kiri`}
            </p>
            <p className="text-[11px] text-muted-foreground">Arahkan perangkat Anda</p>
          </div>
        ) : (
          <div className="space-y-0.5">
            <p className="text-xs font-semibold text-foreground">
              Arah Kiblat: {qibla?.bearing.toFixed(1)}°
            </p>
            <p className="text-[11px] text-muted-foreground">
              Jarak ke Ka'bah:{" "}
              {qibla
                ? qibla.distance < 1000
                  ? `${qibla.distance.toFixed(0)} km`
                  : `${(qibla.distance / 1000).toFixed(0)} ribu km`
                : "-"}
            </p>
          </div>
        )}
      </div>

      {!isTracking ? (
        <Button
          onClick={handleStart}
          disabled={permission === "unsupported" || permission === "denied"}
          className="rounded-full gap-2 h-8 text-xs"
          size="sm"
        >
          {permission === "prompt" || permission === "denied" ? (
            <>
              <AlertCircle className="w-3.5 h-3.5" />
              Izinkan Sensor
            </>
          ) : permission === "unsupported" ? (
            <>
              <Compass className="w-3.5 h-3.5" />
              Sensor Tidak Didukung
            </>
          ) : (
            <>
              <Compass className="w-3.5 h-3.5" />
              Mulai Kompas
            </>
          )}
        </Button>
      ) : (
        <Button onClick={stopTracking} variant="outline" className="rounded-full h-8 text-xs" size="sm">
          Hentikan
        </Button>
      )}
    </div>
  );
}