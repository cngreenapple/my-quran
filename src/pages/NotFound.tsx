import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background bg-mesh dark:bg-mesh-dark p-4">
      <div className="text-center max-w-md">
        <div className="text-8xl font-bold bg-gradient-to-br from-emerald-500 to-emerald-700 bg-clip-text text-transparent mb-4">
          404
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">
          Halaman Tidak Ditemukan
        </h1>
        <p className="text-muted-foreground mb-6">
          Maaf, halaman yang Anda cari tidak ada atau telah dipindahkan.
        </p>
        <Button asChild className="rounded-full">
          <Link to="/">
            <Home className="w-4 h-4 mr-2" />
            Kembali ke Beranda
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;