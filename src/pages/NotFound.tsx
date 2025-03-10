
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-celestial-purple to-celestial-darkPurple p-4">
      <div className="max-w-md w-full text-center space-y-6 bg-gray-900/30 backdrop-blur-sm p-8 rounded-xl border border-gray-800/50 shadow-xl">
        <h1 className="text-6xl font-bold text-white mb-2">404</h1>
        <div className="w-16 h-1 bg-gradient-to-r from-celestial-blue to-celestial-pink mx-auto rounded-full"></div>
        <p className="text-xl text-gray-200 mb-8">Cette page n'existe pas</p>
        <Button asChild variant="secondary" className="gap-2 px-5">
          <a href="/">
            <ArrowLeft className="h-5 w-5" />
            <span>Retour à l'accueil</span>
          </a>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
