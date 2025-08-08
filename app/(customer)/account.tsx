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
  Leaf,
  TrendingUp,
  Award,
  Zap,
  Target,
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '@/lib/supabase';
import AddressManager from '@/components/AddressManager';
import EcoPointsService from '@/src/services/eco-points';

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

interface EcoStats {
  totalPoints: number;
  level: number;
  pointsToNextLevel: number;
  totalCO2Saved: number;
  totalWaterSaved: number;
  totalPlasticSaved: number;
  streakDays: number;
  actionsCompleted: number;
  lastActionDate?: Date;
}

export default function AccountScreen() {
  const router = useRouter();

  const [user, setUser] = useState<AppUser | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [ecoStats, setEcoStats] = useState<EcoStats | null>(null);
  const [showEcoPoints, setShowEcoPoints] = useState(false);

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
        // Fetch eco stats
        fetchEcoStats();
      }
      setInitialLoading(false);
    };
    fetchUser();
  }, []);

  const fetchEcoStats = async () => {
    try {
      if (user?.id && EcoPointsService) {
        const stats = await EcoPointsService.getUserEcoStats(user.id);
        setEcoStats(stats);
      } else {
        // Set default stats if service is not available
        setEcoStats({
          totalPoints: 0,
          level: 1,
          pointsToNextLevel: 500,
          totalCO2Saved: 0,
          totalWaterSaved: 0,
          totalPlasticSaved: 0,
          streakDays: 0,
          actionsCompleted: 0,
        });
      }
    } catch (error) {
      console.error('Error fetching eco stats:', error);
      // Set default stats if there's an error
      setEcoStats({
        totalPoints: 0,
        level: 1,
        pointsToNextLevel: 500,
        totalCO2Saved: 0,
        totalWaterSaved: 0,
        totalPlasticSaved: 0,
        streakDays: 0,
        actionsCompleted: 0,
      });
    }
  };

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

    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8, // Slightly reduced quality for better performance
        base64: false,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedAsset = result.assets[0];
        console.log('Selected image:', {
          uri: selectedAsset.uri,
          width: selectedAsset.width,
          height: selectedAsset.height,
          type: selectedAsset.type,
        });
        await uploadAvatar(selectedAsset.uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const uploadAvatar = async (uri: string) => {
    try {
      console.log('Starting avatar upload process...');
      setLoading(true);
      
      if (!user) {
        throw new Error('User not found. Please sign in again.');
      }

      // Get file extension from URI
      const fileExt = uri.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `${user.id}_${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;
      
      console.log('Preparing file upload...', {
        uri: uri.substring(0, 50) + '...',
        fileName,
        filePath
      });

      // Get Supabase URL and key
      const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseKey) {
        throw new Error('Missing Supabase configuration. Please check your environment variables.');
      }

      // First, try to upload using the Supabase client
      try {
        console.log('Trying Supabase client upload...');
        
        // Read the file as base64
        const response = await fetch(uri);
        const blob = await response.blob();
        
        const { data, error } = await supabase.storage
          .from('avatars')
          .upload(filePath, blob, {
            cacheControl: '3600',
            upsert: true,
            contentType: `image/${fileExt}`,
          });

        if (error) throw error;
        
        console.log('Supabase upload successful:', data);
        
        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath);
          
        console.log('Generated public URL:', publicUrl);
        
        // Update user metadata with the new avatar URL
        console.log('Updating user profile with new avatar...');
        
        const { error: updateUserError } = await supabase.auth.updateUser({ 
          data: { 
            avatar_url: publicUrl,
            updated_at: new Date().toISOString()
          } 
        });

        if (updateUserError) throw updateUserError;

        console.log('Profile update successful');
        
        // Update local state
        setAvatarUrl(publicUrl);
        Alert.alert('Success', 'Profile picture updated successfully!');
        
      } catch (supabaseError) {
        console.warn('Supabase client upload failed, trying direct upload...', supabaseError);
        
        // If Supabase client fails, try direct upload
        const formData = new FormData();
        formData.append('file', {
          uri,
          name: fileName,
          type: `image/${fileExt}`,
        } as any);
        
        const uploadUrl = `${supabaseUrl}/storage/v1/object/avatars/${filePath}`;
        console.log('Uploading to:', uploadUrl);
        
        const response = await fetch(uploadUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'multipart/form-data',
          },
          body: formData,
        });
        
        const result = await response.json();
        
        if (!response.ok) {
          console.error('Direct upload failed:', result);
          throw new Error(result.error?.message || 'Failed to upload image');
        }
        
        console.log('Direct upload successful:', result);
        
        // Get public URL
        const publicUrl = `${supabaseUrl}/storage/v1/object/public/avatars/${filePath}`;
        console.log('Generated public URL:', publicUrl);
        
        // Update user metadata with the new avatar URL
        console.log('Updating user profile with new avatar...');
        
        const { error: updateUserError } = await supabase.auth.updateUser({ 
          data: { 
            avatar_url: publicUrl,
            updated_at: new Date().toISOString()
          } 
        });

        if (updateUserError) throw updateUserError;

        console.log('Profile update successful');
        
        // Update local state
        setAvatarUrl(publicUrl);
        Alert.alert('Success', 'Profile picture updated successfully!');
      }
      
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
      id: 'eco-points',
      title: 'Eco Points',
      icon: <Leaf size={20} color="#10B981" />,
      action: () => setShowEcoPoints(!showEcoPoints),
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
  type SectionType = 'profile' | 'addresses' | 'options' | 'eco-points';
  
  interface SectionItem {
    section: {
      type: SectionType;
      data: (AppUser | OptionItem | null)[];
      renderItem: (info: { item: AppUser | OptionItem | null; index: number }) => React.ReactNode;
    };
    item: AppUser | OptionItem | null;
    key: string;
  }

  const renderEcoPointsSection = () => {
    if (!ecoStats) {
      return (
        <View style={styles.ecoPointsContainer}>
          <ActivityIndicator size="small" color="#10B981" />
        </View>
      );
    }

    return (
      <View style={styles.ecoPointsContainer}>
        <View style={styles.ecoPointsHeader}>
          <View style={styles.ecoPointsTitleRow}>
            <Leaf size={24} color="#10B981" />
            <Text style={styles.ecoPointsTitle}>Eco Points</Text>
          </View>
          <View style={styles.ecoPointsBadge}>
            <Text style={styles.ecoPointsNumber}>{ecoStats.totalPoints}</Text>
          </View>
        </View>

        {/* Level Progress */}
        <View style={styles.levelContainer}>
          <View style={styles.levelInfo}>
            <Text style={styles.levelText}>Level {ecoStats.level}</Text>
            <Text style={styles.levelSubtext}>Environmental Champion</Text>
          </View>
          <View style={styles.levelProgress}>
            <View style={styles.progressBar}>
                              <View 
                  style={[
                    styles.progressFill, 
                    { width: `${Math.min((ecoStats.totalPoints % 500) / 500 * 100, 100)}%` }
                  ]} 
                />
            </View>
                          <Text style={styles.progressText}>
                {ecoStats.totalPoints % 500}/500 to next level
              </Text>
          </View>
        </View>

        {/* Environmental Impact */}
        <View style={styles.impactContainer}>
          <Text style={styles.impactTitle}>Your Environmental Impact</Text>
          <View style={styles.impactGrid}>
            <View style={styles.impactItem}>
              <TrendingUp size={20} color="#10B981" />
              <Text style={styles.impactValue}>{ecoStats.totalCO2Saved.toFixed(1)}</Text>
              <Text style={styles.impactLabel}>kg CO₂ Saved</Text>
            </View>
            <View style={styles.impactItem}>
              <Zap size={20} color="#3B82F6" />
              <Text style={styles.impactValue}>{ecoStats.totalWaterSaved.toFixed(1)}</Text>
              <Text style={styles.impactLabel}>L Water Saved</Text>
            </View>
            <View style={styles.impactItem}>
              <Target size={20} color="#F59E0B" />
              <Text style={styles.impactValue}>{ecoStats.totalPlasticSaved.toFixed(1)}</Text>
              <Text style={styles.impactLabel}>kg Plastic Saved</Text>
            </View>
          </View>
        </View>

        {/* Streak */}
        <View style={styles.streakContainer}>
          <View style={styles.streakInfo}>
            <Award size={20} color="#F59E0B" />
            <Text style={styles.streakText}>{ecoStats.streakDays} Day Streak</Text>
          </View>
          <Text style={styles.streakSubtext}>Keep going! Consistency matters.</Text>
        </View>
      </View>
    );
  };

  // Combine all sections into a single FlatList
  const sections = [
    {
      type: 'profile' as const,
      data: [user],
      renderItem: () => {
        // Get the username from user_metadata or fallback to email
        const username = user?.user_metadata?.full_name || 
                        user?.user_metadata?.name || 
                        user?.email?.split('@')[0] || 
                        'User';
                        
        return (
          <View style={styles.profileContainer}>
            <View style={styles.avatarContainer}>
              <TouchableOpacity 
                onPress={pickImage} 
                disabled={loading}
                style={styles.avatarButton}
              >
                {avatarUrl ? (
                  <Image source={{ uri: avatarUrl }} style={styles.avatar} />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <UserIcon size={60} color="#6B7280" />
                  </View>
                )}
                <View style={styles.cameraIconContainer}>
                  <View style={styles.cameraIconBackground}>
                    <Pencil size={16} color="white" />
                  </View>
                </View>
              </TouchableOpacity>
            </View>
            <Text style={styles.username}>{username}</Text>
          </View>
        );
      },
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
    // Eco Points section (conditionally rendered)
    ...(showEcoPoints ? [{
      type: 'eco-points' as const,
      data: [null],
      renderItem: () => renderEcoPointsSection(),
    }] : []),
  ];

  // Section header rendering (currently unused, kept for future use)
  const renderSectionHeader = (section: { type: SectionType }) => {
    // No section headers needed as per design requirements
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
  username: {
    fontSize: 20,
    color: '#1F2937',
    fontWeight: '600',
    marginTop: 8,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  avatarButton: {
    position: 'relative',
    alignSelf: 'center',
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraIconContainer: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 2,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  cameraIconBackground: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
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
  },
  // Eco Points Styles
  ecoPointsContainer: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  ecoPointsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  ecoPointsTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ecoPointsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  ecoPointsBadge: {
    backgroundColor: '#10B981',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  ecoPointsNumber: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  levelContainer: {
    marginBottom: 20,
  },
  levelInfo: {
    marginBottom: 8,
  },
  levelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  levelSubtext: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  levelProgress: {
    marginTop: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10B981',
  },
  progressText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  impactContainer: {
    marginBottom: 20,
  },
  impactTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  impactGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  impactItem: {
    alignItems: 'center',
    flex: 1,
  },
  impactValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 4,
  },
  impactLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
    textAlign: 'center',
  },
  streakContainer: {
    backgroundColor: '#FEF3C7',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  streakInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  streakText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#92400E',
  },
  streakSubtext: {
    fontSize: 12,
    color: '#92400E',
  },
});
