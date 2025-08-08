import { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { supabase } from '@/lib/supabase';
import { authService } from '@/lib/auth';
import * as ImagePicker from 'expo-image-picker';
import { decode } from 'base64-arraybuffer';
import {
  Camera,
  LogOut,
  User as UserIcon,
  ChevronRight,
  MapPin,
  CreditCard,
  Star,
  Shield,
  HelpCircle
} from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

// Helper component for menu items
const MenuItem = ({ label, icon, onPress, isDestructive = false }: any) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress}>
    <View style={styles.menuItemIcon}>{icon}</View>
    <Text style={[styles.menuText, isDestructive && styles.destructiveText]}>{label}</Text>
    {!isDestructive && <ChevronRight size={20} color="#94A3B8" />}
  </TouchableOpacity>
);

export default function AccountScreen() {
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [signingOut, setSigningOut] = useState(false); // Add new state for sign-out process
  const [user, setUser] = useState<any>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const router = useRouter();

  // This effect hook will handle the sign-out logic.
  // It runs only when the `signingOut` state changes to true.
  useEffect(() => {
    if (signingOut) {
      const performSignOut = async () => {
        const { error } = await authService.signOut();
        if (error) {
          Alert.alert("Sign Out Error", error.message);
          setSigningOut(false); // Reset on failure
        } else {
          // This ensures navigation happens after the state update
          router.replace('/(auth)/login');
        }
      };
      performSignOut();
    }
  }, [signingOut]);

  // Fetch user profile on component mount
  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      const currentUser = await authService.getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
        const { data } = await supabase
          .from('customers')
          .select('full_name, avatar_url')
          .eq('id', currentUser.id)
          .single();

        if (data?.avatar_url) {
          downloadImage(data.avatar_url);
        }
      }
      setLoading(false);
    };
    fetchProfile();
  }, []);

  const downloadImage = async (path: string) => {
    try {
      const { data, error } = await supabase.storage.from('avatars').download(path);
      if (error) throw error;
      const fr = new FileReader();
      fr.readAsDataURL(data);
      fr.onload = () => setAvatarUrl(fr.result as string);
    } catch (error) {
      console.error('Error downloading image:', error);
    }
  };

  const uploadAvatar = async () => {
    // ... (uploadAvatar function remains unchanged)
    try {
      setUploading(true);
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) return;
      
      const image = result.assets[0];
      const base64 = await fetch(image.uri).then(response => response.blob()).then(blob => {
          return new Promise((resolve, reject) => {
              const reader = new FileReader();
              reader.readAsDataURL(blob);
              reader.onloadend = () => resolve(reader.result as string);
              reader.onerror = error => reject(error);
          });
      });

      if (typeof base64 !== 'string') throw new Error("Failed to convert image to base64");

      const fileExt = image.uri.split('.').pop()?.toLowerCase() ?? 'jpeg';
      const contentType = `image/${fileExt}`;
      const filePath = `${user.id}/${new Date().getTime()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, decode(base64.split(',')[1]), { contentType, upsert: true });

      if (uploadError) throw new Error(`Direct upload failed: ${uploadError.message}`);

      const { error: updateError } = await supabase
        .from('customers')
        .update({ avatar_url: filePath })
        .eq('id', user.id);

      if (updateError) throw updateError;
      
      setAvatarUrl(image.uri);
    } catch (error) {
      if (error instanceof Error) Alert.alert('Upload Failed', error.message);
    } finally {
      setUploading(false);
    }
  };

  // Show a loading screen while loading data or signing out
  if (loading || signingOut) {
    return <ActivityIndicator style={styles.loadingIndicator} size="large" />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.profileContainer}>
          <View>
              <Image
                  source={avatarUrl ? { uri: avatarUrl } : require('@/assets/images/default-avatar.png')}
                  style={styles.avatar}
              />
              <TouchableOpacity style={styles.cameraButton} onPress={uploadAvatar} disabled={uploading}>
                  {uploading ? <ActivityIndicator size="small" color="#FFF" /> : <Camera size={18} color="#FFF" />}
              </TouchableOpacity>
          </View>
          <Text style={styles.userName}>{user?.user_metadata?.full_name || 'AquaKart User'}</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
        </View>

        <View style={styles.menuSection}>
          <MenuItem 
            label="Edit Profile"
            icon={<UserIcon size={20} color="#475569" />}
            onPress={() => router.push('/(customer)/edit-profile')}
          />
          <MenuItem 
            label="My Addresses"
            icon={<MapPin size={20} color="#475569" />}
            onPress={() => router.push('/(customer)/addresses')}
          />
          <MenuItem 
            label="Payment Methods"
            icon={<CreditCard size={20} color="#475569" />}
            onPress={() => router.push('/(customer)/payment-methods')}
          />
        </View>
        
        <View style={styles.menuSection}>
          <MenuItem 
            label="Rate Us"
            icon={<Star size={20} color="#475569" />}
            onPress={() => router.push('/(customer)/rate-us')}
          />
           <MenuItem 
            label="Support & Help"
            icon={<HelpCircle size={20} color="#475569" />}
            onPress={() => router.push('/(customer)/support')}
          />
          <MenuItem 
            label="Privacy Policy"
            icon={<Shield size={20} color="#475569" />}
            onPress={() => { /* Open privacy policy URL */ }}
          />
        </View>
        
        <View style={styles.menuSection}>
          <MenuItem 
            label="Sign Out"
            icon={<LogOut size={20} color="#EF4444" />}
            onPress={() => setSigningOut(true)} // This now only triggers the effect
            isDestructive={true}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F5F9',
  },
  loadingIndicator: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileContainer: {
    alignItems: 'center',
    paddingVertical: 24,
    backgroundColor: '#FFF',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#4F46E5',
    padding: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#FFF'
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1E293B',
    marginTop: 16,
  },
  userEmail: {
    fontSize: 16,
    color: '#64748B',
    marginTop: 4,
  },
  menuSection: {
    marginTop: 12,
    backgroundColor: '#FFF',
    borderRadius: 12,
    marginHorizontal: 16,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  menuItemIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuText: {
    flex: 1,
    marginLeft: 16,
    fontSize: 16,
    color: '#334155',
  },
  destructiveText: {
      color: '#EF4444',
      fontWeight: '600'
  }
});