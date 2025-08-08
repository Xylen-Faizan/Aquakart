import * as Location from 'expo-location';
import { Alert } from 'react-native';
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

  // Reverse geocode coordinates to an address using Expo's service
  async reverseGeocode(coords: LocationCoords): Promise<{ address?: string; error?: LocationError }> {
    try {
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
}

export const locationService = new LocationService();

// Helper function to show location errors
export const showLocationError = (error: LocationError) => {
  Alert.alert('Location Error', error.message);
};