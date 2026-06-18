import { useState } from "react";
import { Link } from "react-router-dom";
import { Trash2, Edit3, Check, X, StickyNote } from "lucide-react";
import { cn } from "@/lib/utils";
import type { NoteItem } from "@/hooks/use-notes";
import { useNotes } from "@/hooks/use-notes";

const colorClasses: Record<NoteItem["color"], { border: string; bg: string; text: string }> = {
  emerald: { border: "border-emerald-500/30", bg: "bg-emerald-500/5", text: "text-emerald-700 dark:text-emerald-400" },
  amber: { border: "border-amber-500/30", bg: "bg-amber-500/5", text: "text-amber-700 dark:text-amber-400" },
  sky: { border: "border-sky-500/30", bg: "bg-sky-500/5", text: "text-sky-700 dark:text-sky-400" },
  rose: { border: "border-rose-500/30", bg: "bg-rose-500/5", text: "text-rose-700 dark:text-rose-400" },
  violet: { border: "border-violet-500/30", bg: "bg-violet-500/5", text: "text-violet-700 dark:text-violet-400" },
};

interface NoteCardProps {
  note: NoteItem;
  onDelete: () => void;
}

export function NoteCard({ note, onDelete }: NoteCardProps) {
  const { updateNote } = useNotes();
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(note.title);
  const [body, setBody] = useState(note.body);
  const colors = colorClasses[note.color];

  const handleSave = () => { updateNote(note.id, { title: title.trim() || "Tanpa judul", body }); setEditing(false); };
  const handleCancel = () => { setTitle(note.title); setBody(note.body); setEditing(false); };

  return (
    <div className={cn("rounded-2xl border bg-card overflow-hidden", colors.border, colors.bg)}>
      <div className="flex items-start gap-2.5 p-3">
        <div className={cn("shrink-0 w-8 h-8 rounded-xl flex items-center justify-center", colors.bg)} aria-hidden="true"><StickyNote className={cn("w-3.5 h-3.5", colors.text)} /></div>
        <div className="flex-1 min-w-0">
          {editing ? (
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-2 py-1 text-xs font-semibold bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="Judul catatan" autoFocus />
          ) : (
            <h3 className="font-semibold text-xs text-foreground truncate">{note.title}</h3>
          )}
          <Link to={`/surat/${note.surahNumber}#ayat-${note.ayatNumber}`} className={cn("text-[10px] hover:underline mt-0.5 inline-block", colors.text)}>
            {note.surahName} • Ayat {note.ayatNumber}
          </Link>
        </div>
        <div className="flex items-center gap-0.5 shrink-0">
          {editing ? (
            <>
              <button onClick={handleSave} className="w-7 h-7 rounded-lg hover:bg-emerald-500/10 flex items-center justify-center text-emerald-600" aria-label="Simpan perubahan"><Check className="w-3.5 h-3.5" /></button>
              <button onClick={handleCancel} className="w-7 h-7 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground" aria-label="Batal edit"><X className="w-3.5 h-3.5" /></button>
            </>
          ) : (
            <>
              <button onClick={() => setEditing(true)} className="w-7 h-7 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground" aria-label="Edit catatan"><Edit3 className="w-3.5 h-3.5" /></button>
              <button onClick={onDelete} className="w-7 h-7 rounded-lg hover:bg-destructive/10 flex items-center justify-center text-muted-foreground hover:text-destructive" aria-label="Hapus catatan"><Trash2 className="w-3.5 h-3.5" /></button>
            </>
          )}
        </div>
      </div>

      <div className="px-3 pb-3">
        {editing ? (
          <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={3} className="w-full px-2.5 py-2 text-xs bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 resize-y" placeholder="Tulis catatan Anda..." />
        ) : (
          <p className="text-xs text-foreground/85 leading-relaxed whitespace-pre-wrap">{note.body || <span className="italic text-muted-foreground">(Tidak ada isi)</span>}</p>
        )}
        <p className="text-[9px] text-muted-foreground mt-1.5 font-medium">
          Diperbarui {new Date(note.updatedAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
        </p>
      </div>
    </div>
  );
}