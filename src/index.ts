const YOUTUBE_URL_REGEX =
  /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;

const USER_AGENT_STRING =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.83 Safari/537.36,gzip(gfe)';

const CAPTION_XML_REGEX = /<text start="([^"]*)" dur="([^"]*)">([^<]*)<\/text>/g;

class YouTubeCaptionError extends Error {
  constructor(message: string) {
    super(`[YouTubeCaption] 🚨 ${message}`);
  }
}

const errorTypes = {
  RequestLimitExceeded: () =>
    new YouTubeCaptionError(
      'YouTube is receiving too many requests from this IP and requires captcha resolution.'
    ),
  VideoNotAvailable: (videoId: string) =>
    new YouTubeCaptionError(`The video is no longer available (${videoId}).`),
  CaptionsDisabled: (videoId: string) =>
    new YouTubeCaptionError(`Captions are disabled for this video (${videoId}).`),
  NoCaptionsAvailable: (videoId: string) =>
    new YouTubeCaptionError(`No captions are available for this video (${videoId}).`),
  LanguageUnavailable: (lang: string, availableLangs: string[], videoId: string) =>
    new YouTubeCaptionError(
      `No captions available in ${lang} for this video (${videoId}). Available languages: ${availableLangs.join(
        ', '
      )}.`
    ),
};

interface CaptionConfig {
  lang?: string;
  plainText?: true;
}

interface CaptionResponse {
  text: string;
  duration: number;
  offset: number;
  lang?: string;
}

/**
 * Retrieve captions for a specified YouTube video.
 * @param {string} videoId - The video URL or ID.
 * @param {CaptionConfig} [options] - Language configuration options.
 * @returns {Promise<CaptionResponse[]>} Promise resolving to caption data.
 */
async function getVideoCaptions(
  videoId: string,
  options?: CaptionConfig
): Promise<CaptionResponse[]> {
  const id = extractVideoIdentifier(videoId);
  const videoPageContent = await fetchVideoContent(id, options?.lang);

  const captionsData = extractCaptionsFromContent(videoPageContent);
  if (!captionsData) {
    throw errorTypes.CaptionsDisabled(videoId);
  }

  checkCaptionsValidity(captionsData, videoId, options?.lang);
  const captionsLink = getCaptionsURL(captionsData, options?.lang);

  const captionsContent = await fetchCaptionsContent(captionsLink, options?.lang);
  return parseCaptionsContent(captionsContent, captionsData, options?.lang);
}

async function fetchVideoContent(videoId: string, lang?: string): Promise<string> {
  const response = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
    headers: {
      ...(lang && { 'Accept-Language': lang }),
      'User-Agent': USER_AGENT_STRING,
    },
  });
  if (!response.ok) throw errorTypes.VideoNotAvailable(videoId);
  return response.text();
}

function extractCaptionsFromContent(content: string) {
  const splitContent = content.split('"captions":');
  if (splitContent.length <= 1) return null;

  try {
    return JSON.parse(splitContent[1].split(',"videoDetails')[0].replace('\n', ''))[
      'playerCaptionsTracklistRenderer'
    ];
  } catch {
    return null;
  }
}

function checkCaptionsValidity(captions: any, videoId: string, lang?: string) {
  if (!('captionTracks' in captions)) {
    throw errorTypes.NoCaptionsAvailable(videoId);
  }
  if (
    lang &&
    !captions.captionTracks.some((track: { languageCode: string }) => track.languageCode === lang)
  ) {
    throw errorTypes.LanguageUnavailable(
      lang,
      captions.captionTracks.map((track: { languageCode: string }) => track.languageCode),
      videoId
    );
  }
}

function getCaptionsURL(captions: any, lang?: string) {
  const track = lang
    ? captions.captionTracks.find((track: { languageCode: string }) => track.languageCode === lang)
    : captions.captionTracks[0];
  return track.baseUrl;
}

async function fetchCaptionsContent(captionsURL: string, lang?: string): Promise<string> {
  const response = await fetch(captionsURL, {
    headers: {
      ...(lang && { 'Accept-Language': lang }),
      'User-Agent': USER_AGENT_STRING,
    },
  });
  if (!response.ok) throw errorTypes.NoCaptionsAvailable('Video ID');
  return response.text();
}

function parseCaptionsContent(
  captionsContent: string,
  captions: any,
  lang?: string
): CaptionResponse[] {
  const matches = [...captionsContent.matchAll(CAPTION_XML_REGEX)];
  return matches.map((match) => ({
    text: match[3],
    duration: parseFloat(match[2]),
    offset: parseFloat(match[1]),
    lang: lang ?? captions.captionTracks[0].languageCode,
  }));
}

/**
 * Extract video identifier from a URL or string.
 * @param {string} videoId - The video URL or ID.
 * @returns {string} Video identifier.
 */
function extractVideoIdentifier(videoId: string): string {
  if (videoId.length === 11) return videoId;
  const match = videoId.match(YOUTUBE_URL_REGEX);
  if (match) return match[1];
  throw new YouTubeCaptionError('Unable to retrieve YouTube video ID.');
}

module.exports = getVideoCaptions;
