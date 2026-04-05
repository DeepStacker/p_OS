import React, { Suspense, lazy } from "react";
import { useSystem } from "@/contexts/SystemContext";
import { AnimatePresence } from "framer-motion";

const ClockWidget = lazy(() => import("./widgets/ClockWidget"));
const CalendarWidget = lazy(() => import("./widgets/CalendarWidget"));
const MetricsWidget = lazy(() => import("./widgets/MetricsWidget"));
const NotesWidget = lazy(() => import("./widgets/NotesWidget"));

const DesktopLayer: React.FC = () => {
  const { activeWidgets } = useSystem();

  const renderWidget = (widget: any) => {
    switch (widget.type) {
      case "clock": return <ClockWidget key={widget.id} id={widget.id} x={widget.x} y={widget.y} />;
      case "calendar": return <CalendarWidget key={widget.id} id={widget.id} x={widget.x} y={widget.y} />;
      case "metrics": return <MetricsWidget key={widget.id} id={widget.id} x={widget.x} y={widget.y} />;
      case "notes": return <NotesWidget key={widget.id} id={widget.id} x={widget.x} y={widget.y} />;
      default: return null;
    }
  };

  return (
    <div className="absolute inset-0 z-[10] pointer-events-none overflow-hidden p-10">
      <AnimatePresence>
        {activeWidgets.map((widget) => (
          <Suspense key={widget.id} fallback={null}>
            {renderWidget(widget)}
          </Suspense>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default DesktopLayer;
