` and `<dyad-write path="src/hooks/useQueueDropdown.ts" description="...">`.

Wait, but in my refactor turn, I used path `src/hooks/use-full-quran-player.ts` in one description but then in another description used `src/hooks/useQueueDropdown.ts` — inconsistent! Let me re-check what paths I actually wrote.

Looking back:
1. `<dyad-write path="src/hooks/useFullQuranPlayer.ts" ...>` — camelCase
2. `<dyad-write path="src/hooks/useQueueDropdown.ts" ...>` — camelCase
3. `<dyad-write path="src/hooks/use-full-quran-player.ts" ...>` — kebab-case (different!)
4. `<dyad-write path="src/hooks/use-queue-dropdown.ts" ...>` — kebab-case (different!)

So I wrote 4 files but with 2 different naming conventions. Then in the FullQuranPlayer.tsx composer I imported with kebab-case: `@/hooks/use-full-quran-player` and `@/hooks/use-queue-dropdown`.

The error is that kebab-case paths don't exist. Files exist as camelCase `useFullQuranPlayer.ts` and `useQueueDropdown.ts`.

Wait but the codebase has BOTH styles existing already:
- `use-dzikir-counter.tsx` (kebab)
- `use-bookmarks.tsx` (kebab)
- `use-prayer-times.ts` (kebab)
- `use-surah-list.ts` (kebab)
- `useFullQuranPlayer.ts` — I created in turn 3 (camelCase)
- `useQueueDropdown.ts` — I created in turn 3 (camelCase)
- `use-full-quran-player.ts` — I described in turn 4 but...

Actually, let me re-check. Looking at turn 3 (the refactor turn), I wrote:
- `<dyad-write path="src/hooks/useFullQuranPlayer.ts" ...>` 
- `<dyad-write path="src/hooks/useQueueDropdown.ts" ...>`
- `<dyad-write path="src/components/full-quran/CollapsedTrigger.tsx" ...>`
- ... 7 files in full-quran/

Then in turn 4 (the bug fix turn), I wrote:
- `<dyad-write path="src/hooks/use-full-quran-player.ts" description="...">` — but this OVERWROTE the previous file with same content but different name!
- `<dyad-write path="src/hooks/use-queue-dropdown.ts" description="...">` — same

Hmm wait, did the second write actually overwrite the first, or create a duplicate?

Looking more carefully at turn 3, my first dyad-write for `useFullQuranPlayer.ts` had path `src/hooks/useFullQuranPlayer.ts` (camelCase). But the description in FullQuranPlayer.tsx references `@/hooks/use-full-quran-player` (kebab-case). 

So actually I created the file with camelCase path, then imported with kebab-case — bug. 

Let me check what the user is seeing in the error. The error is:
> Failed to resolve import "@/hooks/use-full-quran-player" from "src/components/full-quran/FullQuranPlayer.tsx"

The import is `@/hooks/use-full-quran-player` (kebab-case). The user needs files at that path.

Looking at the existing codebase patterns:
- Existing hooks use kebab-case: `use-dzikir-counter.tsx`, `use-bookmarks.tsx`, `use-prayer-times.ts`, `use-surah-list.ts`
- AI_RULES says: "Directory names MUST be all lower-case (src/pages, src/components, etc.). File names may use mixed-case if you like."

So file names CAN be mixed-case but kebab-case is the convention for hooks here. I should rename to kebab-case to match existing conventions.

Solution: Move/rename the files to match kebab-case. Let me:
1. Delete the camelCase files (if they exist)
2. Create kebab-case versions

Actually, the safest approach:
1. Check what currently exists
2. If `useFullQuranPlayer.ts` exists but `use-full-quran-player.ts` doesn't → create kebab-case and delete camelCase
3. Same for `useQueueDropdown.ts`

Actually, since I don't know exactly what state the files are in (turn 3 created camelCase, turn 4 wrote to kebab-case paths which would create new files with kebab-case names, so now there are BOTH), the cleanest fix is:

1. Delete camelCase files: `useFullQuranPlayer.ts`, `useQueueDropdown.ts`
2. Create kebab-case files: `use-full-quran-player.ts`, `use-queue-dropdown.ts` with same content

But if turn 4 actually wrote to kebab-case, then those files should exist already. Let me check the error message again:
> Failed to resolve import "@/hooks/use-full-quran-player" from "src/components/full-quran/FullQuranPlayer.tsx"

The error means the import cannot be resolved, which means the file at that path doesn't exist. So turn 4's dyad-write to kebab-case might have been ignored, or the dyad-write was attempting to update a file that didn't exist.

Wait, actually I made a critical mistake in my analysis. Let me re-read turn 3 more carefully.

Turn 3 was: "Refactor src/components/FullQuranPlayer.tsx and make it more modular"

The dyad-write commands I used:
1. `<dyad-write path="src/hooks/useFullQuranPlayer.ts" ...>` — created with camelCase path
2. `<dyad-write path="src/hooks/useQueueDropdown.ts" ...>` — created with camelCase path
3-9. Various files in `src/components/full-quran/`

Then the FullQuranPlayer.tsx import in turn 3:
```ts
import { useFullQuranPlayer } from "@/hooks/use-full-quran-player";
import { useQueueDropdown } from "@/hooks/use-queue-dropdown";
```

So imports use kebab-case but files are camelCase. This is a mismatch error.

The fix: rename the files to kebab-case to match imports AND match the existing codebase convention.

Now I need to:
1. Delete `src/hooks/useFullQuranPlayer.ts` 
2. Delete `src/hooks/useQueueDropdown.ts`
3. Create `src/hooks/use-full-quran-player.ts`
4. Create `src/hooks/use-queue-dropdown.ts`

Let me do this. I'll use `<dyad-delete>` for the camelCase files and `<dyad-write>` for kebab-case. Or actually, I should just create the kebab-case files and delete the camelCase ones.

Wait, but dyad-delete might fail if the file doesn't exist on the user's filesystem (e.g., if turn 4 already wrote them to kebab-case). Let me just be safe — try to create the kebab-case and if dyad-write fails, then handle it.

Actually let me think more carefully. The user is reporting an error. The error is that the kebab-case import doesn't resolve. So the kebab-case file doesn't exist. The camelCase file probably does (from turn 3).

Best approach:
1. Create `src/hooks/use-full-quran-player.ts` (kebab-case)
2. Create `src/hooks/use-queue-dropdown.ts` (kebab-case)  
3. Delete `src/hooks/useFullQuranPlayer.ts` (camelCase)
4. Delete `src/hooks/useQueueDropdown.ts` (camelCase)

Let me write the kebab-case files (same content as camelCase from turn 3, but with kebab-case paths). Then delete the camelCase files.

For the delete — I'll use dyad-delete tags. If the files don't exist, dyad might error but I think it's worth trying.

Actually, I think the cleanest thing is just to:
1. Write the kebab-case files (they'll be created or updated)
2. Delete the camelCase files

If turn 3 had already written camelCase files, the kebab-case writes are new creates (no overwrites), and then I delete the camelCase ones.

Let me proceed.</think>

I see the issue. Saya buat hooks dengan **camelCase** path (`useFullQuranPlayer.ts`) tapi import-nya pakai **kebab-case** (`@/hooks/use-full-quran-player`). Vite resolver gagal menemukan file di path kebab-case.

Fix: rename file ke **kebab-case** untuk match dengan import AND match existing convention (`use-dzikir-counter.tsx`, `use-prayer-times.ts`, dll):

<dyad-write path="src/hooks/use-full-quran-player.ts" description="useFullQuranPlayer (kebab-case path) — orchestrator FullQuranPlayer. Wrap useAudioQueue + useAudio + UI state (expanded, rangePicker, range values). Returns unified interface untuk presentational components consume.">
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
 *
 * UI components tinggal consume return value — tidak perlu tahu
 * tentang audio/queue integration.
 */
export function useFullQuranPlayer() {
  const audio = useAudio();
  const { data: surahList } = useSurahList();

  const queue = useAudioQueue({
    surahList,
    onPlaySurah: audio.play,
    onStop: audio.stop,
  });

  // Subscribe ke audio.onSurahEnded supaya queue bisa auto-next
  useEffect(() => {
    const unsubscribe = audio.onSurahEnded((surahNumber) => {
      return queue.onSurahEnded(surahNumber);
    });
    return unsubscribe;
  }, [audio, queue]);

  // UI state
  const [expanded, setExpanded] = useState(false);
  const [showRangePicker, setShowRangePicker] = useState(false);
  const [fromNomor, setFromNomor] = useState(1);
  const [toNomor, setToNomor] = useState(30);

  // Handlers
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
    // State
    expanded,
    showRangePicker,
    fromNomor,
    toNomor,
    setFromNomor,
    setToNomor,

    // Queue
    queue,
    surahList,
    isSurahListLoading: !surahList,

    // Audio
    audio,

    // Handlers
    handlePlayFull,
    handlePlayRange,
    handleStop,
    openRangePicker,
    closeRangePicker,
    toggleExpanded,
  };
}