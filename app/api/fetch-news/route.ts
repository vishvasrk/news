import { createClient } from "@supabase/supabase-js";
import Parser from "rss-parser";
import stringSimilarity from "string-similarity";
import { NextResponse } from "next/server";

type Feed = {
  url: string;
  source: string;
  defaultCategory: string;
  region: string;
};

// type FeedResult = Feed & {
//   items: { title?: string; contentSnippet?: string; link?: string }[];
//   error: string | null;
// };

type NewsItem = {
  pull_time: string;
  pull_date: string;
  headline: string;
  summary: string;
  source: string;
  source_url: string | null;
  segment_type: string;
  region: string;
  importance_score: number;
  est_seconds: number;
  saved_to_episode: boolean;
  snark_line: null;
  created_at: string;
};

type FeedSummary = {
  source: string;
  fetched: number;
  error: string | null;
};

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

/* -------------------------------------------------------------------------- */
/*                                   FEEDS                                    */
/* -------------------------------------------------------------------------- */

const FEEDS = {
  national: [
    {
      url: "https://www.thehindu.com/feeder/default.rss",
      source: "The Hindu",
      defaultCategory: "politics",
      region: "india",
    },
    {
      url: "https://feeds.feedburner.com/ndtvnews-top-stories",
      source: "NDTV",
      defaultCategory: "politics",
      region: "india",
    },
    {
      url: "https://economictimes.indiatimes.com/rssfeedsdefault.cms",
      source: "Economic Times",
      defaultCategory: "economy",
      region: "india",
    },
    {
      url: "https://www.livemint.com/rss/news",
      source: "Mint",
      defaultCategory: "economy",
      region: "india",
    },
    // ── Official Government Sources ──────────────────────────────
    {
      url: "https://pib.gov.in/RssMain.aspx?ModId=6&Lang=1&Regid=3",
      source: "PIB India",
      defaultCategory: "politics",
      region: "india",
    },
    {
      url: "https://ddnews.gov.in/en/feed/",
      source: "DD News",
      defaultCategory: "politics",
      region: "india",
    },
    {
      url: "https://www.mea.gov.in/rss/pressrelease.xml",
      source: "MEA India",
      defaultCategory: "politics",
      region: "india",
    },
    {
      url: "https://www.isro.gov.in/rss.xml",
      source: "ISRO",
      defaultCategory: "space",
      region: "india",
    },
  ],

  karnataka: [
    {
      url: "https://pib.gov.in/RssMain.aspx?ModId=6&Lang=1&Regid=16",
      source: "PIB Karnataka",
      defaultCategory: "karnataka",
      region: "karnataka",
    },

    {
      url: "https://www.thehindu.com/news/national/karnataka/feeder/default.rss",
      source: "The Hindu Karnataka",
      defaultCategory: "karnataka",
      region: "karnataka",
    },
    {
      url: "https://timesofindia.indiatimes.com/rssfeeds/-2128833038.cms",
      source: "TOI Bengaluru",
      defaultCategory: "bengaluru",
      region: "bengaluru",
    },
    {
      url: "https://www.deccanherald.com/rss/state",
      source: "Deccan Herald Karnataka",
      defaultCategory: "karnataka",
      region: "karnataka",
    },
  ],

  bengaluru: [
    {
      url: "https://www.deccanherald.com/rss/bengaluru",
      source: "Deccan Herald Bengaluru",
      defaultCategory: "bengaluru",
      region: "bengaluru",
    },
  ],

  southindia: [
    {
      url: "https://www.thenewsminute.com/feeds/all.xml",
      source: "The News Minute",
      defaultCategory: "southindia",
      region: "southindia",
    },
    {
      url: "https://www.onmanorama.com/content/mm/en/rss/news.html",
      source: "Onmanorama",
      defaultCategory: "southindia",
      region: "southindia",
    },
  ],

  ai: [
    {
      url: "https://inc42.com/feed/",
      source: "Inc42",
      defaultCategory: "ai",
      region: "india",
    },
  ],

  sports: [
    {
      url: "https://www.thehindu.com/sport/feeder/default.rss",
      source: "The Hindu Sports",
      defaultCategory: "sports",
      region: "india",
    },
    {
      url: "https://www.ndtv.com/rss/sports",
      source: "NDTV Sports",
      defaultCategory: "sports",
      region: "india",
    },
  ],
};

/* -------------------------------------------------------------------------- */
/*                               CATEGORY MAPS                                */
/* -------------------------------------------------------------------------- */

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  sports: [
    "cricket",
    "ipl",
    "football",
    "match",
    "wicket",
    "goal",
    "tournament",
    "virat",
    "dhoni",
    "rcb",
    "f1",
    "motogp",
    "tennis",
    "wimbledon",
    "wrestling",
    "boxing",
    "swimming",
    "hockey",
    "soccer",
    "isl",
  ],

  economy: [
    "sensex",
    "nifty",
    "gdp",
    "rbi",
    "inflation",
    "startup",
    "market",
    "stock",
    "tax",
    "gst",
    "funding",
  ],

  ai: [
    "ai",
    "artificial intelligence",
    "chatgpt",
    "openai",
    "gemini",
    "llm",
    "machine learning",
    "deep learning",
  ],

  politics: [
    "modi",
    "putin",
    "donald trump",
    "russia",
    "USA",
    "china",
    "xi jin ping",
    "parliament",
    "election",
    "minister",
    "government",
    "supreme court",
    "policy",
    "congress",
    "bjp",
    "rahulghandi",
    "pib",
    "press information bureau",
    "ministry",
    "cabinet",
    "prime minister",
    "president of india",
  ],

  bengaluru: [
    "bengaluru",
    "bangalore",
    "whitefield",
    "hebbal",
    "electronic city",
    "marathahalli",
    "koramangala",
    "bellandur",
    "silk board",
    "metro",
    "bbmp",
    "kride",
  ],

  karnataka: [
    "karnataka",
    "mysuru",
    "hubballi",
    "belagavi",
    "shivamogga",
    "mangaluru",
    "udupi",
    "dk shivakumar",
    "siddaramaiah",
  ],

  southindia: [
    "kerala",
    "tamil nadu",
    "andhra",
    "telangana",
    "hyderabad",
    "chennai",
    "kochi",
    "bengaluru",
    "south india",
  ],

  entertainment: [
    "film",
    "movie",
    "ott",
    "netflix",
    "actor",
    "actress",
    "celebrity",
    "sandalwood",
    "bollywood",
    "tollywood",
    "kollywood",
  ],

  health: [
    "covid",
    "vaccine",
    "hospital",
    "health",
    "disease",
    "virus",
    "fitness",
    "yoga",
    "workout",
    "mentalhealth",
  ],

  environment: [
    "flood",
    "cyclone",
    "rain",
    "earthquake",
    "weather",
    "climate",
    "heatwave",
    "temperature",
  ],
};

/* -------------------------------------------------------------------------- */
/*                              CATEGORY DETECTOR                             */
/* -------------------------------------------------------------------------- */

function categorize(text: string, fallback: string): string {
  const t = text.toLowerCase();

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some((k) => t.includes(k))) {
      return category;
    }
  }

  return fallback;
}

/* -------------------------------------------------------------------------- */
/*                               REGION DETECTOR                              */
/* -------------------------------------------------------------------------- */

function detectRegion(text: string): string {
  const t = text.toLowerCase();

  if (/bengaluru|bangalore|whitefield|hebbal|bbmp|electronic city/.test(t)) {
    return "bengaluru";
  }

  if (/karnataka|mysuru|hubballi|belagavi|mangaluru|udupi/.test(t)) {
    return "karnataka";
  }

  if (/kerala|tamil nadu|andhra|telangana|hyderabad|chennai/.test(t)) {
    return "southindia";
  }

  return "india";
}

/* -------------------------------------------------------------------------- */
/*                              IMPORTANCE SCORE                              */
/* -------------------------------------------------------------------------- */

function scoreNews(text: string): number {
  const t = text.toLowerCase();

  let score = 0;

  if (/breaking|exclusive|alert|live/.test(t)) score += 10;

  if (/bengaluru|karnataka/.test(t)) score += 8;

  if (/modi|election|war|supreme court/.test(t)) score += 7;

  if (/startup|ai|openai|chatgpt|funding/.test(t)) score += 6;

  if (/flood|cyclone|earthquake|crash|death/.test(t)) score += 9;

  return score;
}

/* -------------------------------------------------------------------------- */
/*                            FUZZY DUPLICATE CHECK                           */
/* -------------------------------------------------------------------------- */

function isDuplicate(headline: string, existing: string[]): boolean {
  return existing.some((h) => {
    const similarity = stringSimilarity.compareTwoStrings(
      headline.toLowerCase(),
      h.toLowerCase(),
    );

    return similarity > 0.72;
  });
}

/* -------------------------------------------------------------------------- */
/*                               PULL TIME SLOT                               */
/* -------------------------------------------------------------------------- */

function getPullTime(): string {
  const now = new Date(
    new Date().toLocaleString("en-US", {
      timeZone: "Asia/Kolkata",
    }),
  );

  const h = now.getHours();

  if (h >= 4 && h < 10) return "06:00";
  if (h >= 10 && h < 18) return "13:00";

  return "22:00";
}

/* -------------------------------------------------------------------------- */
/*                               RSS FETCHER                                  */
/* -------------------------------------------------------------------------- */

const parser = new Parser({
  timeout: 10000,
  headers: {
    "User-Agent": "Mozilla/5.0 (compatible; SouthPulseNewsBot/2.0)",
  },
});

async function fetchFeedSafely(feed: Feed) {
  try {
    console.log(`Fetching: ${feed.source}`);
    const parsedFeed = await parser.parseURL(feed.url);
    console.log(`✓ ${feed.source}: ${parsedFeed.items.length} items`);
    return {
      ...feed,
      items: parsedFeed.items.slice(0, 10),
      error: null,
    };
  } catch (err: unknown) {
    console.error(
      `✗ ${feed.source}: ${err instanceof Error ? err.message : String(err)}`,
    );
    return {
      ...feed,
      items: [],
      error: err instanceof Error ? err.message : String(err),
    };
  }
}
/* -------------------------------------------------------------------------- */
/*                                MAIN API                                    */
/* -------------------------------------------------------------------------- */

export async function GET() {
  try {
    const today = new Date().toISOString().split("T")[0];

    const pullTime = getPullTime();

    console.log(`\n=== NEWS PULL ${pullTime} IST | ${today} ===\n`);

    /* --------------------------- FLATTEN FEEDS --------------------------- */

    const allFeeds = Object.values(FEEDS).flat();

    /* ------------------------- EXISTING HEADLINES ------------------------ */

    const { data: existing } = await supabase
      .from("news_digest")
      .select("headline")
      .eq("pull_date", today);

    const existingHeadlines = existing?.map((e) => e.headline) ?? [];

    /* ----------------------------- FETCH ALL ----------------------------- */
    const feedResults = await Promise.all(allFeeds.map(fetchFeedSafely));
    const newItems: NewsItem[] = [];
    const results: FeedSummary[] = [];

    /* ---------------------------- PROCESSING ----------------------------- */

    for (const feed of feedResults) {
      results.push({
        source: feed.source,
        fetched: feed.items.length,
        error: feed.error,
      });

      for (const item of feed.items) {
        const headline = item.title?.trim();

        if (!headline) continue;

        /* ------------------------- FUZZY DEDUPE ------------------------- */

        if (
          isDuplicate(headline, [
            ...existingHeadlines,
            ...newItems.map((n) => n.headline),
          ])
        ) {
          continue;
        }

        const summary = item.contentSnippet?.slice(0, 400) ?? "";

        const fullText = `${headline} ${summary}`;

        const category = categorize(fullText, feed.defaultCategory);

        const region = detectRegion(fullText);

        const importanceScore = scoreNews(fullText);

        newItems.push({
          pull_time: pullTime,
          pull_date: today,

          headline,

          summary,

          source: feed.source,

          source_url: item.link ?? null,

          segment_type: category,

          region,

          importance_score: importanceScore,

          est_seconds: 60,

          saved_to_episode: false,

          snark_line: null,

          created_at: new Date().toISOString(),
        });
      }
    }

    /* ---------------------------- SORT SCORE ---------------------------- */

    newItems.sort((a, b) => b.importance_score - a.importance_score);

    console.log(`\nTotal new articles: ${newItems.length}`);

    /* ---------------------------- INSERT DB ----------------------------- */

    let inserted = 0;

    for (let i = 0; i < newItems.length; i += 20) {
      const batch = newItems.slice(i, i + 20);

      const { error } = await supabase.from("news_digest").insert(batch);

      if (error) {
        console.error("Insert Error:", error.message);
      } else {
        inserted += batch.length;

        console.log(`✓ Inserted batch: ${batch.length}`);
      }
    }

    /* ----------------------------- RESPONSE ----------------------------- */

    return NextResponse.json({
      success: true,
      inserted,
      date: today,
      pull_time: pullTime,

      feeds: results,

      top_regions: {
        bengaluru: newItems.filter((n) => n.region === "bengaluru").length,

        karnataka: newItems.filter((n) => n.region === "karnataka").length,

        southindia: newItems.filter((n) => n.region === "southindia").length,
      },
    });
  } catch (err: unknown) {
    console.error("FATAL:", err instanceof Error ? err.message : String(err));
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : String(err),
      },
      { status: 500 },
    );
  }
}
