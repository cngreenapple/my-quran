import { Link } from "react-router-dom";
import { Search, StickyNote, Trash2, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { NoteCard } from "@/components/NoteCard";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useNotesPage } from "@/hooks/use-notes-page";
import { useDocumentTitle } from "@/hooks/use-document-title";
import { showSuccess } from "@/utils/toast";

interface NotesPageProps {
  onMenuClick: () => void;
}

export default function NotesPage({ onMenuClick }: NotesPageProps) {
  useDocumentTitle("Catatan");

  const { notes, totalCount, query, setQuery, clearNotes, confirming, setConfirming } = useNotesPage();
  const { removeNote } = useNotesPage();

  const handleClearAll = () => {
    clearNotes();
    showSuccess("Semua catatan dihapus");
    setConfirming(false);
  };

  return (
    <div className="min-h-dvh bg-background">
      <Header onMenuClick={onMenuClick} />
      <main className="container mx-auto px-3 py-3 pb-32 md:pb-12 max-w-3xl" aria-labelledby="notes-title">
        <section className="mb-4">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div>
              <h1 id="notes-title" className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
                <StickyNote className="w-6 h-6 text-violet-500" aria-hidden="true" />Catatan
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">Refleksi & catatan pribadi Anda ({totalCount})</p>
            </div>
            {totalCount > 0 && (
              <Button variant="ghost" size="sm" onClick={() => setConfirming(true)} className="rounded-full text-destructive hover:text-destructive h-7 text-xs">
                <Trash2 className="w-3.5 h-3.5 mr-1" />Hapus Semua
              </Button>
            )}
          </div>
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" aria-hidden="true" />
            <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Cari catatan..." className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-border/60 bg-card focus:outline-none focus:ring-2 focus:ring-primary/30" aria-label="Cari catatan" />
          </div>
        </section>

        {notes.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-3" aria-hidden="true">
              <StickyNote className="w-7 h-7 text-muted-foreground" />
            </div>
            <h2 className="text-base font-bold mb-1">{totalCount === 0 ? "Belum ada catatan" : "Tidak ditemukan"}</h2>
            <p className="text-xs text-muted-foreground mb-4 max-w-xs mx-auto">
              {totalCount === 0 ? "Catatan membantu merefleksikan ayat." : `Catatan dengan kata kunci "${query}" tidak ditemukan.`}
            </p>
            {totalCount === 0 && (
              <Button asChild className="rounded-full h-9"><Link to="/"><BookOpen className="w-3.5 h-3.5 mr-1.5" />Jelajahi Surat</Link></Button>
            )}
          </div>
        ) : (
          <ul className="space-y-2.5 animate-fade-in" role="list">
            {notes.map((note) => (
              <li key={note.id}>
                <NoteCard note={note} onDelete={() => { removeNote(note.id); showSuccess("Catatan dihapus"); }} />
              </li>
            ))}
          </ul>
        )}
      </main>

      <AlertDialog open={confirming} onOpenChange={setConfirming}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Semua Catatan?</AlertDialogTitle>
            <AlertDialogDescription>Tindakan ini tidak dapat dibatalkan.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full">Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleClearAll} className="rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90">Hapus Semua</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}