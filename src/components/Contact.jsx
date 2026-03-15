import React from 'react';
import { Phone, MapPin } from 'lucide-react';

const Contact = () => {
  return (
    <section id="contacto" className="py-20 bg-gradient-to-br from-emerald-900 to-green-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Contáctanos</h2>
          <p className="text-xl text-emerald-100 max-w-2xl mx-auto">
            Estamos listos para hacer tu viaje inolvidable
          </p>
        </div>

        <div className="flex flex-col items-center gap-8">

          {/* Teléfonos */}
          <div className="flex items-center space-x-4">
            <div className="bg-emerald-600 p-3 rounded-full">
              <Phone className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-semibold">WhatsApp</h3>
              <p className="text-emerald-200">+56 9 5156 9704</p>
              <p className="text-emerald-200">+56 9 9703 5692</p>
            </div>
          </div>

          {/* Cobertura */}
          <div className="flex items-center space-x-4">
            <div className="bg-emerald-600 p-3 rounded-full">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-semibold">Cobertura</h3>
              <p className="text-emerald-200">Región de la Araucanía, Chile</p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Contact;