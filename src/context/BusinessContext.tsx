import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured, SALON_DEFAULT_PHONE, ADMIN_EMAIL } from '../lib/supabase';
import type { BusinessSettings } from '../types/database';

const DEFAULT_SETTINGS: BusinessSettings = {
  id: 'default',
  salon_name: 'Mikkys Barbing Salon',
  salon_phone: SALON_DEFAULT_PHONE,
  admin_email: ADMIN_EMAIL,
  description: 'Master barbering, precision fades, and bespoke beard grooming. Step into a world of sharp craft.',
  address: '',
  opening_hours: 'Monday – Saturday: 9:00 AM – 8:00 PM · Sunday: 1:00 PM – 7:00 PM',
  currency_symbol: '₦',
  currency_code: 'NGN',
};

interface BusinessContextType {
  settings: BusinessSettings;
  loading: boolean;
  updateSettings: (newSettings: Partial<BusinessSettings>) => Promise<{ error: Error | null }>;
  refreshSettings: () => Promise<void>;
}

const BusinessContext = createContext<BusinessContextType | undefined>(undefined);

export const BusinessProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<BusinessSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchSettings = async () => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('business_settings')
        .select('*')
        .eq('id', 'default')
        .maybeSingle();

      if (error) {
        console.warn('Could not load business settings, using defaults:', error.message);
      } else if (data) {
        setSettings({
          ...DEFAULT_SETTINGS,
          ...data,
        });
      }
    } catch (err) {
      console.error('Error loading business settings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const updateSettings = async (newSettings: Partial<BusinessSettings>) => {
    if (!isSupabaseConfigured) {
      return { error: new Error('Supabase is not configured.') };
    }

    try {
      const payload = {
        ...newSettings,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('business_settings')
        .upsert({ id: 'default', ...payload })
        .select()
        .single();

      if (error) throw error;
      if (data) {
        setSettings(data as BusinessSettings);
      }
      return { error: null };
    } catch (err: any) {
      return { error: new Error(err.message || 'Failed to update business settings.') };
    }
  };

  return (
    <BusinessContext.Provider
      value={{
        settings,
        loading,
        updateSettings,
        refreshSettings: fetchSettings,
      }}
    >
      {children}
    </BusinessContext.Provider>
  );
};

export const useBusiness = () => {
  const context = useContext(BusinessContext);
  if (!context) {
    throw new Error('useBusiness must be used within a BusinessProvider');
  }
  return context;
};
