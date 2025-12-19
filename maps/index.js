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

export const createMapsClient = (provider = "nominatim") => {
  const impl = providers[provider];
  if (!impl) throw new Error(`Unknown maps provider: ${provider}`);

  return {
    search: (query) => impl.search(query),
    provider,
  };
};

export const registerProvider = (name, impl) => {
  providers[name] = impl;
};

export default createMapsClient;
