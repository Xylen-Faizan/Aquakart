import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ActivityIndicator, Platform, FlatList } from 'react-native';
import { LocationCoords } from '@/lib/location';
import { placesService } from '@/lib/places';
import { MaterialIcons } from '@expo/vector-icons';

interface AddressAutocompleteProps {
  initialAddress?: string;
  placeholder?: string;
  onSelect: (address: string, location?: LocationCoords) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  style?: any;
  inputStyle?: any;
  error?: string;
  showCurrentLocation?: boolean;
}

const AddressAutocomplete: React.FC<AddressAutocompleteProps> = ({
  initialAddress = '',
  placeholder = 'Enter your address',
  onSelect,
  onFocus,
  onBlur,
  style,
  inputStyle,
  error,
  showCurrentLocation = true,
}) => {
  const [query, setQuery] = useState(initialAddress);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<TextInput>(null);

  // Debounce search to avoid too many API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.length > 2) {
        searchPlaces(query);
      } else {
        setSuggestions([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const searchPlaces = async (searchQuery: string) => {
    if (searchQuery.length < 3) return;
    
    setIsLoading(true);
    try {
      const { predictions, error } = await placesService.searchPlaces(searchQuery);
      
      if (error) {
        console.error('Error searching places:', error);
        return;
      }
      
      setSuggestions(predictions || []);
    } catch (err) {
      console.error('Failed to search places:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelect = async (placeId: string, description: string) => {
    try {
      setIsLoading(true);
      setQuery(description);
      setSuggestions([]);
      
      // Get place details for coordinates
      const { details, error } = await placesService.getPlaceDetails(placeId);
      
      if (error || !details) {
        console.error('Error getting place details:', error);
        onSelect(description);
        return;
      }
      
      // Extract address components
      const addressComponents = placesService.extractAddressComponents(details);
      
      // Format address
      const formattedAddress = [
        addressComponents.streetNumber,
        addressComponents.street,
        addressComponents.city,
        addressComponents.state,
        addressComponents.postalCode,
      ].filter(Boolean).join(', ');
      
      // Call onSelect with formatted address and location
      onSelect(formattedAddress, addressComponents.location);
    } catch (err) {
      console.error('Failed to get place details:', err);
      onSelect(query);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCurrentLocation = async () => {
    try {
      setIsLoading(true);
      const { location, error } = await placesService.getCurrentLocation();
      
      if (error || !location) {
        console.error('Error getting current location:', error);
        return;
      }
      
      // Get address from coordinates
      const { address, error: reverseError } = await placesService.reverseGeocode(location);
      
      if (reverseError || !address) {
        console.error('Error getting address:', reverseError);
        return;
      }
      
      setQuery(address);
      onSelect(address, location);
    } catch (err) {
      console.error('Failed to get current location:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const renderSuggestion = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.suggestionItem}
      onPress={() => handleSelect(item.place_id, item.description)}
    >
      <MaterialIcons name="location-on" size={20} color="#666" style={styles.suggestionIcon} />
      <View style={styles.suggestionTextContainer}>
        <Text style={styles.suggestionMainText} numberOfLines={1}>
          {item.structured_formatting?.main_text || ''}
        </Text>
        <Text style={styles.suggestionSecondaryText} numberOfLines={1}>
          {item.structured_formatting?.secondary_text || ''}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, style]}>
      <View style={[styles.inputContainer, isFocused && styles.inputFocused, error && styles.inputError]}>
        <TextInput
          ref={inputRef}
          style={[styles.input, inputStyle]}
          value={query}
          onChangeText={setQuery}
          placeholder={placeholder}
          placeholderTextColor="#999"
          onFocus={() => {
            setIsFocused(true);
            onFocus?.();
          }}
          onBlur={() => {
            setTimeout(() => setIsFocused(false), 200);
            onBlur?.();
          }}
          autoCorrect={false}
          autoCapitalize="none"
          returnKeyType="search"
          onSubmitEditing={() => onSelect(query)}
        />
        {isLoading ? (
          <ActivityIndicator size="small" color="#666" style={styles.icon} />
        ) : (
          <MaterialIcons
            name="search"
            size={20}
            color="#666"
            style={styles.icon}
            onPress={() => onSelect(query)}
          />
        )}
      </View>

      {error && <Text style={styles.errorText}>{error}</Text>}

      {(isFocused && suggestions.length > 0) && (
        <View style={styles.suggestionsContainer}>
          {showCurrentLocation && (
            <TouchableOpacity
              style={styles.currentLocationButton}
              onPress={handleCurrentLocation}
            >
              <MaterialIcons name="my-location" size={20} color="#2563EB" style={styles.currentLocationIcon} />
              <Text style={styles.currentLocationText}>Use current location</Text>
            </TouchableOpacity>
          )}
          
          <FlatList
            data={suggestions}
            keyExtractor={(item) => item.place_id}
            renderItem={renderSuggestion}
            keyboardShouldPersistTaps="always"
            style={styles.suggestionsList}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    position: 'relative',
    zIndex: 1000,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    backgroundColor: '#FFF',
    paddingHorizontal: 12,
    height: 50,
  },
  inputFocused: {
    borderColor: '#2563EB',
    borderWidth: 2,
  },
  inputError: {
    borderColor: '#EF4444',
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    color: '#1F2937',
    paddingRight: 10,
  },
  icon: {
    marginLeft: 8,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  suggestionsContainer: {
    position: 'absolute',
    top: 55,
    left: 0,
    right: 0,
    backgroundColor: '#FFF',
    borderRadius: 8,
    maxHeight: 250,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    zIndex: 1001,
  },
  suggestionsList: {
    flex: 1,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  suggestionIcon: {
    marginRight: 12,
  },
  suggestionTextContainer: {
    flex: 1,
  },
  suggestionMainText: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '500',
    marginBottom: 2,
  },
  suggestionSecondaryText: {
    fontSize: 12,
    color: '#6B7280',
  },
  currentLocationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  currentLocationIcon: {
    marginRight: 12,
  },
  currentLocationText: {
    fontSize: 14,
    color: '#2563EB',
    fontWeight: '500',
  },
});

export default AddressAutocomplete;
