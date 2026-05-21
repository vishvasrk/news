import Calendar from "@/components/calendar/Calendar";

export default function HomePage() {
  return (
    <main className="min-h-screen" style={{ background: "#0a0f0f" }}>
      {/* Grid background */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(0,255,170,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,255,170,0.03) 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative max-w-5xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-10">
        {/* Header */}
        <div className="mb-6 sm:mb-10 flex items-start justify-between flex-wrap gap-3">
          <div>
            <div
              className="inline-flex items-center gap-2 mb-3 px-3 py-1 rounded-full border text-[10px] sm:text-xs font-bold tracking-widest uppercase"
              style={{
                borderColor: "#00ffaa33",
                color: "#00ffaa",
                background: "#00ffaa0d",
              }}
            >
              🎙 Saturday Night
            </div>
            <h1
              className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight mb-1"
              style={{ color: "#e8fff8", fontFamily: "Georgia, serif" }}
            >
              Content Calendar
            </h1>
            <p
              className="text-xs sm:text-sm lg:text-base"
              style={{ color: "#4d7a6a" }}
            >
              Click any date to research the week&apos;s biggest events.
            </p>
          </div>

          {/* Live indicator */}
          <div
            className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg"
            style={{ background: "#0d1f1a", border: "1px solid #1a3d2e" }}
          >
            <span
              className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full animate-pulse"
              style={{ background: "#00ffaa" }}
            />
            <span
              className="text-[10px] sm:text-xs font-medium"
              style={{ color: "#00ffaa" }}
            >
              Live
            </span>
          </div>
        </div>

        {/* Calendar card */}
        <div
          className="rounded-xl sm:rounded-2xl p-3 sm:p-5 lg:p-6"
          style={{ background: "#0d1a16", border: "1px solid #1a3d2e" }}
        >
          <Calendar />
        </div>

        {/* Footer */}
        <p
          className="mt-4 sm:mt-6 text-center text-[10px] sm:text-xs"
          style={{ color: "#2a4a3a" }}
        >
          Saturday Night · Weekly News Show · Bengaluru
        </p>
      </div>
    </main>
  );
}
