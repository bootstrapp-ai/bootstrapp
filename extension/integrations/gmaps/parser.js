/**
 * Google Maps Integration - Data Parser
 * Parse Google Maps API responses into structured data
 * Borrowed and adapted from legacy public/integrations/gmaps/backend.js
 */

/**
 * Safely traverse nested object path
 */
function getData(obj, path, modifier = (val) => val) {
  const result = path.reduce(
    (xs, x) => (xs && xs[x] !== undefined ? xs[x] : null),
    obj
  );
  return result !== null ? modifier(result) : null;
}

/**
 * Find all Google media URLs in nested data
 */
function findGoogleMediaUrls(data) {
  const mediaUrls = [];

  function traverse(obj, path = "") {
    if (Array.isArray(obj)) {
      obj.forEach((item, index) => traverse(item, `${path}[${index}]`));
    } else if (typeof obj === "object" && obj !== null) {
      Object.entries(obj).forEach(([key, value]) =>
        traverse(value, `${path}.${key}`)
      );
    } else if (
      typeof obj === "string" &&
      obj.includes("googleusercontent.com") &&
      obj.endsWith("-no")
    ) {
      mediaUrls.push({ url: obj, path });
    }
  }

  traverse(data);
  return mediaUrls;
}

/**
 * Extract place data from Google Maps response
 */
export function getPlaceData(mainData) {
  return {
    name: getData(mainData, [11]),
    address: getData(mainData, [2], (arr) => arr.join(", ")),
    phoneNumber: getData(mainData, [178, 0, 0]),
    rating: getData(mainData, [4, 7]),
    reviewCount: getData(mainData, [4, 8]) || 0,
    priceRange: getData(mainData, [4, 2]),
    website: getData(mainData, [7, 0]),
    menu: getData(mainData, [7, 1]),
    openingHours:
      getData(
        mainData,
        [34, 1],
        (arr) =>
          Array.isArray(arr) &&
          arr.map((day) => ({
            day: day[0],
            hours: day[1],
          }))
      ) || [],
    categories: getData(mainData, [13]) || [],
    coordinates: {
      latitude: getData(mainData, [9, 2]),
      longitude: getData(mainData, [9, 3]),
    },
    placeId: getData(mainData, [78]),
    description: getData(
      mainData,
      [32],
      (arr) =>
        Array.isArray(arr) && arr.map((item) => item?.[1]).filter(Boolean)
    ),
    popularTimes: getData(mainData, [84, 0]) || [],
    reviews:
      getData(
        mainData,
        [8],
        (arr) =>
          Array.isArray(arr) &&
          arr.map((review) => ({
            authorName: getData(review, [0, 1]),
            authorUrl: getData(review, [0, 0]),
            profilePhotoUrl: getData(review, [0, 2]),
            rating: getData(review, [4]),
            relativeTimeDescription: getData(review, [3]),
            text: getData(review, [1]),
            time: getData(review, [27]),
          }))
      ) || [],
    amenities:
      getData(
        mainData,
        [100, 1],
        (arr) =>
          Array.isArray(arr) &&
          arr.flatMap((category) =>
            (category[2] || []).map((amenity) => ({
              category: category[1],
              name: getData(amenity, [1]),
              available: getData(amenity, [2, 0]) === 1,
            }))
          )
      ) || [],
    recommendations:
      getData(
        mainData,
        [31, 0, 1],
        (arr) =>
          Array.isArray(arr) &&
          arr.map((place) => ({
            name: getData(place, [1]),
            placeId: getData(place, [0]),
            rating: getData(place, [4, 7]),
            reviewCount: getData(place, [4, 8]) || 0,
            categories: getData(place, [13]) || [],
          }))
      ) || [],
    attributes:
      getData(
        mainData,
        [51],
        (arr) =>
          Array.isArray(arr) &&
          arr.map((attr) => ({
            name: getData(attr, [1]),
            value: getData(attr, [2]),
          }))
      ) || [],
    businessStatus: getData(mainData, [147]),
    priceLevel: getData(mainData, [4, 2]),
    editorialSummary: getData(mainData, [147, 1]),
    reservation:
      getData(mainData, [4, 12], (res) => ({
        url: getData(res, [0]),
        provider: getData(res, [1]),
      })) || null,
    menuUrl: getData(mainData, [4, 37]),
    orderUrl: getData(mainData, [4, 6]),
    images: findGoogleMediaUrls(mainData),
  };
}

/**
 * Parse list of places from search results
 */
export function parsePlaceList(placeList) {
  return placeList.map((data) => getPlaceData(data[14]));
}

/**
 * Parse place details from API response
 */
export function parseGoogleMapsData(jsonString) {
  const data = typeof jsonString === "string" ? JSON.parse(jsonString) : jsonString;
  const mainData = data[6];
  return getPlaceData(mainData);
}

/**
 * Parse search results from API response
 */
export function parseSearchResults(responseText) {
  // Google Maps returns data with prefix that needs to be stripped
  const parsed = `${responseText.slice(18)}`;
  const jsonMatch = parsed.match(/^.*\]/);

  if (!jsonMatch) {
    throw new Error("No valid JSON found in the response");
  }

  const jsonString = jsonMatch[0];
  const withPlaceholder = jsonString.replace(/\\\\/g, "__TEMP_BACKSLASH__");
  const withoutSingleBackslashes = withPlaceholder.replace(/\\/g, "");
  const processedString = withoutSingleBackslashes.replace(
    /__TEMP_BACKSLASH__/g,
    "\\"
  );

  const jsonData = JSON.parse(processedString);
  const queryTitle = jsonData[0][0];
  const placeList = jsonData[0][1].slice(1);
  const parsedPlaceList = parsePlaceList(placeList);

  return {
    queryTitle,
    places: parsedPlaceList,
  };
}

/**
 * Parse place details response
 */
export function parsePlaceDetails(responseText) {
  // Google Maps returns data with prefix that needs to be stripped
  const data = responseText.slice(4);
  return parseGoogleMapsData(data);
}

export default {
  getData,
  getPlaceData,
  parsePlaceList,
  parseGoogleMapsData,
  parseSearchResults,
  parsePlaceDetails,
  findGoogleMediaUrls,
};
