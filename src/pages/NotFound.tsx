import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";
import { Header } from "@/components/Header";
import { useDocumentTitle } from "@/hooks/use-document-title";

interface NotFoundProps {
  onMenuClick: () => void;
}

const NotFound = ({ onMenuClick }: NotFoundProps) => {
  useDocumentTitle("Halaman Tidak Ditemukan");
  return (
    <div className="min-h-dvh flex flex-col bg-background">
      <Header onMenuClick={onMenuClick} />
      <main className="flex-1 flex items-center justify-center p-4" aria-labelledby="notfound-title" role="main">
        <div className="text-center max-w-sm">
          <div className="text-7xl font-bold bg-gradient-to-br from-emerald-500 to-emerald-700 bg-clip-text text-transparent mb-3" aria-hidden="true">404</div>
          <h1 id="notfound-title" className="text-xl font-bold text-foreground mb-1">Halaman Tidak Ditemukan</h1>
          <p className="text-xs text-muted-foreground mb-5">Maaf, halaman yang Anda cari tidak ada atau telah dipindahkan.</p>
          <Button asChild className="rounded-full h-9"><Link to="/"><Home className="w-3.5 h-3.5 mr-1.5" aria-hidden="true" />Kembali ke Beranda</Link></Button>
        </div>
      </main>
    </div>
  );
};

export default NotFound;