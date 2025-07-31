import * as Location from 'expo-location';
import { Alert } from 'react-native';

export interface LocationCoords {
  latitude: number;
  longitude: number;
}

export interface LocationError {
  message: string;
  code?: string;
}

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

  // Reverse geocoding - get address from coordinates
  async reverseGeocode(coords: LocationCoords): Promise<{ address?: string; error?: LocationError }> {
    try {
      const result = await Location.reverseGeocodeAsync(coords);
      
      if (result.length > 0) {
        const location = result[0];
        const address = `${location.street || ''} ${location.city || ''} ${location.region || ''} ${location.postalCode || ''}`.trim();
        return { address };
      }

      return { error: { message: 'No address found for the given coordinates' } };
    } catch (error: any) {
      return {
        error: {
          message: error.message || 'Failed to get address',
          code: 'GEOCODING_ERROR'
        }
      };
    }
  }

  // Forward geocoding - get coordinates from address
  async geocode(address: string): Promise<{ location?: LocationCoords; error?: LocationError }> {
    try {
      const result = await Location.geocodeAsync(address);
      
      if (result.length > 0) {
        const location = result[0];
        return {
          location: {
            latitude: location.latitude,
            longitude: location.longitude,
          }
        };
      }

      return { error: { message: 'No coordinates found for the given address' } };
    } catch (error: any) {
      return {
        error: {
          message: error.message || 'Failed to get coordinates',
          code: 'GEOCODING_ERROR'
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