import React, { createContext, useContext, useState } from 'react';
import { supabase } from '../lib/supabase';

export interface Ticket {
  id: string;
  name: string;
  email: string;
  phone: string;
  age: number;
  eventName: string;
  eventDate: string;
  eventLocation: string;
  createdAt: string;
  checkedIn: boolean;
  checkedInAt?: string;
}

interface TicketContextType {
  tickets: Ticket[];
  addTicket: (ticket: Omit<Ticket, 'id' | 'createdAt' | 'checkedIn'>) => Promise<string>;
  getTicket: (id: string) => Promise<Ticket | null>;
  getTicketByEmail: (email: string) => Promise<Ticket | null>;
  checkInTicket: (id: string) => Promise<boolean>;
  generateTicketId: () => string;
  loading: boolean;
  error: string | null;
}

const TicketContext = createContext<TicketContextType | undefined>(undefined);

export const TicketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateTicketId = (): string => {
    return `TKT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  const addTicket = async (ticketData: Omit<Ticket, 'id' | 'createdAt' | 'checkedIn'>): Promise<string> => {
    setLoading(true);
    setError(null);

    if (!supabase) {
      const errorMessage = 'Database not connected. Please click "Connect to Supabase" in the top right corner to set up your database.';
      setError(errorMessage);
      setLoading(false);
      throw new Error(errorMessage);
    }

    try {
      // Check if ticket already exists with this email
      const existingTicket = await getTicketByEmail(ticketData.email);
      if (existingTicket) {
        setLoading(false);
        throw new Error(`EXISTING_TICKET:${existingTicket.id}`);
      }

      const ticketId = generateTicketId();
      const newTicket = {
        id: ticketId,
        name: ticketData.name,
        email: ticketData.email,
        phone: ticketData.phone,
        age: ticketData.age,
        event_name: ticketData.eventName,
        event_date: ticketData.eventDate,
        event_location: ticketData.eventLocation,
        created_at: new Date().toISOString(),
        checked_in: false,
        checked_in_at: null,
      };

      const { error: insertError } = await supabase
        .from('tickets')
        .insert([newTicket]);

      if (insertError) {
        throw new Error(`Error creating ticket: ${insertError.message}`);
      }

      // Update local state
      const ticketForState: Ticket = {
        id: newTicket.id,
        name: newTicket.name,
        email: newTicket.email,
        phone: newTicket.phone,
        age: newTicket.age,
        eventName: newTicket.event_name,
        eventDate: newTicket.event_date,
        eventLocation: newTicket.event_location,
        createdAt: newTicket.created_at,
        checkedIn: newTicket.checked_in,
        checkedInAt: newTicket.checked_in_at || undefined,
      };

      setTickets(prev => [...prev, ticketForState]);
      return ticketId;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getTicketByEmail = async (email: string): Promise<Ticket | null> => {
    if (!supabase) {
      return null;
    }

    try {
      const { data, error: fetchError } = await supabase
        .from('tickets')
        .select('*')
        .eq('email', email)
        .limit(1);

      if (fetchError) {
        throw new Error(`Error fetching ticket by email: ${fetchError.message}`);
      }

      if (!data || data.length === 0) return null;

      // Convert database format to app format
      const ticketData = data[0];
      const ticket: Ticket = {
        id: ticketData.id,
        name: ticketData.name,
        email: ticketData.email,
        phone: ticketData.phone,
        age: ticketData.age,
        eventName: ticketData.event_name,
        eventDate: ticketData.event_date,
        eventLocation: ticketData.event_location,
        createdAt: ticketData.created_at,
        checkedIn: ticketData.checked_in,
        checkedInAt: ticketData.checked_in_at || undefined,
      };

      return ticket;
    } catch (err) {
      // Don't set error state for this helper function
      return null;
    }
  };

  const getTicket = async (id: string): Promise<Ticket | null> => {
    setLoading(true);
    setError(null);

    if (!supabase) {
      const errorMessage = 'Database not connected. Please click "Connect to Supabase" in the top right corner to set up your database.';
      setError(errorMessage);
      setLoading(false);
      return null;
    }

    try {
      const { data, error: fetchError } = await supabase
        .from('tickets')
        .select('*')
        .eq('id', id)
        .limit(1);

      if (fetchError) {
        throw new Error(`Error fetching ticket: ${fetchError.message}`);
      }

      if (!data || data.length === 0) return null;

      // Convert database format to app format
      const ticketData = data[0];
      const ticket: Ticket = {
        id: ticketData.id,
        name: ticketData.name,
        email: ticketData.email,
        phone: ticketData.phone,
        age: ticketData.age,
        eventName: ticketData.event_name,
        eventDate: ticketData.event_date,
        eventLocation: ticketData.event_location,
        createdAt: ticketData.created_at,
        checkedIn: ticketData.checked_in,
        checkedInAt: ticketData.checked_in_at || undefined,
      };

      return ticket;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const checkInTicket = async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    if (!supabase) {
      setError('Database not connected. Please click "Connect to Supabase" in the top right corner to set up your database.');
      setLoading(false);
      return false;
    }

    try {
      // First check if ticket exists and is not already checked in (without using getTicket to avoid recursion)
      const { data: ticketData, error: fetchError } = await supabase
        .from('tickets')
        .select('*')
        .eq('id', id)
        .limit(1);

      if (fetchError) {
        throw new Error(`Error fetching ticket: ${fetchError.message}`);
      }

      if (!ticketData || ticketData.length === 0) {
        setError('Ticket not found');
        return false;
      }

      const ticket = ticketData[0];
      if (ticket.checked_in) {
        setError('Ticket already checked in');
        return false;
      }

      // Update check-in status in database
      const { error: updateError } = await supabase
        .from('tickets')
        .update({
          checked_in: true,
          checked_in_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (updateError) {
        throw new Error(`Error checking in ticket: ${updateError.message}`);
      }

      // Update local state
      setTickets(prev => prev.map(t =>
        t.id === id
          ? { ...t, checkedIn: true, checkedInAt: new Date().toISOString() }
          : t
      ));

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return (
    <TicketContext.Provider value={{
      tickets,
      addTicket,
      getTicket,
      getTicketByEmail,
      checkInTicket,
      generateTicketId,
      loading,
      error,
    }}>
      {children}
    </TicketContext.Provider>
  );
};

export const useTickets = () => {
  const context = useContext(TicketContext);
  if (context === undefined) {
    throw new Error('useTickets must be used within a TicketProvider');
  }
  return context;
};