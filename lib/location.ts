import * as Location from 'expo-location';
import { Alert, Platform } from 'react-native';
import { LocationCoords, LocationError } from './types/location';

class LocationService {
  // Request location permissions
  async requestPermissions(): Promise<{ success: boolean; error?: LocationError }> {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        return {
          success: false,
          error: {
            message: 'Location permission is required for delivery services',
            code: 'PERMISSION_DENIED'
          }
        };
      }

      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: {
          message: error.message || 'Failed to request location permissions',
          code: 'PERMISSION_ERROR'
        }
      };
    }
  }

  // Get current location
  async getCurrentLocation(): Promise<{ location?: LocationCoords; error?: LocationError }> {
    try {
      const permissionResult = await this.requestPermissions();
      if (!permissionResult.success) {
        return { error: permissionResult.error };
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        timeInterval: 5000,
        distanceInterval: 10,
      });

      return {
        location: {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        }
      };
    } catch (error: any) {
      return {
        error: {
          message: error.message || 'Failed to get current location',
          code: 'LOCATION_ERROR'
        }
      };
    }
  }

  // Watch location changes (for live tracking)
  async watchLocation(
    callback: (location: LocationCoords) => void,
    errorCallback: (error: LocationError) => void
  ): Promise<{ subscription?: Location.LocationSubscription; error?: LocationError }> {
    try {
      const permissionResult = await this.requestPermissions();
      if (!permissionResult.success) {
        return { error: permissionResult.error };
      }

      const subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 5000,
          distanceInterval: 10,
        },
        (location) => {
          callback({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          });
        }
      );

      return { subscription };
    } catch (error: any) {
      const locationError = {
        message: error.message || 'Failed to watch location',
        code: 'WATCH_ERROR'
      };
      errorCallback(locationError);
      return { error: locationError };
    }
  }

  // Calculate distance between two points (Haversine formula)
  calculateDistance(point1: LocationCoords, point2: LocationCoords): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(point2.latitude - point1.latitude);
    const dLon = this.toRadians(point2.longitude - point1.longitude);
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(point1.latitude)) * 
      Math.cos(this.toRadians(point2.latitude)) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  // Reverse geocode coordinates to address using Google Places API
  async reverseGeocode(coords: LocationCoords): Promise<{ address?: string; error?: LocationError }> {
    try {
      // First try with Google Places API for better accuracy
      const { latitude, longitude } = coords;
      const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${process.env.GOOGLE_PLACES_API_KEY}`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.status === 'OK' && data.results && data.results.length > 0) {
        return { address: data.results[0].formatted_address };
      }
      
      // Fall back to expo-location if Places API fails
      console.log('Falling back to expo-location reverse geocoding');
      const results = await Location.reverseGeocodeAsync(coords);
      
      if (!results || results.length === 0) {
        return { 
          error: { 
            message: 'Could not find address for this location',
            code: 'REVERSE_GEOCODE_ERROR'
          } 
        };
      }

      const address = results[0];
      const addressString = [
        address.name,
        address.street,
        address.city,
        address.region,
        address.postalCode,
        address.country
      ].filter(Boolean).join(', ');

      return { address: addressString };
    } catch (error: any) {
      console.error('Reverse geocoding error:', error);
      return {
        error: {
          message: error.message || 'Failed to reverse geocode location',
          code: 'REVERSE_GEOCODE_ERROR'
        }
      };
    }
  }

  // Forward geocoding -  // Geocode an address to coordinates using Google Places API
  async geocode(address: string): Promise<{ location?: LocationCoords; error?: LocationError }> {
    try {
      // First try with Google Places API for better accuracy
      const { predictions, error: searchError } = await placesService.searchPlaces(address);
      
      if (searchError || !predictions || predictions.length === 0) {
        // Fall back to expo-location if Places API fails
        console.log('Falling back to expo-location geocoding');
        const results = await Location.geocodeAsync(address);
        
        if (!results || results.length === 0) {
          return { 
            error: { 
              message: 'Could not find location for this address',
              code: 'GEOCODE_ERROR'
            } 
          };
        }

        return {
          location: {
            latitude: results[0].latitude,
            longitude: results[0].longitude,
          }
        };
      }

      // Get the first prediction's details
      const placeId = predictions[0].place_id;
      const { details, error: detailsError } = await placesService.getPlaceDetails(placeId);
      
      if (detailsError || !details) {
        throw new Error(detailsError || 'Failed to get place details');
      }

      return {
        location: {
          latitude: details.geometry.location.lat,
          longitude: details.geometry.location.lng,
        }
      };
    } catch (error: any) {
      console.error('Geocoding error:', error);
      return {
        error: {
          message: error.message || 'Failed to geocode address',
          code: 'GEOCODE_ERROR'
        }
      };
    }
  }
}

export const locationService = new LocationService();

// Helper function to show location errors
export const showLocationError = (error: LocationError) => {
  Alert.alert('Location Error', error.message);
};