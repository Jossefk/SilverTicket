import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, User, Mail, Phone, Ticket, Hash } from 'lucide-react';
import { useTickets } from '../contexts/TicketContext';
import { useEvent } from '../contexts/EventContext';

const TicketForm: React.FC = () => {
  const navigate = useNavigate();
  const { addTicket } = useTickets();
  const { eventInfo } = useEvent();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    age: '',
    eventName: eventInfo?.name || '',
    eventDate: eventInfo?.date || '',
    eventLocation: eventInfo?.location || '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Update form data when eventInfo changes (loaded from database)
  useEffect(() => {
    if (eventInfo) {
      setFormData(prev => ({
        ...prev,
        eventName: eventInfo.name,
        eventDate: eventInfo.date,
        eventLocation: eventInfo.location,
      }));
    }
  }, [eventInfo]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const age = parseInt(formData.age, 10);
      
      // Validate age
      if (isNaN(age) || age < 1 || age > 120) {
        setError('Por favor ingresa una edad válida (1-120 años)');
        return;
      }
      
      const ticketData = {
        ...formData,
        age: age
      };
      const ticketId = await addTicket(ticketData);
      navigate(`/ticket/${ticketId}`);
    } catch (error) {
      if (error instanceof Error) {
        // Check if it's an existing ticket error
        if (error.message.startsWith('EXISTING_TICKET:')) {
          const existingTicketId = error.message.split(':')[1];
          navigate(`/ticket/${existingTicketId}`);
          return;
        }
        setError(error.message);
      } else {
        setError('Error creating ticket');
      }
      console.error('Error creating ticket:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-6 sm:mb-8">
        {eventInfo?.logoUrl ? (
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-full shadow-lg flex items-center justify-center mx-auto mb-4 overflow-hidden border-4 border-blue-100">
            <img 
              src={eventInfo.logoUrl} 
              alt="Logo del evento" 
              className="w-full h-full object-contain"
            />
          </div>
        ) : (
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-full shadow-lg flex items-center justify-center mx-auto mb-4 overflow-hidden border-4 border-blue-100">
            <img 
              src="/silvermoon-logo.svg" 
              alt="SILVERMOON Logo" 
              className="w-12 h-12 sm:w-16 sm:h-16 object-contain"
            />
          </div>
        )}
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-2 px-2">
          Registro de Evento
        </h1>
        {eventInfo?.description ? (
          <p className="text-gray-600 text-base sm:text-lg mb-2 px-2">
            {eventInfo.description}
          </p>
        ) : null}
        <p className="text-gray-500 text-sm sm:text-base px-2">
          Completa el formulario para generar y descargar tu ticket de entrada gratuito
        </p>
        <p className="text-gray-400 text-xs mt-2">
          Powered by SILVERMOON
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded-full"></div>
            <span className="text-red-800 text-sm font-medium">Error:</span>
          </div>
          <p className="text-red-700 text-sm mt-1">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
        {/* Event Info */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 sm:p-6 mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3 sm:mb-4">Información del Evento</h2>
          <div className="grid gap-3 sm:gap-4">
            <div className="flex items-center gap-3">
              <Ticket className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0" />
              <span className="font-medium text-sm sm:text-base truncate">{eventInfo?.name || 'Cargando...'}</span>
            </div>
            <div className="flex items-start gap-3">
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <span className="text-sm sm:text-base">
                {eventInfo?.date ? new Date(eventInfo.date).toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                }) : 'Cargando...'} - {eventInfo?.time || 'Cargando...'}
              </span>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <span className="text-sm sm:text-base">{eventInfo?.location || 'Cargando...'}</span>
            </div>
          </div>
        </div>

        {/* Personal Info */}
        <div className="space-y-4 sm:space-y-4">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800">Información Personal</h2>
          
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Nombre Completo *
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                placeholder="Ingresa tu nombre completo"
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Correo Electrónico *
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                placeholder="Ingresa tu correo electrónico"
              />
            </div>
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
              Teléfono *
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                className="w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                placeholder="+58 424 1234 567"
              />
            </div>
          </div>

          <div>
            <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-2">
              Edad *
            </label>
            <div className="relative">
              <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
              <input
                type="number"
                id="age"
                name="age"
                value={formData.age}
                onChange={handleChange}
                required
                min="1"
                max="120"
                className="w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                placeholder="Ingresa tu edad"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 sm:py-4 px-4 sm:px-6 rounded-lg transition-all duration-200 transform hover:scale-[1.02] disabled:scale-100 text-sm sm:text-base"
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm sm:text-base">Generando ticket...</span>
            </div>
          ) : (
            'Generar y Descargar Ticket'
          )}
        </button>

        <p className="text-xs sm:text-sm text-gray-500 text-center px-2">
          Al registrarte, podrás descargar tu ticket como PNG o PDF para el acceso al evento. La información de edad es requerida para estadísticas del evento.
        </p>
      </form>
    </div>
  );
};

export default TicketForm;