import { X, Minus, Square } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { ReactNode } from "react";

interface DesktopFrameProps {
  children: ReactNode;
  title?: string;
}

export function DesktopFrame({ children, title = "LSBA Manager" }: DesktopFrameProps) {
  const handleMinimize = () => {
    console.log("Minimize window");
  };

  const handleMaximize = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      document.documentElement.requestFullscreen();
    }
  };

  const handleClose = () => {
    if (confirm("Are you sure you want to close LSBA Manager?")) {
      window.close();
    }
  };

  return (
    <div className="fixed inset-0 flex flex-col bg-background">
      <div className="flex-none bg-card border-b border-border select-none">
        <div className="flex items-center justify-between h-12 px-4">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <span className="text-primary-foreground text-xs font-bold">LS</span>
            </div>
            <span className="text-sm font-semibold text-foreground">{title}</span>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:bg-muted"
              onClick={handleMinimize}
            >
              <Minus className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:bg-muted"
              onClick={handleMaximize}
            >
              <Square className="w-3.5 h-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:bg-destructive hover:text-destructive-foreground"
              onClick={handleClose}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        {children}
      </div>
    </div>
  );
}
