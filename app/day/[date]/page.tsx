import { createClient } from "@supabase/supabase-js";
import { format, parseISO } from "date-fns";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import DayNav from "../../Components/DayNav";
import DayKeyNav from "../../Components/DayKeyNav";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

const CATEGORIES: Record<
  string,
  { label: string; color: string; bg: string; border: string; emoji: string }
> = {
  politics: {
    label: "Politics",
    color: "#60a5fa",
    bg: "#1e3a5f20",
    border: "#3b82f630",
    emoji: "🏛️",
  },
  sports: {
    label: "Sports",
    color: "#4ade80",
    bg: "#14532d20",
    border: "#22c55e30",
    emoji: "⚽",
  },
  economy: {
    label: "Economy",
    color: "#fde047",
    bg: "#3f300020",
    border: "#eab30830",
    emoji: "📈",
  },
  ai: {
    label: "AI & Tech",
    color: "#d8b4fe",
    bg: "#3b076420",
    border: "#a855f730",
    emoji: "🤖",
  },
  space: {
    label: "Space",
    color: "#a5b4fc",
    bg: "#1e1b4b20",
    border: "#6366f130",
    emoji: "🚀",
  },
  entertainment: {
    label: "Entertainment",
    color: "#f0abfc",
    bg: "#4a044e20",
    border: "#ec489930",
    emoji: "🎬",
  },
  environment: {
    label: "Environment",
    color: "#5eead4",
    bg: "#042f2e20",
    border: "#14b8a630",
    emoji: "🌿",
  },
  health: {
    label: "Health",
    color: "#fca5a5",
    bg: "#450a0a20",
    border: "#ef444430",
    emoji: "🏥",
  },
  history: {
    label: "History",
    color: "#fdba74",
    bg: "#43140220",
    border: "#f9731630",
    emoji: "📜",
  },
  culture: {
    label: "Culture",
    color: "#fb7185",
    bg: "#4c051920",
    border: "#f43f5e30",
    emoji: "🎭",
  },
  general: {
    label: "General",
    color: "#00ffaa",
    bg: "#1a3d2e20",
    border: "#00ffaa30",
    emoji: "📰",
  },
  karnataka: {
    label: "Karnataka",
    color: "#fb923c",
    bg: "#43140220",
    border: "#f9731630",
    emoji: "🏔️",
  },
  south: {
    label: "South India",
    color: "#34d399",
    bg: "#06433020",
    border: "#10b98130",
    emoji: "🌴",
  },
};

type EventItem = {
  id: string;
  date: string;
  title: string;
  description: string | null;
  category: string;
  source: string;
  source_url: string | null;
  significance: number;
  created_at: string;
};

export default async function DayPage({
  params,
}: {
  params: Promise<{ date: string }>;
}) {
  const { date } = await params;

  const [{ data: staticEvents }, { data: digestEvents }] = await Promise.all([
    supabase
      .from("events")
      .select("*")
      .eq("date", date)
      .order("significance", { ascending: false }),
    supabase
      .from("news_digest")
      .select("*")
      .eq("pull_date", date)
      .order("created_at", { ascending: false }),
  ]);

  const normalizedDigest: EventItem[] = (digestEvents ?? []).map((d) => ({
    id: d.id,
    date: d.pull_date,
    title: d.headline,
    description: d.summary ?? null,
    category: d.segment_type,
    source: d.source,
    source_url: d.source_url ?? null,
    significance: 5,
    created_at: d.created_at,
  }));

  const allEvents: EventItem[] = [...(staticEvents ?? []), ...normalizedDigest];

  // Group by category
  const grouped: Record<string, EventItem[]> = {};
  for (const event of allEvents) {
    const cat = event.category in CATEGORIES ? event.category : "general";
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(event);
  }

  const sortedCategories = Object.keys(grouped).sort(
    (a, b) => grouped[b].length - grouped[a].length,
  );

  const parsedDate = parseISO(date);
  const formattedDate = format(parsedDate, "EEEE, MMMM d yyyy");

  return (
    <main className="min-h-screen" style={{ background: "#0a0f0f" }}>
      {/* Grid background */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(0,255,170,0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,255,170,0.025) 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative max-w-6xl mx-auto px-4 py-10">
        {/* Back */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm mb-8 transition-colors hover:opacity-80"
          style={{ color: "#4d7a6a" }}
        >
          <ChevronLeft className="w-4 h-4" />
          Back to calendar
        </Link>

        {/* Header */}
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
          <div>
            <div
              className="inline-flex items-center gap-2 mb-3 px-3 py-1 rounded-full border text-xs font-bold tracking-widest uppercase"
              style={{
                borderColor: "#00ffaa33",
                color: "#00ffaa",
                background: "#00ffaa0d",
              }}
            >
              🎙 Saturday Night
            </div>
            <h1
              className="text-3xl font-black mb-1"
              style={{ color: "#e8fff8", fontFamily: "Georgia, serif" }}
            >
              {formattedDate}
            </h1>
            <p style={{ color: "#4d7a6a", fontSize: "14px" }}>
              {allEvents.length} stories across {sortedCategories.length}{" "}
              categories
            </p>
          </div>

          {/* Prev / Today / Next navigation */}
          <DayNav date={date} />
        </div>

        {/* Category pill nav — clicking scrolls to section */}
        {sortedCategories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {sortedCategories.map((cat) => {
              const c = CATEGORIES[cat] ?? CATEGORIES.general;
              return (
                <a
                  key={cat}
                  href={`#cat-${cat}`}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-opacity hover:opacity-80"
                  style={{
                    background: c.bg,
                    color: c.color,
                    border: `1px solid ${c.border}`,
                    textDecoration: "none",
                  }}
                >
                  <span>{c.emoji}</span>
                  <span>{c.label}</span>
                  <span
                    className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold"
                    style={{ background: c.color + "25", color: c.color }}
                  >
                    {grouped[cat].length}
                  </span>
                </a>
              );
            })}
          </div>
        )}

        {/* Color distribution bar — each segment is a link to category */}
        {sortedCategories.length > 0 && (
          <div
            className="flex gap-0.5 mb-10 rounded-xl overflow-hidden h-3"
            style={{ background: "#0d1a16" }}
          >
            {sortedCategories.map((cat) => {
              const c = CATEGORIES[cat] ?? CATEGORIES.general;
              const pct = (grouped[cat].length / allEvents.length) * 100;
              return (
                <a
                  key={cat}
                  href={`#cat-${cat}`}
                  title={`${c.label}: ${grouped[cat].length} stories`}
                  style={{
                    width: `${pct}%`,
                    background: c.color,
                    opacity: 0.75,
                    display: "block",
                    transition: "opacity 0.15s",
                  }}
                />
              );
            })}
          </div>
        )}

        {/* No events */}
        {allEvents.length === 0 ? (
          <div
            className="text-center py-20 rounded-2xl"
            style={{ background: "#0d1a16", border: "1px solid #1a3d2e" }}
          >
            <p className="text-4xl mb-4">📭</p>
            <p
              className="text-lg mb-2 font-semibold"
              style={{ color: "#2a5a45" }}
            >
              No stories yet for this date.
            </p>
            <p className="text-sm" style={{ color: "#1a3d2e" }}>
              News pulls happen at 06:00, 13:00 and 22:00 IST.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-12">
            {sortedCategories.map((cat) => {
              const c = CATEGORIES[cat] ?? CATEGORIES.general;
              const items = grouped[cat];
              return (
                <section
                  key={cat}
                  id={`cat-${cat}`}
                  style={{ scrollMarginTop: "24px" }}
                >
                  {/* Category section header */}
                  <div className="flex items-center gap-3 mb-5">
                    <div
                      className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold"
                      style={{
                        background: c.bg,
                        color: c.color,
                        border: `1px solid ${c.border}`,
                      }}
                    >
                      <span className="text-base">{c.emoji}</span>
                      <span>{c.label}</span>
                    </div>
                    <div
                      className="flex-1 h-px"
                      style={{ background: c.color + "20" }}
                    />
                    <span
                      className="text-xs font-semibold px-2 py-1 rounded-lg"
                      style={{ background: c.bg, color: c.color }}
                    >
                      {items.length} {items.length === 1 ? "story" : "stories"}
                    </span>
                  </div>

                  {/* 4-column card grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {items.map((event, idx) => (
                      <div
                        key={event.id}
                        className="rounded-xl p-4 flex flex-col"
                        style={{
                          background: "#0d1a16",
                          border: "1px solid #1a3d2e",
                          borderTop: `3px solid ${c.color}60`,
                          minHeight: "220px",
                        }}
                      >
                        {/* Source + top badge */}
                        <div className="flex items-center justify-between mb-3">
                          <span
                            className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded"
                            style={{ background: c.bg, color: c.color }}
                          >
                            {event.source}
                          </span>
                          {idx === 0 && (
                            <span
                              className="text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded"
                              style={{
                                background: c.color + "25",
                                color: c.color,
                              }}
                            >
                              Top
                            </span>
                          )}
                        </div>

                        {/* Headline — fills available space */}
                        <h3
                          className="text-sm font-semibold leading-snug flex-1"
                          style={{ color: "#d4f0e4" }}
                        >
                          {event.title}
                        </h3>

                        {/* Summary */}
                        {event.description && (
                          <p
                            className="text-xs leading-relaxed mt-2 line-clamp-3"
                            style={{ color: "#4d7a6a" }}
                          >
                            {event.description}
                          </p>
                        )}

                        {/* Footer */}
                        <div
                          className="flex items-center justify-between mt-3 pt-3"
                          style={{ borderTop: "1px solid #1a3d2e" }}
                        >
                          {/* Significance dots */}
                          <div className="flex items-center gap-0.5">
                            {Array.from({ length: 5 }).map((_, j) => (
                              <span
                                key={j}
                                className="w-1.5 h-1.5 rounded-full"
                                style={{
                                  background:
                                    j < Math.round(event.significance / 2)
                                      ? c.color
                                      : "#1a3d2e",
                                }}
                              />
                            ))}
                          </div>
                          {event.source_url ? (
                            <a
                              href={event.source_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[11px] hover:opacity-80"
                              style={{ color: c.color }}
                            >
                              Read →
                            </a>
                          ) : (
                            <span
                              className="text-[11px]"
                              style={{ color: "#1a3d2e" }}
                            >
                              No link
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        )}

        {/* Back to top */}
        <div className="mt-16 text-center">
          <a
            href="#"
            className="text-xs hover:opacity-80"
            style={{ color: "#2a5a45" }}
          >
            ↑ Back to top
          </a>
        </div>
        <DayKeyNav date={date} />
      </div>
    </main>
  );
}
