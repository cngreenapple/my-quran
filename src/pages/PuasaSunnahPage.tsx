import { Link } from "react-router-dom";
import { ArrowLeft, Moon, Sparkles, Calendar as CalendarIcon, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Header } from "@/components/Header";
import { AudioPlayer } from "@/components/AudioPlayer";
import { PuasaCalendar } from "@/components/PuasaCalendar";
import { PUASA_SUNNAH, CATEGORY_INFO, type FastingCategory, type FastingItem } from "@/data/puasa-sunnah";
import { useDocumentTitle } from "@/hooks/use-document-title";
import { cn } from "@/lib/utils";
import { useState } from "react";

const colorClasses: Record<FastingItem["color"], { bg: string; border: string; text: string; emojiBg: string }> = {
  emerald: { bg: "bg-emerald-500/5", border: "border-emerald-500/30", text: "text-emerald-700 dark:text-emerald-400", emojiBg: "bg-emerald-500/15" },
  amber: { bg: "bg-amber-500/5", border: "border-amber-500/30", text: "text-amber-700 dark:text-amber-400", emojiBg: "bg-amber-500/15" },
  sky: { bg: "bg-sky-500/5", border: "border-sky-500/30", text: "text-sky-700 dark:text-sky-400", emojiBg: "bg-sky-500/15" },
  rose: { bg: "bg-rose-500/5", border: "border-rose-500/30", text: "text-rose-700 dark:text-rose-400", emojiBg: "bg-rose-500/15" },
  violet: { bg: "bg-violet-500/5", border: "border-violet-500/30", text: "text-violet-700 dark:text-violet-400", emojiBg: "bg-violet-500/15" },
};

interface PuasaSunnahPageProps {
  onMenuClick: () => void;
}

export default function PuasaSunnahPage({ onMenuClick }: PuasaSunnahPageProps) {
  useDocumentTitle("Puasa Sunnah");
  const [filter, setFilter] = useState<FastingCategory | "all">("all");
  const filtered = filter === "all" ? PUASA_SUNNAH : PUASA_SUNNAH.filter((p) => p.category === filter);

  return (
    <div className="min-h-dvh bg-background">
      <Header onMenuClick={onMenuClick} />
      <main className="container mx-auto px-3 py-3 pb-32 md:pb-12 max-w-3xl" aria-labelledby="puasa-title">
        <Button variant="ghost" asChild className="mb-3 -ml-2 rounded-full h-8" size="sm">
          <Link to="/"><ArrowLeft className="w-3.5 h-3.5 mr-1" aria-hidden="true" /><span className="text-xs">Kembali</span></Link>
        </Button>
        <section className="mb-4">
          <h1 id="puasa-title" className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
            <Moon className="w-6 h-6 text-violet-600" aria-hidden="true" />Puasa Sunnah
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">Amalan puasa di luar Ramadan yang diajarkan Rasulullah ﷺ</p>
        </section>

        <section className="mb-4">
          <PuasaCalendar />
        </section>

        <Card className="border-violet-500/30 bg-gradient-to-br from-violet-500/8 via-violet-500/3 to-transparent mb-4 overflow-hidden">
          <CardContent className="p-4 relative">
            <div className="absolute -right-4 -top-4 w-20 h-20 rounded-full bg-violet-500/10" aria-hidden="true" />
            <div className="relative">
              <div className="flex items-center gap-1.5 mb-1.5">
                <Sparkles className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" aria-hidden="true" />
                <p className="text-[9px] font-bold text-violet-600 dark:text-violet-400 uppercase tracking-wider">Keutamaan</p>
              </div>
              <p className="text-xs text-foreground/85 leading-relaxed">
                Puasa sunnah adalah amalan yang sangat dicintai Allah. Raih keberkahan dengan berpuasa di waktu-waktu utama.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-1.5 mb-4 overflow-x-auto no-scrollbar -mx-3 px-3">
          <button onClick={() => setFilter("all")} className={cn("shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap border-2", filter === "all" ? "border-primary bg-primary text-primary-foreground" : "border-border/60 bg-card text-muted-foreground hover:text-foreground")}>
            📚 Semua ({PUASA_SUNNAH.length})
          </button>
          {(Object.keys(CATEGORY_INFO) as FastingCategory[]).map((cat) => {
            const info = CATEGORY_INFO[cat];
            const count = PUASA_SUNNAH.filter((p) => p.category === cat).length;
            return (
              <button key={cat} onClick={() => setFilter(cat)} className={cn("shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap border-2", filter === cat ? "border-primary bg-primary text-primary-foreground" : "border-border/60 bg-card text-muted-foreground hover:text-foreground")}>
                {info.emoji} {info.name} ({count})
              </button>
            );
          })}
        </div>

        <ul className="space-y-2.5 animate-fade-in" role="list">
          {filtered.map((item) => {
            const colors = colorClasses[item.color];
            return (
              <li key={item.id}>
                <Card className={cn("border-border/60 overflow-hidden", colors.bg)}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3 mb-2.5">
                      <div className={cn("shrink-0 w-11 h-11 rounded-xl flex items-center justify-center text-xl", colors.emojiBg)} aria-hidden="true">{item.emoji}</div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-sm text-foreground">{item.title}</h3>
                        {item.arabicName && <p className="font-arabic text-xs text-muted-foreground" dir="rtl">{item.arabicName}</p>}
                      </div>
                    </div>
                    <div className={cn("flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs font-medium mb-2.5", colors.emojiBg, colors.text)}>
                      <CalendarIcon className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                      <span className="truncate">{item.schedule}</span>
                    </div>
                    <p className="text-xs text-foreground/85 leading-relaxed mb-2.5">{item.description}</p>
                    <div className={cn("rounded-xl p-2.5 mb-2 border-l-2", colors.border, "bg-card/60")}>
                      <p className={cn("text-[9px] font-bold uppercase tracking-wider mb-0.5", colors.text)}>✨ Keutamaan</p>
                      <p className="text-xs text-foreground/85 leading-relaxed italic">{item.benefit}</p>
                    </div>
                    {item.source && (
                      <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-medium">
                        <BookOpen className="w-3 h-3" aria-hidden="true" /><span>{item.source}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </li>
            );
          })}
        </ul>
      </main>
      <AudioPlayer />
    </div>
  );
}