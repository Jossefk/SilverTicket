import React, { useState, useRef, useEffect } from 'react';
import { Calendar, MapPin, Clock, FileText, Save, CheckCircle, Upload, Image, X, AlertCircle } from 'lucide-react';
import { useEvent } from '../contexts/EventContext';

const EventSettings: React.FC = () => {
  const { eventInfo, updateEventInfo, uploadLogo, loading, error } = useEvent();
  const [formData, setFormData] = useState({
    name: eventInfo?.name || '',
    date: eventInfo?.date || '',
    time: eventInfo?.time || '',
    location: eventInfo?.location || '',
    description: eventInfo?.description || '',
    logoUrl: eventInfo?.logoUrl || ''
  });
  const [saved, setSaved] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update form data when eventInfo changes (loaded from database)
  useEffect(() => {
    if (eventInfo) {
      setFormData({
        name: eventInfo.name,
        date: eventInfo.date,
        time: eventInfo.time,
        location: eventInfo.location,
        description: eventInfo.description,
        logoUrl: eventInfo.logoUrl || ''
      });
    }
  }, [eventInfo]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    setSaved(false);
  };

  const handleLogoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona un archivo de imagen válido');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('El tamaño de la imagen debe ser menor a 5MB');
      return;
    }

    setLogoFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setLogoPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
    setSaved(false);
  };

  const handleRemoveLogo = () => {
    setLogoFile(null);
    setLogoPreview(null);
    setFormData(prev => ({ ...prev, logoUrl: '' }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setSaved(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploadingLogo(true);

    try {
      let logoUrl = formData.logoUrl;

      // Upload logo if a new file was selected
      if (logoFile) {
        const uploadedUrl = await uploadLogo(logoFile);
        if (uploadedUrl) {
          logoUrl = uploadedUrl;
        } else {
          // If upload failed, don't proceed with form submission
          setUploadingLogo(false);
          return;
        }
      }

      // Update event info
      const success = await updateEventInfo({
        name: formData.name,
        date: formData.date,
        time: formData.time,
        location: formData.location,
        description: formData.description,
        logoUrl: logoUrl
      });

      if (success) {
        setFormData(prev => ({ ...prev, logoUrl }));
        setLogoFile(null);
        setLogoPreview(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        setSaved(true);
        
        // Hide success message after 3 seconds
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (err) {
      console.error('Error saving event settings:', err);
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleReset = () => {
    setFormData({
      name: eventInfo?.name || '',
      date: eventInfo?.date || '',
      time: eventInfo?.time || '',
      location: eventInfo?.location || '',
      description: eventInfo?.description || '',
      logoUrl: eventInfo?.logoUrl || ''
    });
    setLogoFile(null);
    setLogoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setSaved(false);
  };

  const currentLogoUrl = logoPreview || formData.logoUrl || eventInfo?.logoUrl;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center mx-auto mb-4 overflow-hidden border-4 border-purple-100">
          <img 
            src="/silvermoon-logo.svg" 
            alt="SILVERMOON Logo" 
            className="w-12 h-12 object-contain"
          />
        </div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          SILVER EVENTOS - Configuración
        </h1>
        <p className="text-gray-600">
          Modifica la información que aparecerá en los tickets generados
        </p>
      </div>

      {saved && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-green-600" />
            <div>
              <h3 className="text-green-800 font-semibold">¡Configuración guardada!</h3>
              <p className="text-green-700 text-sm">
                Los nuevos tickets mostrarán la información actualizada
              </p>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-red-600" />
            <div>
              <h3 className="text-red-800 font-semibold">Error</h3>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Información del Evento</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Logo Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Logo del Evento
              </label>
              
              {currentLogoUrl ? (
                <div className="relative">
                  <div className="w-full h-32 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden">
                    <img 
                      src={currentLogoUrl} 
                      alt="Logo del evento" 
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveLogo}
                    className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-32 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors"
                >
                  <Upload className="w-8 h-8 text-gray-400 mb-2" />
                  <p className="text-gray-500 text-sm">Haz clic para subir logo</p>
                  <p className="text-gray-400 text-xs">PNG, JPG hasta 5MB</p>
                </div>
              )}
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleLogoSelect}
                className="hidden"
              />
              
              {!currentLogoUrl && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-2 flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm"
                >
                  <Image className="w-4 h-4" />
                  Seleccionar imagen
                </button>
              )}
            </div>

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Nombre del Evento *
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                  placeholder="Nombre del evento"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha *
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="date"
                    id="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-2">
                  Hora *
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    id="time"
                    name="time"
                    value={formData.time}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                    placeholder="9:00 AM"
                  />
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                Ubicación *
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                  placeholder="Dirección del evento"
                />
              </div>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Descripción
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 resize-none"
                placeholder="Descripción breve del evento"
              />
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading || uploadingLogo}
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-[1.02] disabled:scale-100"
              >
                {loading || uploadingLogo ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    {uploadingLogo ? 'Subiendo logo...' : 'Guardando...'}
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <Save className="w-4 h-4" />
                    Guardar Cambios
                  </div>
                )}
              </button>

              <button
                type="button"
                onClick={handleReset}
                disabled={loading || uploadingLogo}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Restablecer
              </button>
            </div>
          </form>
        </div>

        {/* Preview */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Vista Previa del Ticket</h3>
            
            {/* Mini Ticket Preview */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-4 text-white mb-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex-1">
                  <h4 className="text-lg font-bold">{formData.name}</h4>
                  <p className="text-blue-100 text-sm">Entrada Gratuita</p>
                </div>
                {currentLogoUrl && (
                  <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center overflow-hidden">
                    <img 
                      src={currentLogoUrl} 
                      alt="Logo" 
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span className="text-gray-600">
                  {new Date(formData.date).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })} - {formData.time}
                </span>
              </div>
              
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-gray-500" />
                <span className="text-gray-600">{formData.location}</span>
              </div>

              {formData.description && (
                <div className="flex items-start gap-3">
                  <FileText className="w-4 h-4 text-gray-500 mt-0.5" />
                  <span className="text-gray-600">{formData.description}</span>
                </div>
              )}
            </div>
          </div>

          <div className="bg-blue-50 rounded-lg p-6">
            <h4 className="font-semibold text-blue-800 mb-3">Información Importante</h4>
            <ul className="text-blue-700 text-sm space-y-1">
              <li>• Los cambios se aplicarán a todos los tickets nuevos</li>
              <li>• Los tickets ya generados mantendrán su información original</li>
              <li>• El logo se almacena de forma segura en la nube</li>
              <li>• La configuración se sincroniza automáticamente</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventSettings;