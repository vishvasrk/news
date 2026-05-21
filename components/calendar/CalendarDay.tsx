"use client";

import { useRouter } from "next/navigation";
import { format } from "date-fns";

type Props = {
  day: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  eventCount: number;
  topCategory: string | null;
};

const categoryColors: Record<string, string> = {
  politics: "#3b82f6",
  sports: "#22c55e",
  economy: "#eab308",
  ai: "#a855f7",
  space: "#6366f1",
  entertainment: "#ec4899",
  environment: "#14b8a6",
  history: "#f97316",
  health: "#ef4444",
  culture: "#f43f5e",
  weather: "#06b6d4",
  science: "#8b5cf6",
  karnataka: "#fb923c",
  bengaluru: "#34d399",
  southindia: "#2dd4bf",
  general: "#00ffaa",
};

export default function CalendarDay({
  day,
  isCurrentMonth,
  isToday,
  eventCount,
  topCategory,
}: Props) {
  const router = useRouter();
  const dateStr = format(day, "yyyy-MM-dd");
  const dotColor = topCategory
    ? (categoryColors[topCategory] ?? "#00ffaa")
    : "#00ffaa";

  const handleClick = () => {
    if (isCurrentMonth) router.push(`/day/${dateStr}`);
  };

  return (
    <div
      onClick={handleClick}
      className="relative rounded-lg sm:rounded-xl transition-all duration-200 select-none p-1.5 sm:p-2"
      style={{
        background: isToday
          ? "#001a12"
          : isCurrentMonth
            ? "#0a1510"
            : "#070d0a",
        border: isToday ? "1px solid #00ffaa55" : "1px solid #1a3d2e33",
        boxShadow: isToday ? "0 0 12px #00ffaa15" : "none",
        opacity: isCurrentMonth ? 1 : 0.35,
        cursor: isCurrentMonth ? "pointer" : "default",
        minHeight: "52px",
        // Taller on sm+
      }}
    >
      {/* Today badge — hide on very small screens */}
      {isToday && (
        <span
          className="hidden sm:block absolute top-1 right-1 text-[8px] sm:text-[9px] font-black tracking-widest uppercase"
          style={{ color: "#00ffaa" }}
        >
          TODAY
        </span>
      )}

      {/* Today dot on mobile */}
      {isToday && (
        <span
          className="sm:hidden absolute top-1 right-1 w-1.5 h-1.5 rounded-full"
          style={{ background: "#00ffaa" }}
        />
      )}

      {/* Date number */}
      <span
        className="text-[11px] sm:text-sm font-semibold"
        style={{
          color: isToday ? "#00ffaa" : isCurrentMonth ? "#a0c8b8" : "#2a4a3a",
        }}
      >
        {format(day, "d")}
      </span>

      {/* Events dot — always show colored dot */}
      {eventCount > 0 && (
        <div className="mt-1 sm:mt-2">
          {/* Mobile: just a dot */}
          <div className="flex items-center gap-1">
            <span
              className="w-1.5 h-1.5 rounded-full flex-shrink-0"
              style={{ background: dotColor, boxShadow: `0 0 4px ${dotColor}` }}
            />
            {/* Show count only on sm+ */}
            <span
              className="hidden sm:block text-[10px] sm:text-[11px]"
              style={{ color: "#4d9e7a" }}
            >
              {eventCount}
            </span>
          </div>
        </div>
      )}

      {/* No events — only on sm+ */}
      {eventCount === 0 && isCurrentMonth && (
        <div className="hidden sm:block mt-2">
          <span className="text-[10px]" style={{ color: "#1a3d2e" }}>
            –
          </span>
        </div>
      )}
    </div>
  );
}
