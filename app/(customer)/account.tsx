import { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import { supabase } from '@/lib/supabase';
import { authService } from '@/lib/auth';
import * as ImagePicker from 'expo-image-picker';
import { decode } from 'base64-arraybuffer';
import { Camera, Edit3, LogOut, User as UserIcon } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

export default function AccountScreen() {
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      const currentUser = await authService.getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
        // Fetch profile data, including avatar_url
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
      fr.onload = () => {
        setAvatarUrl(fr.result as string);
      };
    } catch (error) {
      console.error('Error downloading image:', error);
    }
  };

  const uploadAvatar = async () => {
    try {
      setUploading(true);

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return;
      }
      
      const image = result.assets[0];
      const base64 = await fetch(image.uri).then(response => response.blob()).then(blob => {
          return new Promise((resolve, reject) => {
              const reader = new FileReader();
              reader.readAsDataURL(blob);
              reader.onloadend = () => resolve(reader.result as string);
              reader.onerror = error => reject(error);
          });
      });

      if (typeof base64 !== 'string') {
        throw new Error("Failed to convert image to base64");
      }

      const fileExt = image.uri.split('.').pop()?.toLowerCase() ?? 'jpeg';
      const contentType = `image/${fileExt}`;

      // --- THIS IS THE KEY FIX ---
      // We create a unique file path using the user's ID and the current time.
      // This ensures the file is uploaded to a path like: `[user_id]/[timestamp].jpg`
      // This path format satisfies the security policy you created.
      const filePath = `${user.id}/${new Date().getTime()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, decode(base64.split(',')[1]), { contentType, upsert: true });

      if (uploadError) {
        throw new Error(`Direct upload failed: ${uploadError.message}`);
      }

      // Update the 'customers' table with the new avatar path
      const { error: updateError } = await supabase
        .from('customers')
        .update({ avatar_url: filePath })
        .eq('id', user.id);

      if (updateError) throw updateError;
      
      // Refresh the avatar on screen
      setAvatarUrl(image.uri);

    } catch (error) {
      if (error instanceof Error) {
        console.error('Upload avatar error:', error);
        Alert.alert('Upload Failed', error.message);
      }
    } finally {
      setUploading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.replace('/(auth)/login');
  };
  
  if (loading) {
    return <ActivityIndicator style={styles.loadingIndicator} size="large" />;
  }

  return (
    <SafeAreaView style={styles.container}>
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

      <View style={styles.menuContainer}>
          <TouchableOpacity style={styles.menuItem}>
              <UserIcon size={20} color="#475569" />
              <Text style={styles.menuText}>Edit Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={handleSignOut}>
              <LogOut size={20} color="#EF4444" />
              <Text style={[styles.menuText, {color: '#EF4444'}]}>Sign Out</Text>
          </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingIndicator: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileContainer: {
    alignItems: 'center',
    paddingVertical: 32,
    backgroundColor: '#FFF',
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#4F46E5',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: '#4F46E5',
    padding: 8,
    borderRadius: 16,
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
  menuContainer: {
    marginTop: 24,
    marginHorizontal: 16,
    backgroundColor: '#FFF',
    borderRadius: 12,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  menuText: {
    marginLeft: 16,
    fontSize: 16,
    color: '#334155',
  },
});