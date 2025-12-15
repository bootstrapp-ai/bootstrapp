/**
 * Instagram Integration - Content Script Handlers
 * Instagram-specific scraping and API functions
 */

// Message types for Instagram
const MSG = {
  SCRAPE_INSTAGRAM: "ext:scrapeInstagram",
  FETCH_INSTAGRAM_PROFILE: "ext:fetchInstagramProfile",
  UPDATE_DOC_ID: "ext:updateDocId",
  DATA: "ext:data",
  ERROR: "ext:error",
};

// Instagram Web App ID (stable)
const IG_APP_ID = "936619743392459";

// Default doc_id registry - these may change over time
const DEFAULT_DOC_IDS = {
  profile: null, // Discover via interception
  post: "10015901848474",
  reel: "25981206651899035",
  comments: "8845758582119845",
  timeline: "9310670392322965",
};

/**
 * Get doc_ids from storage, merged with defaults
 */
async function getDocIds() {
  try {
    const result = await chrome.storage.local.get("instagramDocIds");
    return { ...DEFAULT_DOC_IDS, ...(result.instagramDocIds || {}) };
  } catch {
    return DEFAULT_DOC_IDS;
  }
}

/**
 * Update a specific doc_id in storage
 */
async function updateInstagramDocId({ type, docId }) {
  try {
    const current = await getDocIds();
    current[type] = docId;
    await chrome.storage.local.set({ instagramDocIds: current });
    console.log(`[Instagram] Updated doc_id for ${type}: ${docId}`);
    return { type: MSG.DATA, data: { success: true, type, docId } };
  } catch (error) {
    return { type: MSG.ERROR, error: error.message };
  }
}

/**
 * Extract LSD token from page (CSRF token)
 */
function getLsdToken() {
  // Try hidden input first (most reliable)
  const input = document.querySelector('input[name="lsd"]');
  if (input?.value) {
    return input.value;
  }

  // Try to find in script tags
  const scripts = document.querySelectorAll("script");
  for (const script of scripts) {
    const text = script.textContent || "";
    // Pattern: "LSD",[],{"token":"..."}
    const match = text.match(/"LSD"\s*,\s*\[\]\s*,\s*\{\s*"token"\s*:\s*"([^"]+)"/);
    if (match) {
      return match[1];
    }
    // Alternative pattern
    const altMatch = text.match(/\\"LSD\\"[^}]*\\"token\\":\\"([^"\\]+)\\"/);
    if (altMatch) {
      return altMatch[1];
    }
  }

  return null;
}

/**
 * Scrape Instagram profile data from DOM
 */
function scrapeInstagramProfile() {
  try {
    const data = {
      username: null,
      fullName: null,
      bio: null,
      avatar: null,
      followers: null,
      following: null,
      posts: null,
      isVerified: false,
      externalLink: null,
      profileUrl: window.location.href,
    };

    // Get username from URL (most reliable)
    const urlMatch = window.location.pathname.match(/^\/([^\/]+)\/?/);
    data.username = urlMatch ? urlMatch[1] : null;

    // Get from meta tags (very reliable)
    const metaTitle = document.querySelector('meta[property="og:title"]');
    if (metaTitle) {
      const titleContent = metaTitle.content;
      // Format: "Full Name (@username) - Instagram photos and videos"
      const nameMatch = titleContent.match(/^([^(]+)\s*\(@/);
      if (nameMatch) {
        data.fullName = nameMatch[1].trim();
      }
    }

    const metaDesc = document.querySelector('meta[property="og:description"]');
    if (metaDesc) {
      // Format: "123 Followers, 45 Following, 67 Posts - See Instagram photos..."
      const descContent = metaDesc.content;
      const followersMatch = descContent.match(/([\d,.]+[KMB]?)\s*Followers/i);
      const followingMatch = descContent.match(/([\d,.]+[KMB]?)\s*Following/i);
      const postsMatch = descContent.match(/([\d,.]+[KMB]?)\s*Posts/i);

      if (followersMatch) data.followers = followersMatch[1];
      if (followingMatch) data.following = followingMatch[1];
      if (postsMatch) data.posts = postsMatch[1];
    }

    // Get avatar (profile picture)
    const avatarImg =
      document.querySelector('header img[alt*="profile picture"]') ||
      document.querySelector("img[alt*=\"'s profile picture\"]") ||
      document.querySelector('header img[data-testid="user-avatar"]');
    if (avatarImg) {
      data.avatar = avatarImg.src;
    }

    // Check for verification badge
    data.isVerified = !!document.querySelector('svg[aria-label="Verified"]');

    // Get bio text - look for spans with text in header section
    const headerSection = document.querySelector("header section");
    if (headerSection) {
      // Try different approaches for bio
      const bioSpan = headerSection.querySelector('span[dir="auto"]');
      if (bioSpan && bioSpan.textContent && !bioSpan.textContent.includes("Followers")) {
        data.bio = bioSpan.textContent.trim();
      }

      // Alternative: look for h1 (sometimes contains name)
      if (!data.fullName) {
        const h1 = headerSection.querySelector("h1");
        if (h1) {
          data.fullName = h1.textContent.trim();
        }
      }
    }

    // Get external link
    const extLink = document.querySelector('header a[href*="l.instagram.com"]');
    if (extLink) {
      data.externalLink = extLink.href;
    }

    console.log("[Instagram] Profile data:", data);
    return { type: MSG.DATA, data };
  } catch (error) {
    console.error("[Instagram] Scrape error:", error);
    return { type: MSG.ERROR, error: error.message };
  }
}

/**
 * Fetch profile via REST API (more stable, doesn't need doc_id)
 */
async function fetchProfileViaRest(username) {
  try {
    const response = await fetch(
      `https://i.instagram.com/api/v1/users/web_profile_info/?username=${encodeURIComponent(username)}`,
      {
        headers: {
          "X-IG-App-ID": IG_APP_ID,
          "X-Requested-With": "XMLHttpRequest",
        },
        credentials: "include",
      }
    );

    if (!response.ok) {
      console.log(`[Instagram] REST API returned ${response.status}`);
      return null;
    }

    const data = await response.json();
    return data?.data?.user || null;
  } catch (error) {
    console.error("[Instagram] REST API error:", error);
    return null;
  }
}

/**
 * Fetch profile via GraphQL (needs doc_id)
 */
async function fetchProfileViaGraphQL(username, docId) {
  const lsd = getLsdToken();
  if (!lsd) {
    console.log("[Instagram] No LSD token found");
    return null;
  }

  if (!docId) {
    console.log("[Instagram] No doc_id for profile");
    return null;
  }

  try {
    const response = await fetch("https://www.instagram.com/api/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "X-IG-App-ID": IG_APP_ID,
        "X-FB-LSD": lsd,
        "X-ASBD-ID": "129477",
        "X-Requested-With": "XMLHttpRequest",
      },
      body: new URLSearchParams({
        variables: JSON.stringify({ username }),
        doc_id: docId,
        lsd: lsd,
      }),
      credentials: "include",
    });

    if (!response.ok) {
      console.log(`[Instagram] GraphQL returned ${response.status}`);
      return null;
    }

    const data = await response.json();
    // Handle different response formats
    return (
      data?.data?.user ||
      data?.data?.xdt_api__v1__users__web_profile_info?.user ||
      null
    );
  } catch (error) {
    console.error("[Instagram] GraphQL error:", error);
    return null;
  }
}

/**
 * Main function to fetch Instagram profile via API
 * Tries REST API first, falls back to GraphQL
 */
async function fetchInstagramProfileAPI({ username }) {
  console.log(`[Instagram] Fetching profile: ${username}`);

  try {
    // Try REST API first (more stable)
    let user = await fetchProfileViaRest(username);
    if (user) {
      console.log("[Instagram] Got profile via REST API");
      return { type: MSG.DATA, data: { success: true, user, source: "rest" } };
    }

    // Fallback to GraphQL if we have a doc_id
    const docIds = await getDocIds();
    if (docIds.profile) {
      user = await fetchProfileViaGraphQL(username, docIds.profile);
      if (user) {
        console.log("[Instagram] Got profile via GraphQL");
        return { type: MSG.DATA, data: { success: true, user, source: "graphql" } };
      }
    }

    return {
      type: MSG.DATA,
      data: {
        success: false,
        error: "Could not fetch profile. Make sure you're logged into Instagram.",
      },
    };
  } catch (error) {
    console.error("[Instagram] Fetch profile error:", error);
    return { type: MSG.ERROR, error: error.message };
  }
}

/**
 * Register Instagram message handlers with the core content script
 * @param {Function} addHandler - Function to register a handler: addHandler(type, handlerFn)
 */
export function register(addHandler) {
  addHandler(MSG.SCRAPE_INSTAGRAM, () => scrapeInstagramProfile());
  addHandler(MSG.FETCH_INSTAGRAM_PROFILE, (payload) => fetchInstagramProfileAPI(payload));
  addHandler(MSG.UPDATE_DOC_ID, (payload) => updateInstagramDocId(payload));

  console.log("[Instagram] Handlers registered");
}

/**
 * Check if current URL is an Instagram page
 */
export function isMatch() {
  return window.location.hostname.includes("instagram.com");
}

export default {
  register,
  isMatch,
};
