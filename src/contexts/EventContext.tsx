import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface EventInfo {
  id?: string;
  name: string;
  date: string;
  time: string;
  location: string;
  description: string;
  logoUrl?: string;
}

interface EventContextType {
  eventInfo: EventInfo | null;
  updateEventInfo: (info: Omit<EventInfo, 'id'>) => Promise<boolean>;
  uploadLogo: (file: File) => Promise<string | null>;
  loading: boolean;
  error: string | null;
}

const EventContext = createContext<EventContextType | undefined>(undefined);

export const EventProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [eventInfo, setEventInfo] = useState<EventInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadEventInfo();
  }, []);

  const loadEventInfo = async () => {
    if (!supabase) {
      // Fallback to localStorage if Supabase is not available
      const savedEventInfo = localStorage.getItem('eventInfo');
      if (savedEventInfo) {
        try {
          const parsed = JSON.parse(savedEventInfo);
          setEventInfo(parsed);
        } catch (error) {
          console.error('Error parsing saved event info:', error);
        }
      }
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('event_settings')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(1)
        .single();

      if (fetchError) {
        if (fetchError.code === 'PGRST116') {
          // No rows found, create default event settings in database
          const defaultData = {
            name: 'Conferencia Tech 2025',
            date: '2025-03-15',
            time: '9:00 AM',
            location: 'Centro de Convenciones Ciudad',
            description: 'Una conferencia sobre las últimas tendencias en tecnología'
          };

          const success = await updateEventInfo(defaultData);
          if (success) {
            // The updateEventInfo will set the eventInfo state
            return;
          } else {
            // If insert fails, leave eventInfo as null
            setEventInfo(null);
          }
        } else {
          throw fetchError;
        }
      } else if (data) {
        const eventData: EventInfo = {
          id: data.id,
          name: data.name,
          date: data.date,
          time: data.time,
          location: data.location,
          description: data.description || '',
          logoUrl: data.logo_url || undefined
        };
        setEventInfo(eventData);
      }
    } catch (err) {
      console.error('Error loading event info:', err);
      setError(err instanceof Error ? err.message : 'Error loading event info');

      // Fallback to localStorage
      const savedEventInfo = localStorage.getItem('eventInfo');
      if (savedEventInfo) {
        try {
          const parsed = JSON.parse(savedEventInfo);
          setEventInfo(parsed);
        } catch (parseError) {
          console.error('Error parsing saved event info:', parseError);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const updateEventInfo = async (info: Omit<EventInfo, 'id'>): Promise<boolean> => {
    setLoading(true);
    setError(null);

    if (!supabase) {
      // Fallback to localStorage if Supabase is not available
      const newEventInfo = { ...info };
      setEventInfo(newEventInfo);
      localStorage.setItem('eventInfo', JSON.stringify(newEventInfo));
      setLoading(false);
      return true;
    }

    try {
      const updateData = {
        name: info.name,
        date: info.date,
        time: info.time,
        location: info.location,
        description: info.description,
        logo_url: info.logoUrl || null,
        updated_at: new Date().toISOString()
      };

      let result;

      if (eventInfo?.id) {
        // Update existing record
        result = await supabase
          .from('event_settings')
          .update(updateData)
          .eq('id', eventInfo!.id)
          .select()
          .single();
      } else {
        // Insert new record
        result = await supabase
          .from('event_settings')
          .insert([updateData])
          .select()
          .single();
      }

      if (result.error) {
        throw result.error;
      }

      if (result.data) {
        const updatedEventInfo: EventInfo = {
          id: result.data.id,
          name: result.data.name,
          date: result.data.date,
          time: result.data.time,
          location: result.data.location,
          description: result.data.description || '',
          logoUrl: result.data.logo_url || undefined
        };

        setEventInfo(updatedEventInfo);
        localStorage.setItem('eventInfo', JSON.stringify(updatedEventInfo));
      }

      return true;
    } catch (err) {
      console.error('Error updating event info:', err);
      setError(err instanceof Error ? err.message : 'Error updating event info');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const uploadLogo = async (file: File): Promise<string | null> => {
    if (!supabase) {
      setError('Database not connected. Logo upload requires Supabase connection.');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        throw new Error('Please select a valid image file');
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('Image size must be less than 5MB');
      }

      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `event-logo-${Date.now()}.${fileExt}`;

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('event-assets')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('event-assets')
        .getPublicUrl(fileName);

      return urlData.publicUrl;
    } catch (err) {
      console.error('Error uploading logo:', err);
      setError(err instanceof Error ? err.message : 'Error uploading logo');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return (
    <EventContext.Provider value={{
      eventInfo,
      updateEventInfo,
      uploadLogo,
      loading,
      error
    }}>
      {children}
    </EventContext.Provider>
  );
};

export const useEvent = () => {
  const context = useContext(EventContext);
  if (context === undefined) {
    throw new Error('useEvent must be used within an EventProvider');
  }
  return context;
};