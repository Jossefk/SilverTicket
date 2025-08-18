import React, { useState, useEffect, useRef } from 'react';
import { Camera, CheckCircle, XCircle, User, Mail, Calendar, MapPin, Clock, Hash } from 'lucide-react';
import QrScanner from 'qr-scanner';
import { useTickets, Ticket } from '../contexts/TicketContext';
import { useEvent } from '../contexts/EventContext';

interface ScanResult {
  ticket: Ticket;
  status: 'success' | 'already_checked' | 'not_found';
  message: string;
}

const Scanner: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [qrScanner, setQrScanner] = useState<QrScanner | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [hasCamera, setHasCamera] = useState(true);
  const [isWaitingConfirmation, setIsWaitingConfirmation] = useState(false);
  const { getTicket, checkInTicket, loading } = useTickets();
  const { eventInfo } = useEvent();

  useEffect(() => {
    initializeScanner();
    return () => {
      if (qrScanner) {
        qrScanner.stop();
        qrScanner.destroy();
      }
    };
  }, []);

  const initializeScanner = async () => {
    if (!videoRef.current) return;

    try {
      const hasCamera = await QrScanner.hasCamera();
      setHasCamera(hasCamera);

      if (!hasCamera) return;

      const scanner = new QrScanner(
        videoRef.current,
        (result) => handleScan(result.data),
        {
          highlightScanRegion: true,
          highlightCodeOutline: true,
          returnDetailedScanResult: true,
        }
      );

      setQrScanner(scanner);
    } catch (error) {
      console.error('Error initializing scanner:', error);
      setHasCamera(false);
    }
  };

  const handleScan = (data: string) => {
    if (!data) return;
    if (isWaitingConfirmation) return; // No procesar si está esperando confirmación

    processTicket(data);
  };

  const processTicket = async (ticketId: string) => {
    setIsWaitingConfirmation(true);
    
    try {
      // Buscar el ticket en la base de datos
      const ticket = await getTicket(ticketId);
      
      if (!ticket) {
        setScanResult({
          ticket: {} as Ticket,
          status: 'not_found',
          message: 'Ticket no encontrado en el sistema'
        });
        return;
      }

      if (ticket.checkedIn) {
        setScanResult({
          ticket,
          status: 'already_checked',
          message: `Ya registrado el ${new Date(ticket.checkedInAt!).toLocaleString('es-ES')}`
        });
        return;
      }

      // Marcar como check-in
      const success = await checkInTicket(ticketId);
      if (success) {
        // Obtener el ticket actualizado
        const updatedTicket = await getTicket(ticketId);
        setScanResult({
          ticket: updatedTicket || ticket,
          status: 'success',
          message: 'Entrada registrada exitosamente'
        });
      } else {
        setScanResult({
          ticket,
          status: 'not_found',
          message: 'Error al registrar la entrada'
        });
      }
    } catch (error) {
      console.error('Error processing ticket:', error);
      setScanResult({
        ticket: {} as Ticket,
        status: 'not_found',
        message: 'Error al procesar el ticket'
      });
    }
  };

  const startScanning = async () => {
    if (!qrScanner) return;
    
    try {
      await qrScanner.start();
      setIsScanning(true);
      setScanResult(null);
      setIsWaitingConfirmation(false);
    } catch (error) {
      console.error('Error starting scanner:', error);
    }
  };

  const stopScanning = () => {
    if (qrScanner) {
      qrScanner.stop();
      setIsScanning(false);
    }
  };

  const confirmAndContinue = () => {
    setScanResult(null);
    setIsWaitingConfirmation(false);
  };

  if (!hasCamera) {
    return (
      <div className="max-w-2xl mx-auto text-center">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Cámara no disponible</h1>
          <p className="text-gray-600 mb-6">
            No se pudo acceder a la cámara. Por favor, verifica los permisos del navegador.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center mx-auto mb-4 overflow-hidden border-4 border-green-100">
          <img 
            src="/silvermoon-logo.svg" 
            alt="SILVERMOON Logo" 
            className="w-12 h-12 object-contain"
          />
        </div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          SILVER EVENTOS - Scanner
        </h1>
        <p className="text-gray-600">
          Escanea los códigos QR para validar las entradas al evento
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Camera Section */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Cámara Scanner</h2>
            <div className="flex gap-3">
              {!isScanning ? (
                <button
                  onClick={startScanning}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <Camera className="w-4 h-4" />
                  Iniciar Scanner
                </button>
              ) : (
                <button
                  onClick={stopScanning}
                  className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <XCircle className="w-4 h-4" />
                  Detener Scanner
                </button>
              )}
              
              {scanResult && !isWaitingConfirmation && (
                <button
                  onClick={confirmAndContinue}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <CheckCircle className="w-4 h-4" />
                  Escanear Siguiente
                </button>
              )}
            </div>
          </div>
          
          <div className="aspect-square bg-gray-900 relative">
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              playsInline
              muted
            />
            {!isScanning && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <Camera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-white text-lg">Presiona "Iniciar Scanner" para comenzar</p>
                </div>
              </div>
            )}
            {loading && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                  <p className="text-white">Procesando ticket...</p>
                </div>
              </div>
            )}
            {isWaitingConfirmation && (
              <div className="absolute inset-0 bg-blue-900 bg-opacity-75 flex items-center justify-center">
                <div className="text-center">
                  <CheckCircle className="w-12 h-12 text-white mx-auto mb-2" />
                  <p className="text-white text-lg font-semibold">Ticket Procesado</p>
                  <p className="text-blue-200 text-sm">Revisa la información y confirma para continuar</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Result Section */}
        <div className="space-y-6">
          {scanResult ? (
            <div className="bg-white rounded-2xl shadow-xl p-6">
              {/* Status Header */}
              <div className={`flex items-center gap-3 p-4 rounded-lg mb-6 ${
                scanResult.status === 'success' ? 'bg-green-50 border border-green-200' :
                scanResult.status === 'already_checked' ? 'bg-yellow-50 border border-yellow-200' :
                'bg-red-50 border border-red-200'
              }`}>
                {scanResult.status === 'success' && <CheckCircle className="w-6 h-6 text-green-600" />}
                {scanResult.status === 'already_checked' && <Clock className="w-6 h-6 text-yellow-600" />}
                {scanResult.status === 'not_found' && <XCircle className="w-6 h-6 text-red-600" />}
                
                <div>
                  <h3 className={`font-semibold ${
                    scanResult.status === 'success' ? 'text-green-800' :
                    scanResult.status === 'already_checked' ? 'text-yellow-800' :
                    'text-red-800'
                  }`}>
                    {scanResult.status === 'success' && '¡Entrada Válida!'}
                    {scanResult.status === 'already_checked' && 'Ya Registrado'}
                    {scanResult.status === 'not_found' && 'Ticket Inválido'}
                  </h3>
                  <p className={`text-sm ${
                    scanResult.status === 'success' ? 'text-green-700' :
                    scanResult.status === 'already_checked' ? 'text-yellow-700' :
                    'text-red-700'
                  }`}>
                    {scanResult.message}
                  </p>
                </div>
              </div>

              {/* Ticket Details */}
              {scanResult.status !== 'not_found' && (
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-800">Información del Asistente</h4>
                  
                  <div className="grid gap-3">
                    <div className="flex items-center gap-3">
                      <User className="w-4 h-4 text-gray-500" />
                      <span className="font-medium text-gray-800">{scanResult.ticket.name}</span>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Mail className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-600 text-sm">{scanResult.ticket.email}</span>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Hash className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-600 text-sm">{scanResult.ticket.age} años</span>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-600 text-sm">{eventInfo?.name || 'Cargando...'}</span>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <MapPin className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-600 text-sm">{eventInfo?.location || 'Cargando...'}</span>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-600">
                      <strong>Ticket ID:</strong> {scanResult.ticket.id}
                    </p>
                    <p className="text-xs text-gray-600">
                      <strong>Registrado:</strong> {new Date(scanResult.ticket.createdAt).toLocaleString('es-ES')}
                    </p>
                    {scanResult.ticket.checkedInAt && (
                      <p className="text-xs text-gray-600">
                        <strong>Entrada:</strong> {new Date(scanResult.ticket.checkedInAt).toLocaleString('es-ES')}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Confirmation Button */}
              {isWaitingConfirmation && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <button
                    onClick={confirmAndContinue}
                    className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-[1.02]"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <CheckCircle className="w-5 h-5" />
                      Confirmar y Escanear Siguiente Ticket
                    </div>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Camera className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Esperando escaneo...
              </h3>
              <p className="text-gray-600">
                Apunta la cámara al código QR del ticket para validar la entrada
              </p>
            </div>
          )}

          {/* Instructions */}
          <div className="bg-blue-50 rounded-lg p-6">
            <h4 className="font-semibold text-blue-800 mb-3">Instrucciones de Uso</h4>
            <ul className="text-blue-700 text-sm space-y-1">
              <li>• Asegúrate de que haya buena iluminación</li>
              <li>• Mantén el código QR centrado en la cámara</li>
              <li>• La validación es automática una vez detectado</li>
              <li>• Los tickets ya validados aparecerán en amarillo</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Scanner;