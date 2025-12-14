/**
 * Instagram API Client
 * Direct API calls with doc_id registry for GraphQL queries
 */

// Default doc_id registry - these may change over time
const DEFAULT_DOC_IDS = {
  profile: null, // Discover via interception
  post: "10015901848474",
  reel: "25981206651899035",
  comments: "8845758582119845",
  timeline: "9310670392322965",
};

// Instagram Web App ID (stable)
const IG_APP_ID = "936619743392459";

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
async function updateDocId(type, docId) {
  const current = await getDocIds();
  current[type] = docId;
  await chrome.storage.local.set({ instagramDocIds: current });
  console.log(`[IG-API] Updated doc_id for ${type}: ${docId}`);
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
      console.log(`[IG-API] REST API returned ${response.status}`);
      return null;
    }

    const data = await response.json();
    return data?.data?.user || null;
  } catch (error) {
    console.error("[IG-API] REST API error:", error);
    return null;
  }
}

/**
 * Fetch profile via GraphQL (needs doc_id)
 */
async function fetchProfileViaGraphQL(username, docId) {
  const lsd = getLsdToken();
  if (!lsd) {
    console.log("[IG-API] No LSD token found");
    return null;
  }

  if (!docId) {
    console.log("[IG-API] No doc_id for profile");
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
      console.log(`[IG-API] GraphQL returned ${response.status}`);
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
    console.error("[IG-API] GraphQL error:", error);
    return null;
  }
}

/**
 * Main function to fetch Instagram profile
 * Tries REST API first, falls back to GraphQL
 */
async function fetchInstagramProfile(username) {
  console.log(`[IG-API] Fetching profile: ${username}`);

  // Try REST API first (more stable)
  let user = await fetchProfileViaRest(username);
  if (user) {
    console.log("[IG-API] Got profile via REST API");
    return { success: true, user, source: "rest" };
  }

  // Fallback to GraphQL if we have a doc_id
  const docIds = await getDocIds();
  if (docIds.profile) {
    user = await fetchProfileViaGraphQL(username, docIds.profile);
    if (user) {
      console.log("[IG-API] Got profile via GraphQL");
      return { success: true, user, source: "graphql" };
    }
  }

  return {
    success: false,
    error: "Could not fetch profile. Make sure you're logged into Instagram.",
  };
}

/**
 * Extract username from Instagram URL
 */
function extractUsernameFromUrl(url) {
  const match = url?.match(/instagram\.com\/([^/?]+)/);
  return match ? match[1] : null;
}

// Export for use in content.js (will be inlined)
if (typeof window !== "undefined") {
  window.__instagramAPI = {
    fetchInstagramProfile,
    getDocIds,
    updateDocId,
    getLsdToken,
    extractUsernameFromUrl,
  };
}
