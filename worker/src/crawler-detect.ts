// Known AI crawler User-Agent patterns
// Sourced from: https://github.com/nicholasgasior/nextai-robots
const AI_CRAWLER_PATTERNS: RegExp[] = [
  /GPTBot/i,
  /ChatGPT-User/i,
  /OAI-SearchBot/i,
  /ClaudeBot/i,
  /Claude-Web/i,
  /anthropic-ai/i,
  /PerplexityBot/i,
  /GoogleExtendedBot/i,
  /Gemini/i,
  /CCBot/i,            // Common Crawl (used by many AI training sets)
  /YouBot/i,
  /meta-externalagent/i,
  /Applebot-Extended/i,
  /cohere-ai/i,
  /AI2Bot/i,
  /Diffbot/i,
  /Timpibot/i,
  /peer39_crawler/i,
];

// Patterns that should NEVER be charged (legit infrastructure)
const WHITELIST_PATTERNS: RegExp[] = [
  /Googlebot(?!.*Extended)/i,  // Regular Googlebot (not Extended)
  /Bingbot/i,
  /Slurp/i,               // Yahoo
  /DuckDuckBot/i,
  /Baiduspider/i,
  /facebookexternalhit/i,
  /Twitterbot/i,
  /LinkedInBot/i,
];

export interface CrawlerDetection {
  isAiCrawler: boolean;
  crawlerName: string | null;
  isWhitelisted: boolean;
}

export function detectCrawler(userAgent: string): CrawlerDetection {
  // Check whitelist first
  for (const pattern of WHITELIST_PATTERNS) {
    if (pattern.test(userAgent)) {
      return { isAiCrawler: false, crawlerName: null, isWhitelisted: true };
    }
  }

  // Check AI crawlers
  for (const pattern of AI_CRAWLER_PATTERNS) {
    const match = userAgent.match(pattern);
    if (match) {
      return {
        isAiCrawler: true,
        crawlerName: match[0],
        isWhitelisted: false,
      };
    }
  }

  return { isAiCrawler: false, crawlerName: null, isWhitelisted: false };
}
