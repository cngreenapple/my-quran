import { Link } from "react-router-dom";
import { ArrowLeft, Video, Sparkles, Info } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { AudioPlayer } from "@/components/AudioPlayer";
import { LiveStreamEmbed } from "@/components/MakkahLiveStream";
import { useDocumentTitle } from "@/hooks/use-document-title";

export default function LiveMakkahPage() {
  useDocumentTitle("Live Makkah");

  return (
    <div className="min-h-dvh bg-background">
      <Header />
      <main className="container mx-auto px-3 py-3 pb-32 md:pb-12 max-w-4xl" aria-labelledby="live-title">
        <Button variant="ghost" asChild className="mb-3 -ml-2 rounded-full h-8" size="sm">
          <Link to="/"><ArrowLeft className="w-3.5 h-3.5 mr-1" aria-hidden="true" /><span className="text-xs">Kembali</span></Link>
        </Button>
        <section className="mb-4">
          <h1 id="live-title" className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
            <Video className="w-6 h-6 text-rose-500" aria-hidden="true" />Live Masjidil Haram
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">Siaran langsung 24 jam dari Ka'bah, Makkah via Saudi Quran TV</p>
        </section>

        <Card className="border-rose-500/30 bg-gradient-to-br from-rose-500/8 via-rose-500/3 to-transparent mb-4">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="shrink-0 w-9 h-9 rounded-xl bg-rose-500/20 flex items-center justify-center" aria-hidden="true">
                <Sparkles className="w-4 h-4 text-rose-600 dark:text-rose-400" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-semibold text-foreground mb-0.5">Saksikan Keindahan Tanah Suci</p>
                <p className="text-[11px] text-foreground/85 leading-relaxed">
                  Streaming langsung dari Masjidil Haram dengan fokus Ka'bah. Gunakan untuk tafakkur, menyimak khutbah, atau melihat suasana thawaf dari seluruh dunia.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <LiveStreamEmbed />

        <div className="mt-4 p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 flex items-start gap-2.5">
          <Info className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" aria-hidden="true" />
          <div className="text-[11px] text-foreground/80 leading-relaxed">
            <p className="font-semibold text-foreground mb-0.5">Catatan</p>
            <p>Streaming disediakan oleh channel YouTube resmi Saudi Quran TV. Koneksi internet stabil diperlukan untuk kualitas terbaik. Jika embed tidak muncul, klik tombol "Buka YouTube" untuk menonton langsung.</p>
          </div>
        </div>
      </main>
      <AudioPlayer />
    </div>
  );
}