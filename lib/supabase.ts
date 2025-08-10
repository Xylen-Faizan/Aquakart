import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Custom storage adapter for AsyncStorage
const storageAdapter = {
  async getItem(key: string) {
    const value = await AsyncStorage.getItem(key);
    return value;
  },
  async setItem(key: string, value: string) {
    await AsyncStorage.setItem(key, value);
  },
  async removeItem(key: string) {
    await AsyncStorage.removeItem(key);
  },
};

// Polyfill for structuredClone if not available
if (typeof global.structuredClone === 'undefined') {
  global.structuredClone = (obj: any) => JSON.parse(JSON.stringify(obj));
}

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: storageAdapter, // Use the custom adapter
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});