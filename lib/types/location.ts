// Shared types for location-related functionality

export interface LocationCoords {
  latitude: number;
  longitude: number;
}

export interface LocationError {
  message: string;
  code?: string;
}
