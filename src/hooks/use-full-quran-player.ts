import { useCallback, useEffect, useState } from "react";
import { useAudio } from "@/contexts/audio-context";
import { useAudioQueue } from "@/hooks/use-audio-queue";
import { useSurahList } from "@/hooks/use-surah-list";

/**
 * Orchestrator hook untuk FullQuranPlayer.
 *
 * Tanggung jawab:
 * - Connect useAudioQueue + useAudio
 * - Manage UI state (expanded, range picker, range values)
 * - Subscribe ke "surah ended" event dari audio context
 * - Provide high-level handlers (playAll, playRange, stop, toggleExpanded)
 */
export function useFullQuranPlayer() {
  const audio = useAudio();
  const { data: surahList } = useSurahList();

  const queue = useAudioQueue({
    surahList,
    onPlaySurah: audio.play,
    onStop: audio.stop,
  });

  useEffect(() => {
    const unsubscribe = audio.onSurahEnded((surahNumber) => {
      return queue.onSurahEnded(surahNumber);
    });
    return unsubscribe;
  }, [audio, queue]);

  const [expanded, setExpanded] = useState(false);
  const [showRangePicker, setShowRangePicker] = useState(false);
  const [fromNomor, setFromNomor] = useState(1);
  const [toNomor, setToNomor] = useState(30);

  const handlePlayFull = useCallback(() => {
    queue.playAll();
    setShowRangePicker(false);
  }, [queue]);

  const handlePlayRange = useCallback(() => {
    queue.playRange(fromNomor, toNomor);
    setShowRangePicker(false);
  }, [queue, fromNomor, toNomor]);

  const handleStop = useCallback(() => {
    queue.stop();
  }, [queue]);

  const openRangePicker = useCallback(() => setShowRangePicker(true), []);
  const closeRangePicker = useCallback(() => setShowRangePicker(false), []);
  const toggleExpanded = useCallback(() => setExpanded((v) => !v), []);

  return {
    expanded,
    showRangePicker,
    fromNomor,
    toNomor,
    setFromNomor,
    setToNomor,
    queue,
    surahList,
    isSurahListLoading: !surahList,
    audio,
    handlePlayFull,
    handlePlayRange,
    handleStop,
    openRangePicker,
    closeRangePicker,
    toggleExpanded,
  };
}