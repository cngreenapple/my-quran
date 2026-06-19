import { useCallback, useMemo } from "react";
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
 * Mode Baca Al-Qur'an Full — entry point component.
 *
 * Komposisi:
 * - useFullQuranPlayer: state & logic orchestrator
 * - useQueueDropdown: dropdown positioning & search
 * - Sub-components: header, progress, controls, expanded actions, dropdown list
 *
 * Component ini hanya orchestrate — tidak ada business logic, tidak ada
 * positioning math, tidak ada DOM events handling.
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

  /**
   * Map queue numbers ke full surah info untuk dropdown.
   * Memoized dengan deps yang relevan.
   */
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

  /**
   * Jump ke surah di queue + close dropdown.
   * Wrap dari useCallback supaya tidak re-create tiap render.
   */
  const handleItemClick = useCallback(
    (queueIndex: number) => {
      queue.jumpTo(queueIndex);
      dropdown.close();
    },
    [queue, dropdown],
  );

  // Collapsed: queue inactive & panel closed
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