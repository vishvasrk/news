"use client";
import { useRouter } from "next/navigation";
import { format, addDays, subDays, parseISO } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function DayNav({ date }: { date: string }) {
  const router = useRouter();
  const current = parseISO(date);
  const prev = format(subDays(current, 1), "yyyy-MM-dd");
  const next = format(addDays(current, 1), "yyyy-MM-dd");
  const isToday = date === format(new Date(), "yyyy-MM-dd");
  const isFuture = new Date(date) > new Date();

  return (
    <div className="flex items-center gap-1.5 sm:gap-2">
      <button
        onClick={() => router.push(`/day/${prev}`)}
        className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-[10px] sm:text-xs font-semibold hover:opacity-80 transition-opacity"
        style={{
          background: "#0d1a16",
          border: "1px solid #1a3d2e",
          color: "#4d9e7a",
        }}
      >
        <ChevronLeft className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
        <span className="hidden sm:inline">
          {format(subDays(current, 1), "MMM d")}
        </span>
        <span className="sm:hidden">Prev</span>
      </button>

      <button
        onClick={() => router.push("/day/" + format(new Date(), "yyyy-MM-dd"))}
        className="px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-[10px] sm:text-xs font-bold hover:opacity-80 transition-opacity"
        style={{
          background: isToday ? "#00ffaa15" : "#0d1a16",
          border: `1px solid ${isToday ? "#00ffaa40" : "#1a3d2e"}`,
          color: isToday ? "#00ffaa" : "#4d7a6a",
        }}
      >
        Today
      </button>

      <button
        onClick={() => {
          if (!isFuture) router.push(`/day/${next}`);
        }}
        disabled={isFuture}
        className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-[10px] sm:text-xs font-semibold hover:opacity-80 transition-opacity disabled:opacity-30 disabled:cursor-not-allowed"
        style={{
          background: "#0d1a16",
          border: "1px solid #1a3d2e",
          color: "#4d9e7a",
        }}
      >
        <span className="hidden sm:inline">
          {format(addDays(current, 1), "MMM d")}
        </span>
        <span className="sm:hidden">Next</span>
        <ChevronRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
      </button>
    </div>
  );
}
