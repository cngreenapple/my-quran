import { Link } from "react-router-dom";
import { Bookmark, Trash2, BookOpen, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Header } from "@/components/Header";
import { AudioPlayer } from "@/components/AudioPlayer";
import { useBookmarks } from "@/hooks/use-bookmarks";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { showSuccess } from "@/utils/toast";

export default function Bookmark() {
  const { bookmarks, removeBookmark, clearBookmarks } = useBookmarks();

  const handleRemove = (id: string) => {
    removeBookmark(id);
    showSuccess("Bookmark dihapus");
  };

  const handleClearAll = () => {
    clearBookmarks();
    showSuccess("Semua bookmark dihapus");
  };

  return (
    <div className="min-h-screen bg-background bg-mesh dark:bg-mesh-dark">
      <Header />

      <main className="container mx-auto px-4 py-6 pb-32 md:pb-12 max-w-3xl">
        <Button
          variant="ghost"
          asChild
          className="mb-4 -ml-2 rounded-full"
          size="sm"
        >
          <Link to="/">
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Kembali
          </Link>
        </Button>

        <section className="mb-5">
          <div className="flex items-end justify-between gap-3">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
                <Bookmark className="w-7 h-7 text-primary fill-primary/20" />
                Bookmark
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                {bookmarks.length === 0
                  ? "Belum ada ayat yang disimpan"
                  : `${bookmarks.length} ayat tersimpan`}
              </p>
            </div>
            {bookmarks.length > 0 && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive rounded-full">
                    <Trash2 className="w-4 h-4 mr-1.5" />
                    Hapus Semua
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="rounded-2xl">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Hapus Semua Bookmark?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Tindakan ini tidak dapat dibatalkan. Semua bookmark Anda
                      akan dihapus permanen.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="rounded-full">
                      Batal
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleClearAll}
                      className="rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Hapus Semua
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </section>

        {bookmarks.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Bookmark className="w-10 h-10 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Belum Ada Bookmark
            </h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto mb-6">
              Simpan ayat favorit Anda untuk dibaca kembali dengan mudah di
              sini.
            </p>
            <Button asChild className="rounded-full">
              <Link to="/">
                <BookOpen className="w-4 h-4 mr-2" />
                Mulai Membaca
              </Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-3 animate-fade-in">
            {bookmarks.map((item) => (
              <Card
                key={item.id}
                className="overflow-hidden border-border/60 hover:border-primary/30 transition-colors"
              >
                <CardContent className="p-5">
                  <div className="flex items-start gap-3">
                    <Link
                      to={`/surat/${item.surahNumber}#ayat-${item.ayatNumber}`}
                      className="flex-1 min-w-0 group"
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-primary/10 text-primary text-xs font-bold">
                          {item.ayatNumber}
                        </span>
                        <span className="text-xs font-semibold text-muted-foreground">
                          {item.surahName}
                        </span>
                      </div>
                      <p
                        className="font-arabic text-right text-xl leading-[2.2] text-foreground mb-3 group-hover:text-primary transition-colors"
                        dir="rtl"
                        lang="ar"
                      >
                        {item.teksArab}
                      </p>
                      <p className="text-sm text-foreground/80 line-clamp-2 leading-relaxed">
                        {item.teksIndonesia}
                      </p>
                    </Link>
                    <button
                      onClick={() => handleRemove(item.id)}
                      className="shrink-0 w-9 h-9 rounded-full bg-muted hover:bg-destructive/10 text-muted-foreground hover:text-destructive flex items-center justify-center transition-colors"
                      aria-label="Hapus bookmark"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      <AudioPlayer />
    </div>
  );
}