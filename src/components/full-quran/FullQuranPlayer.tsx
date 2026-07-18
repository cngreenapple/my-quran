import { useCallback, useMemo, useRef, useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useFullQuranPlayer } from "@/hooks/use-full-quran-player";
import { useQueueDropdown } from "@/hooks/use-queue-dropdown";
import { CollapsedTrigger } from "./CollapsedTrigger";
import { PlayerHeader } from "./PlayerHeader";
import { PlayerProgress } from "./PlayerProgress";
import { PlayerControls } from "./PlayerControls";
import { PlayerExpandedActions } from "./PlayerExpandedActions";
import { QueueDropdown, type QueueDropdownItem } from "./QueueDropdown";

interface FullQuranPlayerProps {
  className?: string;
}

/**
 * FullQuranPlayer — pemutar murottal Al-Qur'an full.
 *
 * Anti-glitch strategy (mobile):
 * - Area expandable di-wrap `SmoothHeight` yang pakai CSS `max-height` transition
 *   (bukan mount/unmount). Konten tetap di-mount, hanya height yang di-animate.
 * - `will-change: max-height, opacity` → GPU compositor layer, hindari re-paint.
 * - `overflow: hidden` cegah bocor saat collapsed.
 * - Initial mount: skip animasi supaya tidak flash saat page load.
 */
export function FullQuranPlayer({ className }: FullQuranPlayerProps) {
  const {
    expanded,
    showRangePicker,
    fromNomor,
    toNomor,
    setFromNomor,
    setToNomor,
    queue,
    surahList,
    isSurahListLoading,
    audio,
    handlePlayFull,
    handlePlayRange,
    handleStop,
    openRangePicker,
    closeRangePicker,
    toggleExpanded,
  } = useFullQuranPlayer();

  const queueItems: QueueDropdownItem[] = useMemo(() => {
    if (!surahList) return [];
    return queue.queue.map((nomor, idx) => {
      const surah = surahList.find((s) => s.nomor === nomor);
      return {
        nomor,
        namaLatin: surah?.namaLatin || `Surah ${nomor}`,
        nama: surah?.nama || "",
        tempatTurun: surah?.tempatTurun || "",
        jumlahAyat: surah?.jumlahAyat || 0,
        queueIndex: idx,
        isCurrent: idx === queue.currentIndex,
      };
    });
  }, [queue.queue, queue.currentIndex, surahList]);

  const currentSurahInfo = useMemo(() => {
    if (queue.currentSurah === null || !surahList) return null;
    return surahList.find((s) => s.nomor === queue.currentSurah) ?? null;
  }, [queue.currentSurah, surahList]);

  const dropdown = useQueueDropdown<QueueDropdownItem>({
    totalItems: queue.totalInQueue,
    items: queueItems,
  });

  const handleItemClick = useCallback(
    (queueIndex: number) => {
      queue.jumpTo(queueIndex);
      dropdown.close();
    },
    [queue, dropdown],
  );

  if (!queue.isActive && !expanded) {
    return <CollapsedTrigger onClick={toggleExpanded} className={className} />;
  }

  return (
    <Card
      className={cn(
        "overflow-hidden border-emerald-500/30 bg-gradient-to-br from-emerald-500/8 via-emerald-500/3 to-transparent shadow-sm",
        className,
      )}
    >
      <CardContent className="p-3 space-y-2.5">
        {/* Header — always visible */}
        <PlayerHeader
          currentSurah={currentSurahInfo}
          currentIndex={queue.currentIndex}
          totalInQueue={queue.totalInQueue}
          isActive={queue.isActive}
          isDropdownOpen={dropdown.open}
          onToggleDropdown={dropdown.toggle}
          onStop={handleStop}
          expanded={expanded}
          onToggleExpanded={toggleExpanded}
        />

        {/* Smooth expand: konten tidak di-mount/unmount, height-nya saja yang di-animate */}
        <SmoothHeight shouldExpand={expanded || queue.isActive}>
          <div className="space-y-2.5">
            {queue.isActive && (
              <PlayerProgress
                percent={queue.progressPercent}
                remaining={queue.remaining}
              />
            )}

            {queue.isActive && (
              <PlayerControls
                isPlaying={audio.isPlaying}
                isLoading={audio.isLoadingAudio}
                onTogglePlay={audio.togglePlay}
                canGoPrev={queue.currentIndex > 0}
                onPrev={queue.prev}
                canGoNext={
                  queue.currentIndex < queue.queue.length - 1 ||
                  queue.repeatMode === "queue"
                }
                onNext={queue.next}
                isShuffled={queue.isShuffled}
                onToggleShuffle={queue.toggleShuffle}
                repeatMode={queue.repeatMode}
                onCycleRepeat={queue.cycleRepeat}
              />
            )}

            {expanded && (
              <PlayerExpandedActions
                isSurahListLoading={isSurahListLoading}
                showRangePicker={showRangePicker}
                fromNomor={fromNomor}
                toNomor={toNomor}
                onOpenRangePicker={openRangePicker}
                onCloseRangePicker={closeRangePicker}
                onFromChange={setFromNomor}
                onToChange={setToNomor}
                onPlayFull={handlePlayFull}
                onPlayRange={handlePlayRange}
                surahList={surahList}
              />
            )}

            {queue.isActive && (
              <p className="text-[10px] text-muted-foreground text-center leading-relaxed">
                Audio akan otomatis lanjut ke surah berikutnya. Tap X untuk berhenti.
              </p>
            )}
          </div>
        </SmoothHeight>
      </CardContent>

      <QueueDropdown
        open={dropdown.open}
        position={dropdown.position}
        search={dropdown.search}
        onSearchChange={dropdown.setSearch}
        items={queueItems}
        totalItems={queue.totalInQueue}
        listRef={dropdown.listRef}
        onItemClick={handleItemClick}
        playingSurahNumber={
          audio.isPlaying ? audio.currentSurah : null
        }
      />
    </Card>
  );
}

// ============================================================================
// SmoothHeight — height animasi via max-height (tanpa mount/unmount)
// ============================================================================

interface SmoothHeightProps {
  shouldExpand: boolean;
  children: React.ReactNode;
  durationMs?: number;
}

/**
 * SmoothHeight: bungkus children dengan transisi max-height + opacity.
 *
 * Logic:
 * - shouldExpand = true  → max-height: 3000px, opacity: 1
 * - shouldExpand = false → max-height: 0,     opacity: 0
 * - Transition: max-height 300ms ease, opacity 200ms ease
 * - overflow: hidden mencegah overflow saat collapsed
 * - will-change: GPU compositing
 * - Initial mount: kalau belum pernah expand dan tidak expand → render tanpa delay
 *   (hindari animasi flash saat page load)
 */
function SmoothHeight({ shouldExpand, children, durationMs = 300 }: SmoothHeightProps) {
  const [hasEverExpanded, setHasEverExpanded] = useState(false);
  const prevRef = useRef(shouldExpand);

  useEffect(() => {
    if (shouldExpand && !prevRef.current) {
      setHasEverExpanded(true);
    }
    prevRef.current = shouldExpand;
  }, [shouldExpand]);

  const isOpen = shouldExpand;

  // Initial mount (belum pernah expand & tidak expand) → render 0-height tanpa transition
  if (!isOpen && !hasEverExpanded) {
    return (
      <div
        className="overflow-hidden"
        style={{ maxHeight: 0, opacity: 0, willChange: "max-height, opacity" }}
        aria-hidden
      >
        {children}
      </div>
    );
  }

  return (
    <div
      className="overflow-hidden"
      style={{
        maxHeight: isOpen ? 3000 : 0,
        opacity: isOpen ? 1 : 0,
        willChange: "max-height, opacity",
        transition: `max-height ${durationMs}ms ease, opacity 200ms ease`,
      }}
      aria-hidden={!isOpen}
    >
      {children}
    </div>
  );
}