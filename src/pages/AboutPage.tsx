import { Link } from "react-router-dom";
import { ArrowLeft, BookOpen, Heart, Globe, Mail, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Header } from "@/components/Header";
import { AudioPlayer } from "@/components/AudioPlayer";
import { useDocumentTitle } from "@/hooks/use-document-title";
import { ASMAUL_HUSNA } from "@/data/asmaul-husna";
import { Button } from "@/components/ui/button";

export default function AboutPage() {
  useDocumentTitle("Tentang Aplikasi");

  return (
    <div className="min-h-dvh bg-background">
      <Header />
      <main className="container mx-auto px-3 py-3 pb-32 md:pb-12 max-w-3xl" aria-labelledby="about-title">
        <Button variant="ghost" asChild className="mb-3 -ml-2 rounded-full h-8" size="sm">
          <Link to="/"><ArrowLeft className="w-3.5 h-3.5 mr-1" aria-hidden="true" /><span className="text-xs">Kembali</span></Link>
        </Button>
        <section className="mb-4">
          <h1 id="about-title" className="text-xl sm:text-2xl font-bold text-foreground">Tentang Aplikasi</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Al-Qur'an Digital Indonesia</p>
        </section>

        <Card className="overflow-hidden border-primary/30 bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 text-white shadow-lg shadow-emerald-500/20 mb-4">
          <CardContent className="p-5 sm:p-6 relative">
            <div className="absolute inset-0 opacity-10" aria-hidden="true">
              <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="about-pattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M20 0 L40 20 L20 40 L0 20 Z" fill="none" stroke="currentColor" strokeWidth="1" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#about-pattern)" />
              </svg>
            </div>
            <div className="relative text-center">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center mb-3 shadow-2xl" aria-hidden="true">
                <BookOpen className="w-8 h-8 text-white" strokeWidth={2} />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold mb-1">Al-Qur'an Digital</h2>
              <p className="text-xs text-emerald-50/90 max-w-md mx-auto leading-relaxed">
                Aplikasi Al-Qur'an digital modern dengan terjemahan Bahasa Indonesia, audio murottal, jadwal sholat, dzikir, doa, dan kalender Hijriah.
              </p>
              <div className="flex items-center justify-center gap-2 mt-3 text-[11px] text-emerald-50/80">
                <Star className="w-3 h-3 fill-current" aria-hidden="true" /><span>Versi 1.0.0</span>
                <span className="w-1 h-1 rounded-full bg-emerald-50/50" /><span>2025</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 mb-3">
          <CardContent className="p-4">
            <h2 className="text-sm font-bold text-foreground mb-2.5 flex items-center gap-2">
              <span className="text-lg" aria-hidden="true">✨</span>Fitur Utama
            </h2>
            <ul className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 text-xs" role="list">
              {[
                { emoji: "📖", label: "114 Surat" },
                { emoji: "🌍", label: "Terjemahan ID" },
                { emoji: "🎧", label: "Audio Murottal" },
                { emoji: "⏰", label: "Jadwal Sholat" },
                { emoji: "🧭", label: "Arah Kiblat" },
                { emoji: "📿", label: "Dzikir & Doa" },
                { emoji: "🌙", label: "Kalender Hijriah" },
                { emoji: "⭐", label: "Asmaul Husna" },
                { emoji: "📍", label: "Bookmark" },
                { emoji: "📝", label: "Catatan" },
                { emoji: "🕌", label: "Puasa Sunnah" },
                { emoji: "📺", label: "Live Makkah" },
              ].map((f) => (
                <li key={f.label} className="flex items-center gap-2 p-2 rounded-lg bg-muted/40">
                  <span aria-hidden="true">{f.emoji}</span>
                  <span className="text-foreground/85">{f.label}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="border-border/60 mb-3">
          <CardContent className="p-4">
            <h2 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
              <span className="text-lg" aria-hidden="true">🔗</span>Sumber Data
            </h2>
            <div className="space-y-2.5 text-xs">
              <DataSourceItem title="Al-Qur'an & Terjemahan" source="EQuran.id" url="https://equran.id" description="API Al-Qur'an lengkap dengan terjemahan Bahasa Indonesia, tafsir Kemenag, dan audio murottal." />
              <DataSourceItem title="Jadwal Sholat" source="Aladhan.com" url="https://aladhan.com" description="API jadwal sholat global dengan metode kalkulasi berbagai negara termasuk KEMENAG Indonesia." />
              <DataSourceItem title="Audio Murottal" source="QuranicAudio.com" url="https://quranicaudio.com" description="Audio murottal Al-Afasy untuk tilawah Al-Qur'an." />
              <DataSourceItem title="Konversi Kalender Hijriah" source="Umm al-Qura Algorithm" description="Algoritma konversi kalender Hijriah-Masehi resmi Arab Saudi." />
            </div>
          </CardContent>
        </Card>

        <Card className="border-amber-500/30 bg-gradient-to-br from-amber-500/5 to-transparent mb-3">
          <CardContent className="p-4">
            <h2 className="text-sm font-bold text-foreground mb-1.5 flex items-center gap-2">
              <span className="text-lg" aria-hidden="true">✨</span>99 Asmaul Husna
            </h2>
            <p className="text-xs text-foreground/85 leading-relaxed mb-1">
              Aplikasi menyediakan 99 nama-nama Allah yang indah beserta artinya dalam Bahasa Indonesia dan Inggris.
            </p>
            <p className="text-[10px] text-muted-foreground">Total: {ASMAUL_HUSNA.length} nama</p>
          </CardContent>
        </Card>

        <Card className="border-border/60 mb-3">
          <CardContent className="p-4">
            <h2 className="text-sm font-bold text-foreground mb-2 flex items-center gap-2">
              <Heart className="w-4 h-4 text-rose-500 fill-rose-500" aria-hidden="true" />Kredit
            </h2>
            <p className="text-xs text-foreground/85 leading-relaxed">
              Aplikasi ini dibuat dengan <Heart className="inline w-3 h-3 text-rose-500 fill-rose-500" aria-hidden="true" /> untuk umat Muslim Indonesia. Semoga bermanfaat dan menjadi amal jariyah.
            </p>
            <div className="mt-2.5 pt-2.5 border-t border-border/60 text-[11px] text-muted-foreground">
              <p><strong>Doa:</strong> "Ya Allah, berkahilah umat Islam dalam urusan mereka, dan selamatkanlah negeri kami dari segala bencana."</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardContent className="p-2">
            <a href="https://equran.id" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-muted transition-colors">
              <Globe className="w-4 h-4 text-muted-foreground shrink-0" aria-hidden="true" />
              <div className="flex-1"><p className="text-xs font-medium text-foreground">equran.id</p><p className="text-[10px] text-muted-foreground">Sumber Al-Qur'an</p></div>
            </a>
            <a href="https://aladhan.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-muted transition-colors">
              <Globe className="w-4 h-4 text-muted-foreground shrink-0" aria-hidden="true" />
              <div className="flex-1"><p className="text-xs font-medium text-foreground">aladhan.com</p><p className="text-[10px] text-muted-foreground">Sumber jadwal sholat</p></div>
            </a>
            <button className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-muted transition-colors text-left">
              <Mail className="w-4 h-4 text-muted-foreground shrink-0" aria-hidden="true" />
              <div className="flex-1"><p className="text-xs font-medium text-foreground">Kontak</p><p className="text-[10px] text-muted-foreground">Untuk masukan & saran</p></div>
            </button>
          </CardContent>
        </Card>
      </main>
      <AudioPlayer />
    </div>
  );
}

interface DataSourceItemProps { title: string; source: string; url?: string; description: string; }
function DataSourceItem({ title, source, url, description }: DataSourceItemProps) {
  return (
    <div className="flex items-start gap-2.5">
      <div className="shrink-0 w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-sm" aria-hidden="true">📚</div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-foreground text-xs">{title}</p>
        <p className="text-[10px] text-muted-foreground mb-0.5">Sumber: {url ? <a href={url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{source}</a> : source}</p>
        <p className="text-[11px] text-foreground/80 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}