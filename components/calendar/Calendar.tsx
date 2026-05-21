"use client";

import { useState, useEffect } from "react";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isToday,
  format,
  addMonths,
  subMonths,
} from "date-fns";
import { supabase, Event } from "@/lib/supabase";
import CalendarDay from "./CalendarDay";
import { ChevronLeft, ChevronRight } from "lucide-react";

const DAYS_FULL = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DAYS_SHORT = ["S", "M", "T", "W", "T", "F", "S"];

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calStart = startOfWeek(monthStart);
  const calEnd = endOfWeek(monthEnd);
  const days = eachDayOfInterval({ start: calStart, end: calEnd });

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      const from = format(calStart, "yyyy-MM-dd");
      const to = format(calEnd, "yyyy-MM-dd");

      const [{ data: staticEvents }, { data: digestEvents }] =
        await Promise.all([
          supabase.from("events").select("*").gte("date", from).lte("date", to),
          supabase
            .from("news_digest")
            .select("id, pull_date, segment_type, headline, source, source_url")
            .gte("pull_date", from)
            .lte("pull_date", to),
        ]);

      const normalized = (digestEvents ?? []).map((d) => ({
        id: d.id,
        date: d.pull_date,
        title: d.headline,
        description: null,
        category: d.segment_type,
        source: d.source,
        source_url: d.source_url,
        significance: 5,
        created_at: "",
      }));

      setEvents([...(staticEvents ?? []), ...normalized]);
      setLoading(false);
    };
    fetchEvents();
  }, [currentDate]);

  const getEventsForDay = (day: Date) => {
    const dateStr = format(day, "yyyy-MM-dd");
    return events.filter((e) => e.date === dateStr);
  };

  return (
    <div className="w-full">
      {/* Month nav */}
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h2
          className="text-base sm:text-xl font-bold"
          style={{ color: "#e8fff8", letterSpacing: "-0.5px" }}
        >
          {format(currentDate, "MMMM")}
          <span
            className="ml-2 font-normal text-sm sm:text-base"
            style={{ color: "#4d7a6a" }}
          >
            {format(currentDate, "yyyy")}
          </span>
        </h2>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={() => setCurrentDate(subMonths(currentDate, 1))}
            className="p-1.5 sm:p-2 rounded-lg transition-colors"
            style={{
              background: "#0a1510",
              border: "1px solid #1a3d2e",
              color: "#4d9e7a",
            }}
          >
            <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[10px] sm:text-xs font-semibold"
            style={{
              background: "#00ffaa15",
              border: "1px solid #00ffaa30",
              color: "#00ffaa",
            }}
          >
            Today
          </button>
          <button
            onClick={() => setCurrentDate(addMonths(currentDate, 1))}
            className="p-1.5 sm:p-2 rounded-lg transition-colors"
            style={{
              background: "#0a1510",
              border: "1px solid #1a3d2e",
              color: "#4d9e7a",
            }}
          >
            <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 mb-1 sm:mb-2">
        {DAYS_FULL.map((day, i) => (
          <div
            key={day}
            className="text-center py-1.5 sm:py-2"
            style={{ color: "#2a5a45" }}
          >
            {/* Short on mobile, full on sm+ */}
            <span className="text-[10px] font-semibold uppercase tracking-wider sm:hidden">
              {DAYS_SHORT[i]}
            </span>
            <span className="hidden sm:block text-xs font-semibold uppercase tracking-widest">
              {day}
            </span>
          </div>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {Array.from({ length: 35 }).map((_, i) => (
            <div
              key={i}
              className="rounded-lg sm:rounded-xl animate-pulse"
              style={{ background: "#0a1510", minHeight: "52px" }}
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {days.map((day) => {
            const dayEvents = getEventsForDay(day);
            return (
              <CalendarDay
                key={day.toISOString()}
                day={day}
                isCurrentMonth={isSameMonth(day, currentDate)}
                isToday={isToday(day)}
                eventCount={dayEvents.length}
                topCategory={dayEvents[0]?.category ?? null}
              />
            );
          })}
        </div>
      )}

      {/* Legend */}
      <div
        className="mt-4 sm:mt-6 pt-3 sm:pt-4 flex flex-wrap gap-2 sm:gap-4"
        style={{ borderTop: "1px solid #1a3d2e" }}
      >
        {[
          { label: "Politics", color: "#3b82f6" },
          { label: "Sports", color: "#22c55e" },
          { label: "Economy", color: "#eab308" },
          { label: "AI", color: "#a855f7" },
          { label: "KA", color: "#fb923c" },
          { label: "WTF", color: "#ef4444" },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-1 sm:gap-1.5">
            <span
              className="w-2 h-2 rounded-full"
              style={{ background: item.color }}
            />
            <span
              className="text-[10px] sm:text-xs"
              style={{ color: "#4d7a6a" }}
            >
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
