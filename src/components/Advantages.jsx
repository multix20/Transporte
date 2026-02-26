import React from 'react';
import { Car, Users, Shield, Clock, Star } from 'lucide-react';

const advantages = [
  { icon: Car, text: 'Vehículos nuevos y en perfectas condiciones' },
  { icon: Users, text: 'Conductores profesionales y experimentados' },
  { icon: Clock, text: 'Puntualidad garantizada' },
  { icon: Star, text: 'Servicio de calidad premium' },
];

const Advantages = () => (
  <section id="ventajas" className="py-20 bg-gradient-to-br from-emerald-100 to-green-100">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-bold text-emerald-900 mb-4">
          ¿Por qué elegirnos?
        </h2>
        <p className="text-xl text-emerald-700 max-w-2xl mx-auto">
          Tu tranquilidad y comodidad son nuestra prioridad
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {advantages.map(({ icon: Icon, text }, index) => (
          <div
            key={index}
            className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <div className="flex items-center space-x-4">
              <div className="bg-emerald-600 p-3 rounded-full shrink-0">
                <Icon className="w-6 h-6 text-white" />
              </div>
              <p className="text-emerald-800 font-medium">{text}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default Advantages;