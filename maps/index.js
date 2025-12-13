/**
 * @bootstrapp/maps - Provider-Agnostic Maps Client
 * Prototype implementation with Nominatim (OpenStreetMap)
 */

// Provider implementations
const providers = {
  nominatim: {
    search: async (query) => {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=10&addressdetails=1`,
        {
          headers: {
            "User-Agent": "Bootstrapp/1.0",
          },
        },
      );
      const data = await res.json();
      return data.map((item) => ({
        id: item.place_id,
        name: item.name || item.display_name.split(",")[0],
        address: item.display_name,
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon),
        type: item.type,
        category: item.class,
      }));
    },
  },
};

/**
 * Create a maps client instance
 * @param {string} provider - Provider name (default: 'nominatim')
 * @returns {Object} Maps client with search method
 */
export const createMapsClient = (provider = "nominatim") => {
  const impl = providers[provider];
  if (!impl) throw new Error(`Unknown maps provider: ${provider}`);

  return {
    search: (query) => impl.search(query),
    provider,
  };
};

/**
 * Register a custom maps provider
 * @param {string} name - Provider name
 * @param {Object} impl - Provider implementation { search: async (query) => [...] }
 */
export const registerProvider = (name, impl) => {
  providers[name] = impl;
};

export default createMapsClient;
