import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";
import { useDocumentTitle } from "@/hooks/use-document-title";

const NotFound = () => {
  useDocumentTitle("Halaman Tidak Ditemukan");

  return (
    <div className="min-h-dvh flex items-center justify-center bg-background p-4">
      <main
        className="text-center max-w-md"
        aria-labelledby="notfound-title"
        role="main"
      >
        <div
          className="text-8xl font-bold bg-gradient-to-br from-emerald-500 to-emerald-700 bg-clip-text text-transparent mb-4"
          aria-hidden="true"
        >
          404
        </div>
        <h1 id="notfound-title" className="text-2xl font-bold text-foreground mb-2">
          Halaman Tidak Ditemukan
        </h1>
        <p className="text-muted-foreground mb-6">
          Maaf, halaman yang Anda cari tidak ada atau telah dipindahkan.
        </p>
        <Button asChild className="rounded-full">
          <Link to="/">
            <Home className="w-4 h-4 mr-2" aria-hidden="true" />
            Kembali ke Beranda
          </Link>
        </Button>
      </main>
    </div>
  );
};

export default NotFound;