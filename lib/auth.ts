import { supabase } from './supabase';
import { Alert } from 'react-native';

export interface SignUpData {
  email: string;
  password: string;
  role: 'customer' | 'vendor';
  full_name: string;
  phone_number: string;
}

export interface AuthError {
  error: string;
}

export const signUp = async ({ email, password, role, full_name, phone_number }: SignUpData): Promise<AuthError | { success: true }> => {
  try {
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signUpError) {
      return { error: signUpError.message };
    }

    const userId = data?.user?.id;
    if (!userId) {
      return { error: 'User ID not found after signup.' };
    }

    // Add user to user_roles
    const { error: roleError } = await supabase.from('user_roles').insert([
      {
        user_id: userId,
        role,
      },
    ]);

    if (roleError) {
      return { error: roleError.message };
    }

    if (role === 'customer') {
      const { error: customerError } = await supabase.from('customers').insert([
        {
          id: userId,
          full_name,
          phone_number,
        },
      ]);
      if (customerError) {
        return { error: customerError.message };
      }
    } else if (role === 'vendor') {
      const { error: vendorError } = await supabase.from('vendors').insert([
        {
          id: userId,
          full_name,
          phone_number,
        },
      ]);
      if (vendorError) {
        return { error: vendorError.message };
      }
    }

    return { success: true };
  } catch (err) {
    console.error('Unexpected signup error:', err);
    return { error: 'Unexpected signup error' };
  }
};

const getCurrentUser = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) {
      console.error('Error getting user:', error.message);
      return null;
    }

    if (!user) {
      return null;
    }

    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (roleError) {
      console.error('Error fetching user role:', roleError.message);
    }

    return {
      ...user,
      role: roleData?.role || null,
    };
  } catch (err) {
    console.error('Unexpected error in getCurrentUser:', err);
    return null;
  }
};

const signInWithEmail = async (email: string, password: string) => {
  try {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return { success: true };
  } catch (error) {
    return { success: false, error };
  }
};

const sendOTP = async (phone: string) => {
  try {
    const { error } = await supabase.auth.signInWithOtp({ phone });
    if (error) throw error;
    return { success: true };
  } catch (error) {
    return { success: false, error };
  }
};

const verifyOTP = async (phone: string, token: string) => {
  try {
    const { error } = await supabase.auth.verifyOtp({ phone, token, type: 'sms' });
    if (error) throw error;
    return { success: true };
  } catch (error) {
    return { success: false, error };
  }
};

const resetPassword = async (email: string) => {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;
    return { success: true };
  } catch (error) {
    return { success: false, error };
  }
};

export const authService = {
  signUp,
  getCurrentUser,
  signInWithEmail,
  sendOTP,
  verifyOTP,
  resetPassword,
};
