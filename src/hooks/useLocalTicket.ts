import { useState, useEffect } from 'react';
import { Ticket } from '../contexts/TicketContext';

const LOCAL_TICKET_KEY = 'silvermoon_local_ticket';

export const useLocalTicket = () => {
  const [localTicket, setLocalTicket] = useState<Ticket | null>(null);

  useEffect(() => {
    // Cargar ticket del localStorage al inicializar
    const savedTicket = localStorage.getItem(LOCAL_TICKET_KEY);
    if (savedTicket) {
      try {
        const parsedTicket = JSON.parse(savedTicket);
        setLocalTicket(parsedTicket);
      } catch (error) {
        console.error('Error parsing local ticket:', error);
        localStorage.removeItem(LOCAL_TICKET_KEY);
      }
    }
  }, []);

  const saveLocalTicket = (ticket: Ticket) => {
    localStorage.setItem(LOCAL_TICKET_KEY, JSON.stringify(ticket));
    setLocalTicket(ticket);
  };

  const clearLocalTicket = () => {
    localStorage.removeItem(LOCAL_TICKET_KEY);
    setLocalTicket(null);
  };

  const hasLocalTicket = () => {
    return localTicket !== null;
  };

  return {
    localTicket,
    saveLocalTicket,
    clearLocalTicket,
    hasLocalTicket,
  };
};
