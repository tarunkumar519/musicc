import md5 from "@/utils/md5";

export const LASTFM_API_KEY = "bcbb5704bbe03e75f31dc2e000e68e9d";
export const LASTFM_SHARED_SECRET = "9353f0787c2b2ea21f28a4c657665ade";

const API_ROOT = "https://ws.audioscrobbler.com/2.0/";

// Generate method signature
const generateSignature = (params, secret) => {
  const keys = Object.keys(params).sort();
  let sigString = "";
  keys.forEach((key) => {
    if (key !== "format" && key !== "callback") {
        sigString += key + params[key];
    }
  });
  sigString += secret;
  return md5(sigString);
};

export const getAuthUrl = () => {
  // Redirect to /scrobble which will handle the token exchange
  const cb = typeof window !== 'undefined' ? window.location.origin + "/scrobble" : "";
  return `http://www.last.fm/api/auth/?api_key=${LASTFM_API_KEY}&cb=${encodeURIComponent(cb)}`;
};

export const getSession = async (token) => {
  const params = {
    method: "auth.getSession",
    api_key: LASTFM_API_KEY,
    token: token,
  };
  const apiSig = generateSignature(params, LASTFM_SHARED_SECRET);
  params.api_sig = apiSig;
  params.format = "json";

  const queryString = new URLSearchParams(params).toString();
  try {
    const res = await fetch(`${API_ROOT}?${queryString}`);
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Last.fm session error:", error);
    return null;
  }
};

export const scrobble = async (song, sessionKey) => {
  if (!song || !sessionKey) return;

  // Extract artist name
  // Priority:
  // 1. song.artists.primary[0].name (Array of objects)
  // 2. song.primaryArtists (String or Array)
  // 3. song.singers (String)
  // 4. song.artist (String - sometimes used in generic objects)
  let artist = null;

  if (song.artists?.primary?.[0]?.name) {
    artist = song.artists.primary[0].name;
  } else if (typeof song.primaryArtists === 'string') {
    // If it's a string like "Artist1, Artist2", take the first one or the whole string?
    // Last.fm usually prefers the primary artist. Saavn often gives "A, B".
    // Let's try to split by comma and take the first one if it looks like a list
    // But sometimes the artist name might contain a comma? Unlikely for names.
    // However, for scrobbling, exact match is better.
    // If we send "Artist1, Artist2", Last.fm might create a new artist entry.
    // Let's take the first one if comma separated.
    artist = song.primaryArtists.split(',')[0].trim();
  } else if (song.singers) {
    artist = song.singers.split(',')[0].trim();
  } else if (song.artist) {
    artist = song.artist;
  }
  
  // Clean up artist name (remove html entities if any, though unlikely from API JSON)
  if (artist) {
      artist = artist.replace(/&amp;/g, '&').replace(/&quot;/g, '"');
  }

  const track = song.name ? song.name.replace(/&amp;/g, '&').replace(/&quot;/g, '"') : null;
  const timestamp = Math.floor(Date.now() / 1000);

  if (!artist || !track) {
      console.log("Scrobble failed: Missing artist or track", { artist, track, song });
      return;
  }

  const params = {
    method: "track.scrobble",
    artist: artist,
    track: track,
    timestamp: timestamp,
    api_key: LASTFM_API_KEY,
    sk: sessionKey,
  };

  const apiSig = generateSignature(params, LASTFM_SHARED_SECRET);
  params.api_sig = apiSig;
  params.format = "json";

  // Scrobble is a POST request
  const body = new URLSearchParams(params);

  try {
    const res = await fetch(API_ROOT, {
        method: 'POST',
        body: body
    });
    const data = await res.json();
    console.log("Scrobbled:", data);
    return data;
  } catch (error) {
    console.error("Scrobble error:", error);
  }
};
