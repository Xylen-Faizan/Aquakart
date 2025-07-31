import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  ScrollView,
  FlatList,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  User as UserIcon,
  Pencil,
  MapPin,
  CreditCard,
  ListChecks,
  Gift,
  Star,
  LifeBuoy,
  LogOut,
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '@/lib/supabase';
import AddressManager from '@/components/AddressManager';

interface AppUser {
  id: string;
  email?: string;
  user_metadata: { [key: string]: any };
}

interface OptionItem {
  id: string;
  title: string;
  icon: React.ReactNode;
  route?: string; // internal route to navigate to
  action?: () => void; // optional side-effect action
}

export default function AccountScreen() {
  const router = useRouter();

  const [user, setUser] = useState<AppUser | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        Alert.alert('Error', 'Could not fetch user data.');
        console.error('Fetch user error:', error.message);
      } else if (data.user) {
        const appUser = data.user as AppUser;
        setUser(appUser);
        if (appUser.user_metadata?.avatar_url) {
          downloadImage(appUser.user_metadata.avatar_url);
        }
      }
      setInitialLoading(false);
    };
    fetchUser();
  }, []);

  const downloadImage = async (path: string) => {
    try {
      const { data, error } = await supabase.storage.from('avatars').download(path);
      if (error) throw error;
      const fr = new FileReader();
      fr.readAsDataURL(data);
      fr.onload = () => {
        setAvatarUrl(fr.result as string);
      };
    } catch (error) {
      console.error('Error downloading image:', (error as Error).message);
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Sorry, we need camera roll permissions to make this work!');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      uploadAvatar(result.assets[0].uri);
    }
  };

  const uploadAvatar = async (uri: string) => {
    try {
      console.log('Starting avatar upload process...');
      setLoading(true);
      
      if (!user) {
        throw new Error('User not found. Please sign in again.');
      }

      // 1. First check if we can reach Supabase
      try {
        console.log('Checking Supabase connection...');
        const { data: health, error: healthError } = await supabase.rpc('health');
        if (healthError) throw healthError;
        console.log('Supabase connection successful');
      } catch (healthError) {
        console.error('Supabase connection check failed:', healthError);
        throw new Error('Cannot connect to the server. Please check your internet connection.');
      }

      // 2. Process the image
      console.log('Processing image...');
      let blob: Blob;
      try {
        const response = await fetch(uri);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        blob = await response.blob();
        console.log('Image processed successfully');
      } catch (imgError) {
        console.error('Image processing error:', imgError);
        throw new Error('Failed to process the selected image. Please try another image.');
      }

      // 3. Prepare file details
      const fileExt = uri.split('.').pop() || 'jpg';
      const fileName = `${user.id}_${Date.now()}.${fileExt}`;
      const filePath = `public/${user.id}/${fileName}`;
      
      console.log('Uploading to storage...');
      console.log('File details:', { fileExt, fileName, filePath, size: blob.size });

      // 4. Upload to storage with detailed error handling
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, blob, { 
          cacheControl: '3600',
          upsert: true,
          contentType: `image/${fileExt === 'jpg' ? 'jpeg' : fileExt}`
        });

      if (uploadError) {
        console.error('Storage upload error:', {
          message: uploadError.message,
          name: uploadError.name
        });
        
        if (uploadError.message.includes('The resource already exists')) {
          throw new Error('This image already exists. Please try a different image.');
        } else if (uploadError.message.includes('not found')) {
          throw new Error('Storage bucket not found. Please contact support.');
        } else if (uploadError.message.includes('size')) {
          throw new Error('Image is too large. Please select an image smaller than 5MB.');
        } else {
          throw new Error(`Upload failed: ${uploadError.message}`);
        }
      }

      console.log('Upload successful, getting public URL...');
      
      // 5. Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      console.log('Updating user profile with new avatar...');
      
      // 6. Update user metadata
      const { error: updateUserError } = await supabase.auth.updateUser({ 
        data: { 
          avatar_url: publicUrl,
          updated_at: new Date().toISOString()
        } 
      });

      if (updateUserError) {
        console.error('User update error:', updateUserError);
        throw new Error('Failed to update profile. Please try again.');
      }

      console.log('Profile update successful');
      
      // 7. Update local state
      setAvatarUrl(publicUrl);
      Alert.alert('Success', 'Profile picture updated successfully!');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      console.error('Upload avatar error:', error);
      Alert.alert('Upload Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const optionItems: OptionItem[] = [
    {
      id: 'edit-profile',
      title: 'Edit Profile',
      icon: <Pencil size={20} color="#2563EB" />,
      route: 'edit-profile',
    },
    {
      id: 'payment-methods',
      title: 'Payment Methods',
      icon: <CreditCard size={20} color="#2563EB" />,
      route: 'payment-methods',
    },
    {
      id: 'subscription-plans',
      title: 'Subscription Plans',
      icon: <ListChecks size={20} color="#2563EB" />,
      route: 'subscription-plans',
    },
    {
      id: 'refer-earn',
      title: 'Refer & Earn',
      icon: <Gift size={20} color="#2563EB" />,
      route: 'refer-earn',
    },
    {
      id: 'rate-us',
      title: 'Rate Us',
      icon: <Star size={20} color="#2563EB" />,
      route: 'rate-us',
    },
    {
      id: 'support',
      title: 'Support',
      icon: <LifeBuoy size={20} color="#2563EB" />,
      route: 'support',
    },
    {
      id: 'logout',
      title: 'Logout',
      icon: <LogOut size={20} color="#EF4444" />,
      action: async () => {
        await supabase.auth.signOut();
        router.replace('/');
      },
    },
  ];

  const renderOption = ({ item }: { item: OptionItem; index: number }) => {
    const handlePress = () => {
      if (item.route) {
        // Use the router with the correct type for the route
        router.push(item.route as any);
      }
      if (item.action) item.action();
    };

    return (
      <TouchableOpacity
        style={styles.optionRow}
        onPress={handlePress}
      >
        <View style={styles.optionIcon}>{item.icon}</View>
        <Text style={styles.optionTitle}>{item.title}</Text>
      </TouchableOpacity>
    );
  };

  if (initialLoading) {
    return (
      <SafeAreaView style={styles.containerCentered}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </SafeAreaView>
    );
  }

  // Define section types for type safety
  type SectionType = 'profile' | 'addresses' | 'options';
  
  interface SectionItem {
    section: {
      type: SectionType;
      data: (AppUser | OptionItem | null)[];
      renderItem: (info: { item: AppUser | OptionItem | null; index: number }) => React.ReactNode;
    };
    item: AppUser | OptionItem | null;
    key: string;
  }

  // Combine all sections into a single FlatList
  const sections = [
    {
      type: 'profile' as const,
      data: [user],
      renderItem: () => (
        <View style={styles.profileContainer}>
          <TouchableOpacity onPress={pickImage} disabled={loading}>
            {avatarUrl ? (
              <Image source={{ uri: avatarUrl }} style={styles.avatar} />
            ) : (
              <UserIcon size={80} color="#6B7280" />
            )}
          </TouchableOpacity>
          <Text style={styles.email}>{user?.email || 'Loading...'}</Text>
        </View>
      ),
    },
    {
      type: 'addresses' as const,
      data: [null], // Single item for the AddressManager
      renderItem: () => <AddressManager />,
    },
    {
      type: 'options' as const,
      data: optionItems,
      renderItem: renderOption,
    },
  ];

  // Render a section header if needed
  const renderSectionHeader = (section: { type: SectionType }) => {
    if (section.type === 'options') {
      return (
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionHeaderText}>Account Options</Text>
        </View>
      );
    }
    return null;
  };

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={sections.flatMap((section) =>
          section.data.map((item, index) => ({
            section: section as SectionItem['section'],
            item,
            key: `${section.type}-${index}`,
          }))
        )}
        renderItem={({ item }: { item: SectionItem }) => {
          const { section, item: sectionItem } = item;
          return (
            <View>
              {section.type === 'options' && renderSectionHeader(section)}
              {section.renderItem({ item: sectionItem, index: 0 })}
            </View>
          );
        }}
        keyExtractor={(item: SectionItem) => item.key}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  containerCentered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  contentContainer: {
    paddingBottom: 20,
  },
  profileContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 12,
  },
  email: {
    fontSize: 16,
    color: '#1F2937',
  },
  sectionHeader: {
    padding: 16,
    backgroundColor: '#F8FAFC',
  },
  sectionHeaderText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  optionsList: {
    paddingTop: 0,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  optionIcon: {
    marginRight: 16,
  },
  optionTitle: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '500',
  }
});
