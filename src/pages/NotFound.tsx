import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import MacOSWindow from "@/components/MacOSWindow";
import { AlertCircle, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: Protocol mismatch at:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="w-full h-full flex items-center justify-center p-6">
      <MacOSWindow title="System Error" className="max-w-md h-auto">
        <div className="p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-8">
                <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
            <h1 className="text-3xl font-bold tracking-tighter mb-2">404</h1>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-10 opacity-60">
              Protocol mismatch at: {location.pathname}
            </p>
            <Button asChild className="h-10 px-8 rounded-lg bg-primary font-bold uppercase text-[9px] tracking-widest gap-2">
                <Link to="/">
                    <Home className="h-3.5 w-3.5" /> Return to Root
                </Link>
            </Button>
        </div>
      </MacOSWindow>
    </div>
  );
};

export default NotFound;
