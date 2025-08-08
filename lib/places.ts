import { LocationCoords } from './types/location';
import { locationService } from './location';

// Note: In a production app, you should store this in an environment variable
const GOOGLE_PLACES_API_KEY = process.env.EXPO_PUBLIC_Maps_API_KEY;

export interface PlacePrediction {
  description: string;
  place_id: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
}

export interface PlaceDetails {
  address_components: {
    long_name: string;
    short_name: string;
    types: string[];
  }[];
  formatted_address: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  place_id: string;
  types: string[];
}

class PlacesService {
  private baseUrl = 'https://maps.googleapis.com/maps/api/place';
  private locationService: typeof locationService;

  constructor() {
    this.locationService = locationService;
  }

  /**
   * Search for places based on input text
   */
  async searchPlaces(query: string, location?: LocationCoords): Promise<{ predictions: PlacePrediction[]; error?: string }> {
    try {
      const { latitude, longitude } = location || {};
      let url = `${this.baseUrl}/autocomplete/json?input=${encodeURIComponent(query)}&key=${GOOGLE_PLACES_API_KEY}&components=country:in`;
      
      if (latitude && longitude) {
        url += `&location=${latitude},${longitude}&radius=20000`; // 20km radius
      }

      const response = await fetch(url);
      const data = await response.json();

      if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
        return { predictions: [], error: data.error_message || 'Failed to search places' };
      }

      return { predictions: data.predictions || [] };
    } catch (error) {
      console.error('Error searching places:', error);
      return { predictions: [], error: 'Failed to search places' };
    }
  }

  /**
   * Get place details by place ID
   */
  async getPlaceDetails(placeId: string): Promise<{ details?: PlaceDetails; error?: string }> {
    try {
      const url = `${this.baseUrl}/details/json?place_id=${placeId}&fields=address_component,formatted_address,geometry,place_id,type&key=${GOOGLE_PLACES_API_KEY}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.status !== 'OK') {
        return { error: data.error_message || 'Failed to get place details' };
      }

      return { details: data.result };
    } catch (error) {
      console.error('Error getting place details:', error);
      return { error: 'Failed to get place details' };
    }
  }

  /**
   * Get current device location
   */
  async getCurrentLocation() {
    return this.locationService.getCurrentLocation();
  }

  /**
   * Reverse geocode coordinates to address
   */
  async reverseGeocode(coords: LocationCoords) {
    // We can enhance this to use Google Places API for better accuracy
    return this.locationService.reverseGeocode(coords);
  }

  /**
   * Extract address components from place details
   */
  extractAddressComponents(placeDetails: PlaceDetails) {
    const addressComponents = placeDetails.address_components || [];
    
    const getComponent = (types: string[]) => {
      const component = addressComponents.find(comp => 
        types.some(type => comp.types.includes(type))
      );
      return component?.long_name || '';
    };

    return {
      street: getComponent(['route']),
      streetNumber: getComponent(['street_number']),
      city: getComponent(['locality', 'sublocality', 'sublocality_level_1']),
      state: getComponent(['administrative_area_level_1']),
      country: getComponent(['country']),
      postalCode: getComponent(['postal_code']),
      fullAddress: placeDetails.formatted_address,
      location: {
        latitude: placeDetails.geometry.location.lat,
        longitude: placeDetails.geometry.location.lng,
      },
    };
  }
}

export const placesService = new PlacesService();