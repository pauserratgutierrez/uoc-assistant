export const config = {
  MAIN_DIR: 'data',

  CRAWLER: {
    INITIAL_URLS: ['https://uoc.edu/ca'],
    INCLUDE_URLS: ['https://uoc.edu/ca'],
    ALLOWED_CONTENT_TYPES: ['text/html'],
    EXCLUDE_PATTERNS: [
      /\/(en(?:g)?|es(?:p)?|pe(?:r)?|m(?:e)?x|ec(?:u)?|co(?:l)?|c(?:h)?l)(\/|$)/i,
      /\/(?:opencms_portal2|opencms_alumni|opencms|documents|content|news|recerca|uocpapers|shop|experience|graduacio)(\/|$)/i,
      /\.(zip|rar|webp|png|jpg|jpeg|gif|mp3|mp4|pdf|pptx|css|js|svg|ico|eot|ttf|woff|woff2|otf|webm|ogg|wav|flac|m4a|mkv|mov|avi|wmv|flv|swf|exe|docx|xlsx|msi|dmg|iso|bin)/i,
    ],
    DOM_ELEMENTS_REMOVE: [
      'script',
      'noscript',
      'style',
      'meta',
      'link',
      'svg',
      'path',
      'img',
      'input',
      'textarea',
      'embed',
      'object',
      'iframe',
      'nav',
      'header',
      'footer',
      'aside',
      'button',
      '[aria-modal]',
      '[role="dialog"]',
      '[role="alert"]',
      '[role="banner"]',
      '[role="form"]',
      '[role="navigation"]',
      '[role="search"]',

      'div.swiper-slide-duplicate',
      'div.uoc-form',
      'div.uocfooter',
      'div#onetrust-consent-sdk',
      'span.visually-hidden',
      'span.icon-alt'
    ],
    DYNAMIC_CRAWLING: true,
    RETRY_STATUS_CODES: [408, 500, 502, 503, 504],
    REQUEST_TIMEOUT: 10000,
    MAX_REDIRECTS: 10,
    MAX_CONTENT_LENGTH: 40 * 1024 * 1024, // 20MB
    MAX_RETRIES: 1,
    CRAWL_DELAY_MS: 300,
    CRAWL_ERROR_RETRY_DELAY_MS: 0,
    CRAWL_RATE_LIMIT_FALLBACK_DELAY_MS: 0,
    EXIT_ON_RATE_LIMIT: true,
    EXIT_CODE_RATE_LIMIT: 10
  },

  DATA_FORMATTER: {
    EXCLUDED_PATTERNS: [],
    CATEGORISED_PATHS: {
      'https://uoc.edu': {
        '*': 'general.txt'
      },
    }
  }
}