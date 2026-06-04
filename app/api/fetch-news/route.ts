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
  // ── Defence ── remove MEA (not RSS format), replace with working source
  defence: [
    {
      url: "https://www.thehindu.com/news/national/feeder/default.rss",
      source: "The Hindu National",
      defaultCategory: "defence",
      region: "india",
    },
    {
      url: "https://indianexpress.com/section/india/feed/",
      source: "IE India",
      defaultCategory: "defence",
      region: "india",
    },
    {
      url: "https://ajaishukla.blogspot.com/feeds/posts/default",
      source: "Broadsword",
      defaultCategory: "defence",
      region: "india",
    },
    {
      url: "https://defence.in/forums/-/index.rss",
      source: "Defence.in Forums",
      defaultCategory: "defence",
      region: "india",
    },
    {
      url: "https://www.defenseone.com/rss/all/",
      source: "Defense One",
      defaultCategory: "defence",
      region: "global",
    },
    {
      url: "https://www.livefist.com/feeds/posts/default",
      source: "Livefist Defence",
      defaultCategory: "defence",
      region: "india",
    },
  ],

  // ── National — remove Scroll.in, The Wire, all Firstpost (broken XML), add replacements
  national: [
    {
      url: "https://www.thehindu.com/feeder/default.rss",
      source: "The Hindu",
      defaultCategory: "politics",
      region: "india",
    },
    {
      url: "https://indianexpress.com/feed/",
      source: "Indian Express",
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
      url: "https://www.deccanchronicle.com/rss_feed/",
      source: "Deccan Chronicle",
      defaultCategory: "politics",
      region: "india",
    },
    {
      url: "https://www.dnaindia.com/feeds/india.xml",
      source: "DNA India",
      defaultCategory: "politics",
      region: "india",
    },
    {
      url: "https://theprint.in/feed/",
      source: "The Print",
      defaultCategory: "politics",
      region: "india",
    },

    {
      url: "https://therealnews.com/feed?partner-feed=the-real-news-network",
      source: "The Real News",
      defaultCategory: "politics",
      region: "global",
    },
    {
      url: "https://www.rt.com/rss/news/",
      source: "RT News",
      defaultCategory: "politics",
      region: "global",
    },
    {
      url: "https://timesofindia.indiatimes.com/rssfeedstopstories.cms",
      source: "Times of India",
      defaultCategory: "politics",
      region: "india",
    },
  ],

  // ── Economy — keep as is, already working well

  // ── AI — keep as is, remove Firstpost Tech (broken)
  ai: [
    {
      url: "https://inc42.com/feed/",
      source: "Inc42",
      defaultCategory: "ai",
      region: "india",
    },
    {
      url: "https://yourstory.com/feed",
      source: "YourStory",
      defaultCategory: "ai",
      region: "india",
    },
    {
      url: "https://indianexpress.com/section/technology/feed/",
      source: "IE Technology",
      defaultCategory: "ai",
      region: "india",
    },
    {
      url: "https://economictimes.indiatimes.com/tech/rssfeeds/13357270.cms",
      source: "ET Tech",
      defaultCategory: "ai",
      region: "india",
    },
    {
      url: "https://analyticsindiamag.com/feed/",
      source: "Analytics India Mag",
      defaultCategory: "ai",
      region: "india",
    },
  ],

  // ── Health — remove Firstpost Health (broken)
  health: [
    {
      url: "https://indianexpress.com/section/lifestyle/health/feed/",
      source: "IE Health",
      defaultCategory: "health",
      region: "india",
    },
    {
      url: "https://www.thehindu.com/sci-tech/health/feeder/default.rss",
      source: "The Hindu Health",
      defaultCategory: "health",
      region: "india",
    },
    {
      url: "https://timesofindia.indiatimes.com/rssfeeds/3908999.cms",
      source: "TOI Health",
      defaultCategory: "health",
      region: "india",
    },
  ],

  // ── Sports — remove ESPN Tennis/Boxing (broken XML), keep cricket focused
  sports: [
    {
      url: "https://www.thehindu.com/sport/feeder/default.rss",
      source: "The Hindu Sport",
      defaultCategory: "sports",
      region: "india",
    },
    {
      url: "https://indianexpress.com/section/sports/feed/",
      source: "IE Sports",
      defaultCategory: "sports",
      region: "india",
    },
    {
      url: "https://economictimes.indiatimes.com/news/sports/rssfeeds/19918398.cms",
      source: "ET Sports",
      defaultCategory: "sports",
      region: "india",
    },
    {
      url: "https://www.espncricinfo.com/rss/content/story/feeds/0.xml",
      source: "ESPNcricinfo",
      defaultCategory: "sports",
      region: "india",
    },
    {
      url: "https://www.espncricinfo.com/rss/content/story/feeds/6.xml",
      source: "ESPNcricinfo IPL",
      defaultCategory: "sports",
      region: "india",
    },
    {
      url: "https://timesofindia.indiatimes.com/rssfeeds/4719161.cms",
      source: "TOI Sports",
      defaultCategory: "sports",
      region: "india",
    },
  ],

  // ── Space — replace broken ISRO feed
  space: [
    {
      url: "https://www.isro.gov.in/media_isro/rss.xml",
      source: "ISRO",
      defaultCategory: "space",
      region: "india",
    },
    {
      url: "https://indianexpress.com/section/technology/science/feed/",
      source: "IE Science",
      defaultCategory: "space",
      region: "india",
    },
    {
      url: "https://www.thehindu.com/sci-tech/science/feeder/default.rss",
      source: "The Hindu Science",
      defaultCategory: "space",
      region: "india",
    },
  ],

  // ── Government — remove DD News (ECONNRESET), keep PIB
  government: [
    {
      url: "https://pib.gov.in/RssMain.aspx?ModId=6&Lang=1&Regid=6",
      source: "PIB India",
      defaultCategory: "politics",
      region: "india",
    },
    {
      url: "https://pib.gov.in/RssMain.aspx?ModId=6&Lang=1&Regid=16",
      source: "PIB Karnataka",
      defaultCategory: "karnataka",
      region: "karnataka",
    },
    {
      url: "https://www.pib.gov.in/RssMain.aspx?ModId=6&Lang=1&Regid=3&reg=3",
      source: "PIB National",
      defaultCategory: "politics",
      region: "india",
    },
  ],

  // ── Karnataka — remove DH Karnataka/Bengaluru (404/broken), add alternatives
  karnataka: [
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
      url: "https://www.deccanherald.com/feed",
      source: "Deccan Herald",
      defaultCategory: "karnataka",
      region: "karnataka",
    },
    {
      url: "https://bangaloremirror.indiatimes.com/rssfeeds/1399267649.cms",
      source: "Bangalore Mirror",
      defaultCategory: "bengaluru",
      region: "bengaluru",
    },
  ],

  // ── South India — remove The News Minute (404), keep The Hindu state feeds
  southindia: [
    {
      url: "https://www.thehindu.com/news/national/tamil-nadu/feeder/default.rss",
      source: "The Hindu TN",
      defaultCategory: "southindia",
      region: "southindia",
    },
    {
      url: "https://www.thehindu.com/news/national/kerala/feeder/default.rss",
      source: "The Hindu Kerala",
      defaultCategory: "southindia",
      region: "southindia",
    },
    {
      url: "https://www.thehindu.com/news/national/telangana/feeder/default.rss",
      source: "The Hindu Telangana",
      defaultCategory: "southindia",
      region: "southindia",
    },
    {
      url: "https://www.thehindu.com/news/national/andhra-pradesh/feeder/default.rss",
      source: "The Hindu AP",
      defaultCategory: "southindia",
      region: "southindia",
    },
    {
      url: "https://timesofindia.indiatimes.com/city/hyderabad/rssfeeds/2795527.cms",
      source: "TOI Hyderabad",
      defaultCategory: "southindia",
      region: "southindia",
    },
    {
      url: "https://timesofindia.indiatimes.com/city/chennai/rssfeeds/2793627.cms",
      source: "TOI Chennai",
      defaultCategory: "southindia",
      region: "southindia",
    },
    {
      url: "https://timesofindia.indiatimes.com/city/kochi/rssfeeds/7791842.cms",
      source: "TOI Kochi",
      defaultCategory: "southindia",
      region: "southindia",
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
    "t20",
    "odi",
    "test match",
    "wicket",
    "batting",
    "bowling",
    "football",
    "fifa",
    "premier league",
    "isl",
    "la liga",
    "tennis",
    "wimbledon",
    "us open",
    "french open",
    "f1",
    "formula 1",
    "motogp",
    "grand prix",
    "hockey",
    "kabaddi",
    "wrestling",
    "boxing",
    "badminton",
    "athlete",
    "goalkeeper",
    "batsman",
    "bowler",
    "virat kohli",
    "rohit sharma",
    "ms dhoni",
    "sachin",
    "rcb",
    "mi ",
    "csk",
    "kkr",
    "srh",
    "dc ",
    "pbks",
    "gt ",
    "olympics",
    "cwg",
    "commonwealth games",
    "asian games",
    "score",
    "innings",
    "over ",
    "run rate",
    "century",
    "hat-trick",
  ],

  defence: [
    "indian army",
    "indian navy",
    "indian air force",
    "iaf",
    "defence ministry",
    "ministry of defence",
    "drdo",
    "hal ",
    "bel ",
    "bharat electronics",
    "agni",
    "prithvi",
    "brahmos",
    "akash missile",
    "ins ",
    "ins vikrant",
    "ins vikramaditya",
    "tejas",
    "lca tejas",
    "rafale",
    "sukhoi",
    "military exercise",
    "army exercise",
    "war games",
    "surgical strike",
    "line of control",
    "loc ",
    "siachen",
    "galwan",
    "ladakh border",
    "chief of defence",
    "cds ",
    "army chief",
    "navy chief",
    "paramilitary",
    "crpf",
    "bsf ",
    "cisf",
    "itbp",
    "pentagon",
    "us military",
    "nato alliance",
    "ukraine war",
    "russia ukraine",
    "israel hamas",
    "gaza strip",
    "iran military",
    "taiwan strait",
    "south china sea",
    "nuclear weapon",
    "missile strike",
    "airstrike",
    "air strike",
    "defence deal",
    "arms deal",
    "weapons supply",
    "warship",
    "fighter jet",
    "submarine",
    "aircraft carrier",
    "war crime",
    "conflict zone",
    "un peacekeeping",
  ],

  ai: [
    "artificial intelligence",
    "machine learning",
    "deep learning",
    "large language model",
    "llm",
    "generative ai",
    "neural network",
    "chatgpt",
    "gpt-4",
    "gpt-5",
    "openai",
    "anthropic",
    "claude ai",
    "gemini",
    "copilot",
    "midjourney",
    "stable diffusion",
    "nvidia gpu",
    "ai chip",
    "ai model",
    "ai tool",
    "ai startup",
    "tech startup",
    "saas",
    "software company",
    "app launch",
    "inc42",
    "yourstory",
    "product hunt",
    "data science",
    "automation",
    "robotics",
    "drone tech",
    "5g",
    "semiconductor",
    "cloud computing",
  ],

  space: [
    "isro",
    "nasa",
    "spacex",
    "roscosmos",
    "jaxa",
    "rocket launch",
    "satellite launch",
    "space mission",
    "gaganyaan",
    "chandrayaan",
    "mangalyaan",
    "aditya",
    "moon landing",
    "mars mission",
    "space station",
    "astronaut",
    "cosmonaut",
    "orbit",
    "spacecraft",
    "telescope",
    "james webb",
    "hubble",
    "asteroid",
    "comet",
    "galaxy",
    "black hole",
  ],

  economy: [
    "sensex",
    "nifty",
    "bse",
    "nse",
    "stock market",
    "rbi",
    "reserve bank",
    "repo rate",
    "interest rate",
    "gdp",
    "inflation",
    "cpi",
    "wpi",
    "rupee",
    "dollar",
    "forex",
    "currency",
    "budget",
    "gst",
    "income tax",
    "customs duty",
    "ipo",
    "fundraising",
    "series a",
    "series b",
    "venture capital",
    "startup funding",
    "unicorn",
    "valuation",
    "export",
    "import",
    "trade deficit",
    "current account",
    "oil price",
    "gold price",
    "crude oil",
    "sebi",
    "rbi policy",
    "monetary policy",
  ],

  health: [
    "covid",
    "coronavirus",
    "vaccine",
    "vaccination",
    "hospital",
    "doctor",
    "patient",
    "surgery",
    "disease",
    "virus",
    "bacteria",
    "infection",
    "cancer",
    "diabetes",
    "heart attack",
    "stroke",
    "mental health",
    "depression",
    "anxiety",
    "drug",
    "medicine",
    "pharma",
    "clinical trial",
    "who ",
    "icmr",
    "aiims",
    "health ministry",
    "epidemic",
    "pandemic",
    "outbreak",
  ],

  environment: [
    "flood",
    "cyclone",
    "hurricane",
    "typhoon",
    "earthquake",
    "tsunami",
    "landslide",
    "heatwave",
    "temperature record",
    "drought",
    "climate change",
    "global warming",
    "carbon emission",
    "pollution",
    "air quality",
    "aqi",
    "smog",
    "deforestation",
    "wildlife",
    "tiger reserve",
    "solar energy",
    "renewable energy",
    "ev ",
    "electric vehicle",
    "imd forecast",
    "monsoon",
    "rainfall",
  ],

  entertainment: [
    "film",
    "movie",
    "cinema",
    "box office",
    "bollywood",
    "tollywood",
    "kollywood",
    "sandalwood",
    "mollywood",
    "actor",
    "actress",
    "director",
    "producer",
    "ott",
    "netflix",
    "amazon prime",
    "disney+",
    "hotstar",
    "web series",
    "trailer",
    "release date",
    "award",
    "filmfare",
    "iifa",
    "national award",
    "music",
    "album",
    "song",
    "singer",
    "celebrity",
    "fashion",
    "red carpet",
  ],

  bengaluru: [
    "bengaluru",
    "bangalore",
    "bbmp",
    "bmtc",
    "namma metro",
    "whitefield",
    "koramangala",
    "indiranagar",
    "hebbal",
    "electronic city",
    "marathahalli",
    "silk board",
    "bellandur",
    "sarjapur",
    "jp nagar",
    "jayanagar",
    "kride",
    "bruhat bengaluru",
    "bwssb",
    "bengaluru traffic",
    "bengaluru rain",
    "bengaluru startup",
  ],

  karnataka: [
    "karnataka",
    "siddaramaiah",
    "dk shivakumar",
    "mysuru",
    "mysore",
    "hubballi",
    "dharwad",
    "belagavi",
    "belgaum",
    "mangaluru",
    "mangalore",
    "shivamogga",
    "udupi",
    "tumkur",
    "kolar",
    "vidhana soudha",
    "karnataka government",
    "karnataka cabinet",
    "karnataka budget",
    "karnataka election",
    "cauvery",
    "kaveri",
    "deccan herald",
  ],

  southindia: [
    "tamil nadu",
    "tamilnadu",
    "chennai",
    "madras",
    "kerala",
    "kochi",
    "trivandrum",
    "thiruvananthapuram",
    "kozhikode",
    "andhra pradesh",
    "telangana",
    "hyderabad",
    "vijayawada",
    "vizag",
    "pondicherry",
    "lakshadweep",
    "south india",
    "dravidian",
    "dmk",
    "aiadmk",
    "tdp",
    "ysrcp",
    "pinarayi",
    "cm stalin",
    "cm revanth",
  ],

  // Politics last — only if nothing else matches
  politics: [
    "modi",
    "rahul gandhi",
    "amit shah",
    "yogi adityanath",
    "lok sabha",
    "rajya sabha",
    "parliament session",
    "election commission",
    "general election",
    "bypolls",
    "supreme court",
    "high court",
    "cbi",
    "enforcement directorate",
    "bjp",
    "congress",
    "aap ",
    "shiv sena",
    "ncp ",
    "putin",
    "biden",
    "trump",
    "xi jinping",
    "g20",
    "g7",
    "un ",
    "united nations",
    "india pakistan",
    "india china",
    "border tension",
    "ceasefire",
    "military",
    "pib",
    "press information bureau",
    "mea india",
  ],
};

/* -------------------------------------------------------------------------- */
/*                           SCORE-BASED CATEGORIZER                          */
/* -------------------------------------------------------------------------- */

function categorize(text: string, fallback: string): string {
  const t = text.toLowerCase();
  const scores: Record<string, number> = {};

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    const matchCount = keywords.filter((k) => t.includes(k)).length;
    if (matchCount > 0) scores[category] = matchCount;
  }

  if (Object.keys(scores).length === 0) return fallback;
  return Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0];
}

/* -------------------------------------------------------------------------- */
/*                               REGION DETECTOR                              */
/* -------------------------------------------------------------------------- */

function detectRegion(text: string): string {
  const t = text.toLowerCase();
  if (/bengaluru|bangalore|whitefield|hebbal|bbmp|electronic city/.test(t))
    return "bengaluru";
  if (/karnataka|mysuru|hubballi|belagavi|mangaluru|udupi/.test(t))
    return "karnataka";
  if (/kerala|tamil nadu|andhra|telangana|hyderabad|chennai/.test(t))
    return "southindia";
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
    new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }),
  );
  const h = now.getHours();
  if (h >= 4 && h < 10) return "06:00";
  if (h >= 10 && h < 18) return "13:00";
  return "22:00";
}

/* -------------------------------------------------------------------------- */
/*                          RSS FETCHER WITH RETRY                            */
/* -------------------------------------------------------------------------- */

const USER_AGENTS = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15",
  "Mozilla/5.0 (compatible; SouthPulseNewsBot/2.0; +https://saturdaynight.in)",
];

async function fetchFeedSafely(feed: Feed) {
  for (const ua of USER_AGENTS) {
    const parser = new Parser({
      timeout: 10000,
      headers: {
        "User-Agent": ua,
        Accept: "application/rss+xml, application/xml, text/xml, */*",
        "Accept-Language": "en-US,en;q=0.9",
        "Cache-Control": "no-cache",
      },
    });

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
      const msg = err instanceof Error ? err.message : String(err);
      // If 403 or 429 — retry with next user agent
      if (msg.includes("403") || msg.includes("429")) {
        console.warn(
          `⚠ ${feed.source} blocked (${msg}) — retrying with different UA`,
        );
        continue;
      }
      // Any other error — stop retrying
      console.error(`✗ ${feed.source}: ${msg}`);
      return { ...feed, items: [], error: msg };
    }
  }

  // All user agents failed
  console.error(`✗ ${feed.source}: blocked after all retries`);
  return { ...feed, items: [], error: "Blocked after all retries" };
}

/* -------------------------------------------------------------------------- */
/*                                MAIN API                                    */
/* -------------------------------------------------------------------------- */

export async function GET() {
  try {
    const today = new Date().toISOString().split("T")[0];
    const pullTime = getPullTime();

    console.log(`\n=== NEWS PULL ${pullTime} IST | ${today} ===\n`);

    const allFeeds = Object.values(FEEDS).flat();

    const { data: existing } = await supabase
      .from("news_digest")
      .select("headline")
      .eq("pull_date", today);

    const existingHeadlines = existing?.map((e) => e.headline) ?? [];

    const feedResults = await Promise.all(allFeeds.map(fetchFeedSafely));
    const newItems: NewsItem[] = [];
    const results: FeedSummary[] = [];

    for (const feed of feedResults) {
      results.push({
        source: feed.source,
        fetched: feed.items.length,
        error: feed.error,
      });

      for (const item of feed.items) {
        const headline = item.title?.trim();
        if (!headline) continue;

        if (
          isDuplicate(headline, [
            ...existingHeadlines,
            ...newItems.map((n) => n.headline),
          ])
        )
          continue;

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

    newItems.sort((a, b) => b.importance_score - a.importance_score);

    console.log(`\nTotal new articles: ${newItems.length}`);

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

    // Summary of failed feeds
    const failed = results.filter((r) => r.error !== null);

    return NextResponse.json({
      success: true,
      inserted,
      date: today,
      pull_time: pullTime,
      total_feeds: allFeeds.length,
      successful_feeds: results.filter((r) => r.error === null).length,
      failed_feeds: failed.length,
      failed_sources: failed.map((f) => ({ source: f.source, error: f.error })),
      top_regions: {
        bengaluru: newItems.filter((n) => n.region === "bengaluru").length,
        karnataka: newItems.filter((n) => n.region === "karnataka").length,
        southindia: newItems.filter((n) => n.region === "southindia").length,
        global: newItems.filter((n) => n.region === "global").length,
      },
      by_category: newItems.reduce(
        (acc, n) => {
          acc[n.segment_type] = (acc[n.segment_type] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>,
      ),
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
