import { Link } from "react-router-dom";
import {
  Search,
  Bookmark as BookmarkIcon,
  Trash2,
  BookOpen,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { AudioPlayer } from "@/components/AudioPlayer";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useBookmarksPage } from "@/hooks/use-bookmarks-page";
import { useDocumentTitle } from "@/hooks/use-document-title";
import { showSuccess } from "@/utils/toast";
import { cn } from "@/lib/utils";
import { useState } from "react";

export default function BookmarkPage() {
  useDocumentTitle("Bookmark");

  const {
    bookmarks,
    totalCount,
    query,
    setQuery,
    removeBookmark,
    clearBookmarks,
    confirming,
    setConfirming,
  } = useBookmarksPage();

  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleConfirmDelete = () => {
    if (deletingId) {
      removeBookmark(deletingId);
      showSuccess("Bookmark dihapus");
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-dvh bg-background">
      <Header />

      <main
        className="container mx-auto px-4 py-6 pb-32 md:pb-12 max-w-3xl"
        aria-labelledby="bookmark-title"
      >
        <section className="mb-6">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div>
              <h1
                id="bookmark-title"
                className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2"
              >
                <BookmarkIcon className="w-7 h-7 text-amber-500 fill-amber-500" aria-hidden="true" />
                Bookmark
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Ayat-ayat favorit Anda ({totalCount})
              </p>
            </div>
            {totalCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setConfirming(true)}
                className="rounded-full text-destructive hover:text-destructive"
              >
                <Trash2 className="w-4 h-4 mr-1.5" />
                Hapus Semua
              </Button>
            )}
          </div>

          {/* Search */}
          <div className="relative">
            <Search
              className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none"
              aria-hidden="true"
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari di bookmark..."
              className="w-full pl-10 pr-4 py-2.5 text-sm rounded-2xl border border-border/60 bg-card focus:outline-none focus:ring-2 focus:ring-primary/30"
              aria-label="Cari bookmark"
            />
          </div>
        </section>

        {bookmarks.length === 0 ? (
          <div className="text-center py-16 px-4">
            <div
              className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-4"
              aria-hidden="true"
            >
              <BookmarkIcon className="w-10 h-10 text-muted-foreground" />
            </div>
            <h2 className="font-bold text-lg mb-1">
              {totalCount === 0 ? "Belum ada bookmark" : "Tidak ditemukan"}
            </h2>
            <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
              {totalCount === 0
                ? "Tambahkan ayat favorit dari halaman surat dengan menekan ikon bookmark."
                : `Bookmark dengan kata kunci "${query}" tidak ditemukan.`}
            </p>
            {totalCount === 0 && (
              <Button asChild className="rounded-full">
                <Link to="/">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Jelajahi Surat
                </Link>
              </Button>
            )}
          </div>
        ) : (
          <ul className="space-y-2 animate-fade-in" role="list">
            {bookmarks.map((b) => (
              <li key={b.id}>
                <div className="group flex items-stretch rounded-2xl border border-border/60 bg-card overflow-hidden hover:border-amber-500/40 hover:shadow-md transition-all">
                  <Link
                    to={`/surat/${b.surahNumber}#ayat-${b.ayatNumber}`}
                    className="flex-1 min-w-0 p-4 flex items-center gap-3"
                  >
                    <div className="shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white font-bold shadow-md shadow-amber-500/20">
                      {b.ayatNumber}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm text-foreground truncate">
                        {b.surahName}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        Ayat {b.ayatNumber}
                        {b.note && <span className="italic"> • {b.note}</span>}
                      </p>
                      {b.previewText && (
                        <p className="text-xs text-foreground/70 line-clamp-2 mt-1.5 leading-relaxed">
                          {b.previewText}
                        </p>
                      )}
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" aria-hidden="true" />
                  </Link>
                  <button
                    onClick={() => setDeletingId(b.id)}
                    className="px-3 border-l border-border/60 text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-colors"
                    aria-label={`Hapus bookmark ayat ${b.ayatNumber}`}
                  >
                    <Trash2 className="w-4 h-4" aria-hidden="true" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>

      <AlertDialog open={confirming} onOpenChange={setConfirming}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Semua Bookmark?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Semua bookmark akan dihapus permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full">Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                clearBookmarks();
                showSuccess("Semua bookmark dihapus");
                setConfirming(false);
              }}
              className="rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Hapus Semua
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!deletingId} onOpenChange={(open) => !open && setDeletingId(null)}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Bookmark?</AlertDialogTitle>
            <AlertDialogDescription>
              Bookmark untuk ayat ini akan dihapus permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full">Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AudioPlayer />
    </div>
  );
}