import { supabase } from './supabase';
import { Alert } from 'react-native';

// Simplified sign-up function
export const signUp = async (signUpData: any) => {
  const { email, password, role, fullName, phone } = signUpData;
  const { data: authData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        phone: phone,
      },
    },
  });

  if (signUpError) return { success: false, error: signUpError };
  if (!authData.user) return { success: false, error: { message: 'Signup succeeded but no user was returned.' } };

  // Insert into the public customers table
  const { error: profileError } = await supabase
    .from('customers')
    .insert({ id: authData.user.id, full_name: fullName, phone_number: phone, email: email });

  if (profileError) return { success: false, error: profileError };
    
  // Insert into user_roles table
  const { error: roleError } = await supabase
    .from('user_roles')
    .insert({ user_id: authData.user.id, role: role });
    
  if (roleError) return { success: false, error: roleError };

  return { success: true, data: authData };
};

// Simplified user fetch function
const getCurrentUser = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      console.error('Error getting user:', error.message);
      return null;
    }
    
    if (!user) return null;

    // Fetch the user's role
    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (roleError) {
      console.error('Error fetching user role:', roleError);
      return { ...user, role: 'customer' }; // Default to customer role
    }

    // Include the role in the user object
    const userWithRole = {
      ...user,
      role: roleData?.role || 'customer'
    };

    return userWithRole;
  } catch (error) {
    console.error('Unexpected error in getCurrentUser:', error);
    return null;
  }
};

// Generate a unique guest user ID
const generateGuestId = () => {
  return `guest_${Math.random().toString(36).substring(2, 15)}`;
};

export const authService = {
  getCurrentUser,
  signInAsGuest: async () => {
    // Create a guest user object with a unique ID
    const guestId = generateGuestId();
    const guestUser = {
      id: guestId,
      email: null,
      role: 'guest',
      isGuest: true
    };
    
    // In a real app, you might want to store the guest user in AsyncStorage or similar
    // For now, we'll just return the guest user object
    return { data: { user: guestUser, session: null }, error: null };
  },
  signInWithEmail: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error) return { data: null, error };
    if (!data.user) return { data: null, error: { message: 'No user returned from sign in' } };
    
    // Fetch the user's role
    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', data.user.id)
      .single();
    
    if (roleError) {
      console.error('Error fetching user role:', roleError);
      return { data: { ...data, role: 'customer' }, error: null }; // Default to customer role
    }
    
    // Include the role in the user's user_metadata
    const updatedUser = {
      ...data.user,
      role: roleData?.role || 'customer'
    };
    
    return { 
      data: { 
        ...data, 
        user: updatedUser 
      }, 
      error: null 
    };
  },
  signUp,
  signOut: async () => {
    return await supabase.auth.signOut();
  },
};

export const showAuthError = (error: any) => {
  Alert.alert('Authentication Error', error.message || 'An unknown error occurred.');
};
