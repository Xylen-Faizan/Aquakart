import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ViewStyle,
    TextStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MapPin, Plus, ArrowLeft, Trash2, Home, Building, Star, CreditCard as Edit } from 'lucide-react-native';
import AddressAutocomplete from '@/components/AddressAutocomplete';
import { authService } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { locationService } from '@/lib/location';

// The location from Supabase (PostGIS) might be an object with coordinates.
// This interface is now flexible enough to handle both formats.
interface Address {
    id: string;
    title: string;
    address_line: string;
    city: string;
    state: string;
    pincode: string;
    location: any; // Using `any` to accommodate Supabase PostGIS format { coordinates: [lng, lat] }
    is_default: boolean;
}

function Addresses() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingAddress, setEditingAddress] = useState<Address | null>(null);
    const [saving, setSaving] = useState(false);

    interface NewAddress {
        title: string;
        address_line: string;
        city: string;
        state: string;
        pincode: string;
        location: { latitude: number; longitude: number } | null;
    }

    const [newAddress, setNewAddress] = useState<NewAddress>({
        title: '',
        address_line: '',
        city: '',
        state: '',
        pincode: '',
        location: null,
    });

    const resetForm = () => {
        setNewAddress({
            title: '',
            address_line: '',
            city: '',
            state: '',
            pincode: '',
            location: null,
        });
        setEditingAddress(null);
        setShowAddForm(false);
    };

    useEffect(() => {
        loadAddresses();
    }, []);

    const loadAddresses = async () => {
        try {
            const user = await authService.getCurrentUser();
            if (!user) return;

            const { data, error } = await supabase
                .from('addresses')
                .select('*')
                .eq('user_id', user.id)
                .order('is_default', { ascending: false });

            if (error) throw error;
            setAddresses(data || []);
        } catch (error: any) {
            console.error('Error loading addresses:', error);
            Alert.alert('Error', 'Failed to load addresses');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveAddress = async () => {
        if (!newAddress.title.trim() || !newAddress.address_line.trim() ||
            !newAddress.city.trim() || !newAddress.state.trim() || !newAddress.pincode.trim()) {
            Alert.alert('Validation Error', 'Please fill all fields');
            return;
        }

        if (!newAddress.location) {
            Alert.alert('Location Error', 'Please select a valid address from the suggestions');
            return;
        }

        setSaving(true);
        try {
            const user = await authService.getCurrentUser();
            if (!user) throw new Error('User not authenticated');

            const location = newAddress.location;

            const addressData = {
                user_id: user.id,
                title: newAddress.title,
                address_line: newAddress.address_line,
                city: newAddress.city,
                state: newAddress.state,
                pincode: newAddress.pincode,
                location: `POINT(${location.longitude} ${location.latitude})`,
                // Make first address default, but don't change default status when editing
                is_default: editingAddress ? editingAddress.is_default : addresses.length === 0,
            };

            let error;
            if (editingAddress) {
                ({ error } = await supabase
                    .from('addresses')
                    .update(addressData)
                    .eq('id', editingAddress.id));
            } else {
                ({ error } = await supabase
                    .from('addresses')
                    .insert(addressData));
            }

            if (error) throw error;
            
            Alert.alert('Success', `Address ${editingAddress ? 'updated' : 'added'} successfully`);
            await loadAddresses(); // Wait for addresses to reload
            resetForm(); // Then reset the form

        } catch (error: any) {
            console.error('Error saving address:', error);
            Alert.alert('Error', error.message || 'Failed to save address');
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteAddress = (address: Address) => {
        Alert.alert(
            'Delete Address',
            `Are you sure you want to delete "${address.title}"?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const { error } = await supabase
                                .from('addresses')
                                .delete()
                                .eq('id', address.id);

                            if (error) throw error;
                            loadAddresses();
                            Alert.alert('Success', 'Address deleted successfully');
                        } catch (error: any) {
                            Alert.alert('Error', 'Failed to delete address');
                        }
                    }
                }
            ]
        );
    };

    const handleSetDefault = async (addressId: string) => {
        try {
            const user = await authService.getCurrentUser();
            if (!user) return;

            // Using a transaction to ensure both updates succeed or fail together
            const { error } = await supabase.rpc('set_default_address', {
                p_user_id: user.id,
                p_address_id: addressId
            });

            if (error) throw error;
            loadAddresses();
            Alert.alert('Success', 'Default address updated');
        } catch (error: any) {
            console.error('Error setting default address:', error);
            Alert.alert('Error', 'Failed to update default address');
        }
    };

    const handleEditAddress = (address: Address) => {
        let location = null;
        if (address.location) {
            // Handle PostGIS point format: { type: 'Point', coordinates: [lng, lat] }
            if (typeof address.location === 'object' && 'coordinates' in address.location) {
                location = {
                    latitude: (address.location.coordinates as [number, number])[1],
                    longitude: (address.location.coordinates as [number, number])[0]
                };
            // Handle direct { latitude, longitude } format (fallback)
            } else if ('latitude' in address.location && 'longitude' in address.location) {
                location = {
                    latitude: address.location.latitude,
                    longitude: address.location.longitude
                };
            }
        }

        setEditingAddress(address);
        setNewAddress({
            title: address.title,
            address_line: address.address_line,
            city: address.city,
            state: address.state,
            pincode: address.pincode,
            location: location
        });
        setShowAddForm(true);
    };

    const handleAddressSelect = (address: string, location?: { latitude: number; longitude: number }) => {
        if (location) {
            const addressParts = address.split(',').map(part => part.trim());
            
            setNewAddress(prev => ({
                ...prev,
                address_line: [addressParts[0], addressParts[1]].filter(Boolean).join(', '),
                city: addressParts.length > 2 ? addressParts[addressParts.length - 3] : '',
                state: addressParts.length > 2 ? addressParts[addressParts.length - 2] : '',
                pincode: addressParts[addressParts.length - 1]?.match(/\d+/)?.[0] || '',
                location: location
            }));
        } else {
            setNewAddress(prev => ({
                ...prev,
                address_line: address,
                location: null
            }));
        }
    };

    const handleInputChange = (field: keyof NewAddress, value: string) => {
        setNewAddress(prev => ({
            ...prev,
            [field]: value,
            ...(field === 'address_line' && prev.address_line !== value ? { location: null } : {})
        }));
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#2563EB" />
                    <Text style={styles.loadingText}>Loading addresses...</Text>
                </View>
            </SafeAreaView>
        );
    }

    const getAddressIcon = (title: string) => {
        const lowerTitle = title.toLowerCase();
        if (lowerTitle.includes('home')) return Home;
        if (lowerTitle.includes('office') || lowerTitle.includes('work')) return Building;
        return MapPin;
    };

    const AddressCard = ({
        address,
        onEdit,
        onDelete,
        onSetDefault
    }: {
        address: Address;
        onEdit: () => void;
        onDelete: () => void;
        onSetDefault: () => void;
    }) => {
        const IconComponent = getAddressIcon(address.title);
        
        return (
            <View style={styles.addressCard}>
                <View style={styles.addressHeader}>
                    <View style={styles.addressTitleRow}>
                        <IconComponent size={20} color="#2563EB" />
                        <Text style={styles.addressTitle}>{address.title}</Text>
                        {address.is_default && (
                            <View style={styles.defaultBadge}>
                                <Star size={12} color="#F59E0B" fill="#F59E0B" />
                                <Text style={styles.defaultText}>Default</Text>
                            </View>
                        )}
                    </View>
                    <View style={styles.addressActions}>
                        <TouchableOpacity onPress={onEdit} style={styles.actionButton}>
                            <Edit size={18} color="#64748B" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={onDelete} style={styles.actionButton}>
                            <Trash2 size={18} color="#EF4444" />
                        </TouchableOpacity>
                    </View>
                </View>
                <Text style={styles.addressText}>{address.address_line}</Text>
                <Text style={styles.addressLocation}>
                    {address.city}, {address.state} - {address.pincode}
                </Text>
                {!address.is_default && (
                    <TouchableOpacity
                        onPress={onSetDefault}
                        style={styles.defaultButton}
                    >
                        <Text style={styles.defaultButtonText}>
                            Set as Default
                        </Text>
                    </TouchableOpacity>
                )}
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                        <ArrowLeft size={24} color="#1E293B" />
                    </TouchableOpacity>
                    <Text style={styles.title}>My Addresses</Text>
                    <TouchableOpacity
                        style={styles.addButton}
                        onPress={() => {
                            resetForm();
                            setShowAddForm(true);
                        }}
                    >
                        <Plus size={24} color="#2563EB" />
                    </TouchableOpacity>
                </View>

                <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                    {showAddForm && (
                        <View style={styles.formContainer}>
                            <Text style={styles.formTitle}>
                                {editingAddress ? 'Edit Address' : 'Add New Address'}
                            </Text>
                            
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Address Title</Text>
                                <TextInput
                                    style={styles.input}
                                    value={newAddress.title}
                                    onChangeText={(text) => handleInputChange('title', text)}
                                    placeholder="e.g., Home, Office, etc."
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Address</Text>
                                {/* Ensure your AddressAutocompleteProps allows these props */}
                                <AddressAutocomplete
                                    initialAddress={newAddress.address_line}
                                    onSelect={handleAddressSelect}
                                    placeholder="Search for an address"
                                />
                            </View>

                            <View style={styles.row}>
                                <View style={[styles.inputGroup, { flex: 1 }]}>
                                    <Text style={styles.label}>City</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={newAddress.city}
                                        onChangeText={(text) => handleInputChange('city', text)}
                                        placeholder="City"
                                        editable={!newAddress.location}
                                    />
                                </View>
                                <View style={[styles.inputGroup, { flex: 1, marginLeft: 12 }]}>
                                    <Text style={styles.label}>State</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={newAddress.state}
                                        onChangeText={(text) => handleInputChange('state', text)}
                                        placeholder="State"
                                        editable={!newAddress.location}
                                    />
                                </View>
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Pincode</Text>
                                <TextInput
                                    style={styles.input}
                                    value={newAddress.pincode}
                                    onChangeText={(text) => handleInputChange('pincode', text)}
                                    placeholder="Pincode"
                                    keyboardType="numeric"
                                    maxLength={6}
                                    editable={!newAddress.location}
                                />
                            </View>

                            <View style={styles.formActions}>
                                <TouchableOpacity
                                    style={styles.cancelButton}
                                    onPress={resetForm}
                                >
                                    <Text style={styles.cancelButtonText}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.saveButton, saving && styles.saveButtonDisabled]}
                                    onPress={handleSaveAddress}
                                    disabled={saving}
                                >
                                    {saving ? (
                                        <ActivityIndicator size="small" color="#FFF" />
                                    ) : (
                                        <Text style={styles.saveButtonText}>
                                            {editingAddress ? 'Update' : 'Save'}
                                        </Text>
                                    )}
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}

                    <View style={styles.addressesList}>
                        {addresses.map((address) => (
                            <AddressCard
                                key={address.id}
                                address={address}
                                onEdit={() => handleEditAddress(address)}
                                onDelete={() => handleDeleteAddress(address)}
                                onSetDefault={() => handleSetDefault(address.id)}
                            />
                        ))}

                        {addresses.length === 0 && !showAddForm && (
                            <View style={styles.emptyState}>
                                <MapPin size={48} color="#CBD5E1" />
                                <Text style={styles.emptyStateText}>No addresses saved yet</Text>
                                <Text style={styles.emptyStateSubtext}>
                                    Add your first address to get started
                                </Text>
                            </View>
                        )}
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 20,
        backgroundColor: '#FFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    backButton: {
        padding: 4,
    },
    title: {
        fontSize: 20,
        fontWeight: '600',
        color: '#1E293B',
    },
    addButton: {
        padding: 4,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 16,
    },
    loadingText: {
        marginTop: 8,
        fontSize: 16,
        color: '#64748B',
    },
    content: {
        flex: 1,
    },
    formContainer: {
        backgroundColor: '#FFF',
        margin: 20,
        borderRadius: 12,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    formTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#1E293B',
        marginBottom: 24,
    },
    inputGroup: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 8,
    },
    input: {
        height: 48,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 8,
        paddingHorizontal: 16,
        fontSize: 16,
        color: '#1E293B',
        backgroundColor: '#FFF',
    },
    row: {
        flexDirection: 'row',
    },
    formActions: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 20,
    },
    cancelButton: {
        flex: 1,
        backgroundColor: '#F1F5F9',
        borderRadius: 8,
        paddingVertical: 12,
        alignItems: 'center',
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#64748B',
    },
    saveButton: {
        flex: 1,
        backgroundColor: '#2563EB',
        borderRadius: 8,
        paddingVertical: 12,
        alignItems: 'center',
    },
    saveButtonDisabled: {
        opacity: 0.6,
    },
    saveButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFF',
    },
    addressesList: {
        padding: 20,
        paddingTop: 0,
        gap: 16,
    },
    addressCard: {
        backgroundColor: '#FFF',
        borderRadius: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    addressHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    addressTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        flex: 1,
    },
    addressTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1E293B',
    },
    defaultBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FEF3C7',
        borderRadius: 12,
        paddingHorizontal: 8,
        paddingVertical: 4,
        gap: 4,
    },
    defaultText: {
        fontSize: 10,
        fontWeight: '600',
        color: '#B45309',
    },
    addressActions: {
        flexDirection: 'row',
        gap: 8,
    },
    actionButton: {
        padding: 8,
    },
    addressText: {
        fontSize: 14,
        color: '#64748B',
        lineHeight: 20,
        marginBottom: 4,
    },
    addressLocation: {
        fontSize: 14,
        color: '#64748B',
    },
    defaultButton: {
        marginTop: 12,
        backgroundColor: '#F0FDF4',
        borderWidth: 1,
        borderColor: '#BBF7D0',
        borderRadius: 8,
        paddingVertical: 10,
        alignItems: 'center',
        alignSelf: 'flex-start',
        paddingHorizontal: 12,
    },
    defaultButtonText: {
        color: '#16A34A',
        fontSize: 12,
        fontWeight: '600',
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 60,
    },
    emptyStateText: {
        fontSize: 16,
        color: '#64748B',
        textAlign: 'center',
        marginTop: 16,
        fontWeight: '500',
    },
    emptyStateSubtext: {
        fontSize: 14,
        color: '#94A3B8',
        textAlign: 'center',
        marginTop: 8,
        marginBottom: 24,
    },
});

export default Addresses;