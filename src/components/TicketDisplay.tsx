import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Download, Mail, Calendar, MapPin, User, CheckCircle, Hash } from 'lucide-react';
import QRCode from 'qrcode';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { useTickets, Ticket } from '../contexts/TicketContext';
import { useEvent } from '../contexts/EventContext';

const TicketDisplay: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { getTicket } = useTickets();
  const { eventInfo } = useEvent();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [downloading, setDownloading] = useState<'png' | 'pdf' | null>(null);

  const ticketRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (id) {
      const fetchTicket = async () => {
        try {
          console.log('Fetching ticket with ID:', id);
          const foundTicket = await getTicket(id);
          console.log('Ticket found:', foundTicket);

          setTicket(foundTicket);

          if (foundTicket) {
            generateQR(foundTicket.id);
          }
        } catch (error) {
          console.error('Error fetching ticket:', error);
          setTicket(null);
        } finally {
          setLoading(false);
        }
      };

      // Timeout de seguridad
      const timeoutId = setTimeout(() => {
        console.log('Timeout reached, stopping loading');
        setLoading(false);
      }, 10000); // 10 segundos

      fetchTicket().finally(() => {
        clearTimeout(timeoutId);
      });

      return () => {
        clearTimeout(timeoutId);
      };
    } else {
      setLoading(false);
    }
  }, [id]);

  const generateQR = async (ticketId: string) => {
    try {
      const qrUrl = await QRCode.toDataURL(ticketId, {
        width: 400,
        margin: 2,
        errorCorrectionLevel: 'M',
        type: 'image/png',
        color: {
          dark: '#1f2937',
          light: '#ffffff'
        }
      });
      setQrDataUrl(qrUrl);
    } catch (error) {
      console.error('Error generating QR:', error);
    }
  };



  const downloadTicketPNG = async () => {
    if (!ticketRef.current || downloading) return;

    setDownloading('png');
    try {
      // Temporarily set minimum width for better capture
      const originalMinWidth = ticketRef.current.style.minWidth;
      ticketRef.current.style.minWidth = '500px';

      // Ensure the element is fully rendered and visible
      await new Promise(resolve => setTimeout(resolve, 500));

      const canvas = await html2canvas(ticketRef.current, {
        backgroundColor: 'white',
        scale: 3, // Higher scale for better quality
        useCORS: true,
        allowTaint: true,
        width: ticketRef.current.scrollWidth,
        height: ticketRef.current.scrollHeight,
        scrollX: 0,
        scrollY: 0
      });

      // Restore original minWidth
      ticketRef.current.style.minWidth = originalMinWidth;

      const link = document.createElement('a');
      link.download = `ticket-${ticket?.id}.png`;
      link.href = canvas.toDataURL('image/png', 1.0); // Maximum quality
      link.click();
    } catch (error) {
      console.error('Error downloading PNG:', error);
      // Restore original minWidth in case of error
      if (ticketRef.current) {
        ticketRef.current.style.minWidth = '';
      }
    } finally {
      setDownloading(null);
    }
  };

  const downloadTicketPDF = async () => {
    if (!ticketRef.current || downloading) return;

    setDownloading('pdf');
    try {
      // Temporarily set minimum width for better capture
      const originalMinWidth = ticketRef.current.style.minWidth;
      ticketRef.current.style.minWidth = '500px';

      // Ensure the element is fully rendered and visible
      await new Promise(resolve => setTimeout(resolve, 500));

      const canvas = await html2canvas(ticketRef.current, {
        backgroundColor: 'white',
        scale: 3, // Higher scale for better quality
        useCORS: true,
        allowTaint: true,
        width: ticketRef.current.scrollWidth,
        height: ticketRef.current.scrollHeight,
        scrollX: 0,
        scrollY: 0
      });

      // Restore original minWidth
      ticketRef.current.style.minWidth = originalMinWidth;

      const pdf = new jsPDF('p', 'mm', 'a4');

      // Calculate dimensions to fit the page properly
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const margin = 10;
      const availableWidth = pdfWidth - (margin * 2);
      const availableHeight = pdfHeight - (margin * 2);

      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(availableWidth / (imgWidth * 0.264583), availableHeight / (imgHeight * 0.264583));

      const finalWidth = imgWidth * 0.264583 * ratio;
      const finalHeight = imgHeight * 0.264583 * ratio;

      // Center the image on the page
      const x = (pdfWidth - finalWidth) / 2;
      const y = (pdfHeight - finalHeight) / 2;

      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', x, y, finalWidth, finalHeight);
      pdf.save(`ticket-${ticket?.id}.pdf`);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      // Restore original minWidth in case of error
      if (ticketRef.current) {
        ticketRef.current.style.minWidth = '';
      }
    } finally {
      setDownloading(null);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto text-center">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Cargando ticket...</h1>
          <p className="text-gray-600">Obteniendo información del ticket desde la base de datos</p>
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="max-w-2xl mx-auto text-center">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Ticket no encontrado</h1>
          <p className="text-gray-600 mb-6">El ticket solicitado no existe o ha sido eliminado.</p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
          >
            Crear nuevo ticket
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Success Message */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 sm:mb-8">
        <div className="flex items-center gap-3">
          <CheckCircle className="w-6 h-6 text-blue-600" />
          <div>
            <h3 className="text-blue-800 font-semibold">¡Tu ticket está listo!</h3>
            <p className="text-blue-700 text-sm">
              Ticket registrado exitosamente para {ticket.email}
            </p>
          </div>
        </div>
      </div>

      {/* Download Actions */}
      <div className="flex flex-wrap gap-3 sm:gap-4 mb-6 sm:mb-8 justify-center px-2">
        <button
          onClick={downloadTicketPNG}
          disabled={downloading !== null}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg transition-colors text-sm sm:text-base"
        >
          {downloading === 'png' ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <Download className="w-5 h-5" />
          )}
          {downloading === 'png' ? 'Generando PNG...' : 'Descargar PNG'}
        </button>
        <button
          onClick={downloadTicketPDF}
          disabled={downloading !== null}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg transition-colors text-sm sm:text-base"
        >
          {downloading === 'pdf' ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <Download className="w-5 h-5" />
          )}
          {downloading === 'pdf' ? 'Generando PDF...' : 'Descargar PDF'}
        </button>
      </div>

      {/* Ticket */}
      <div
        ref={ticketRef}
        className="bg-white rounded-2xl shadow-2xl overflow-hidden mx-auto print:shadow-none"
        style={{
          maxWidth: '600px',
          width: '100%'
        }}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 sm:p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <h1 className="text-lg sm:text-2xl font-bold mb-1 truncate">{eventInfo?.name || 'Cargando evento...'}</h1>
              <p className="text-blue-100 text-sm">Entrada Gratuita</p>
            </div>
            {eventInfo?.logoUrl ? (
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                <img
                  src={eventInfo.logoUrl}
                  alt="Logo del evento"
                  className="max-w-full max-h-full object-contain"
                />
              </div>
            ) : (
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                <img
                  src="/silvermoon-logo.svg"
                  alt="SILVERMOON Logo"
                  className="w-8 h-8 sm:w-10 sm:h-10 object-contain"
                />
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {/* Left Column - Info */}
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Información del Asistente</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <User className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-800">{ticket.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-600 text-sm">{ticket.email}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Hash className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-600 text-sm">{ticket.age} años</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Detalles del Evento</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-600 text-sm">
                      {eventInfo?.date ? new Date(eventInfo.date).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      }) : 'Cargando...'} - {eventInfo?.time || 'Cargando...'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-600 text-sm">{eventInfo?.location || 'Cargando...'}</span>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3">
                <p className="text-yellow-800 text-sm font-medium">
                  Ticket ID: {ticket.id}
                </p>
                <p className="text-yellow-700 text-xs mt-1">
                  Presenta este código QR en la entrada del evento
                </p>
              </div>
            </div>

            {/* Right Column - QR Code */}
            <div className="flex flex-col items-center justify-center">
              <div className="bg-white p-4 rounded-lg border-2 border-gray-200 mb-4">
                {qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt="QR Code"
                    className="w-32 h-32 sm:w-48 sm:h-48 object-contain"
                  />
                ) : (
                  <div className="w-32 h-32 sm:w-48 sm:h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                )}
              </div>
              <p className="text-center text-sm text-gray-600">
                Escanea este código QR para validar tu entrada
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-4 sm:px-6 py-4 border-t">
          <div className="flex flex-col sm:flex-row justify-between items-center text-xs sm:text-sm text-gray-500 gap-2">
            <span>Generado el: {new Date(ticket.createdAt).toLocaleDateString('es-ES')}</span>
            <span>SILVER EVENTOS by SILVERMOON • Entrada Gratuita</span>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-6 sm:mt-8 bg-blue-50 rounded-lg p-4 sm:p-6 text-center">
        <h3 className="text-lg font-semibold text-blue-800 mb-2">Instrucciones Importantes</h3>
        <ul className="text-blue-700 text-sm space-y-1">
          <li>• Descarga tu ticket o guarda el enlace para acceso futuro</li>
          <li>• Presenta el código QR en tu dispositivo móvil al llegar al evento</li>
          <li>• Llega 15 minutos antes del inicio del evento</li>
          <li>• En caso de problemas, contacta al organizador</li>
        </ul>
      </div>
    </div>
  );
};

export default TicketDisplay;