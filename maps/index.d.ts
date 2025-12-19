/**
 * Generated from @bootstrapp/maps
 * @generated
 */

  export const createMapsClient: (provider: string) => Record<string, any>;

  export const registerProvider: (name: string, impl: Record<string, any>) => any;

  export interface MapsClient {
    search(query: string): any[];
    provider?: string;
  }

  export interface PlaceResult {
    id?: any;
    name?: string;
    address?: string;
    lat?: number;
    lng?: number;
    type?: string;
    category?: string;
  }

  export interface ProviderImplementation {
    search(query: string): any[];
  }
