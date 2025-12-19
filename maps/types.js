import T from "../types/index.js";

export default {
  name: "@bootstrapp/maps",
  exports: {
    createMapsClient: T.function({
      description: "Create a maps client instance for geocoding and place search",
      args: [
        T.string({ name: "provider", description: "Provider name (default: 'nominatim')" }),
      ],
      returns: T.object({ description: "Maps client with search method" }),
    }),

    registerProvider: T.function({
      description: "Register a custom maps provider implementation",
      args: [
        T.string({ name: "name", description: "Provider name" }),
        T.object({ name: "impl", description: "Provider implementation { search: async (query) => [...] }" }),
      ],
      returns: T.any(),
    }),

    MapsClient: {
      $interface: true,
      search: T.function({
        description: "Search for places matching the query",
        args: [T.string({ name: "query", description: "Search query string" })],
        returns: T.array({ description: "Array of PlaceResult objects" }),
      }),
      provider: T.string({ description: "Current provider name" }),
    },

    PlaceResult: {
      $interface: true,
      id: T.any({ description: "Place ID from provider" }),
      name: T.string({ description: "Place name" }),
      address: T.string({ description: "Full address string" }),
      lat: T.number({ description: "Latitude" }),
      lng: T.number({ description: "Longitude" }),
      type: T.string({ description: "Place type from provider" }),
      category: T.string({ description: "Place category from provider" }),
    },

    ProviderImplementation: {
      $interface: true,
      search: T.function({
        description: "Search implementation for the provider",
        args: [T.string({ name: "query" })],
        returns: T.array({ description: "Array of PlaceResult objects" }),
      }),
    },
  },
};
