import React from 'react';

const services = [
  {
    icon: '🏛️',
    title: 'Turismo',
    description: 'Descubre los lugares más hermosos de la Araucanía con nuestros tours especializados.',
  },
  {
    icon: '✈️',
    title: 'Aeropuerto',
    description: 'Traslados cómodos y puntuales desde/hacia el aeropuerto.',
  },
  {
    icon: '🏔️',
    title: 'Termas',
    description: 'Transporte a las mejores termas de la región para tu relajación.',
  },
  {
    icon: '🌊',
    title: 'Mar',
    description: 'Viajes a la costa para disfrutar de playas y paisajes marinos.',
  },
  {
    icon: '🏞️',
    title: 'Lagos',
    description: 'Excursiones a los lagos más espectaculares de la Araucanía.',
  },
  {
    icon: '🎉',
    title: 'Eventos',
    description: 'Transporte especial para eventos, matrimonios y celebraciones.',
  },
];

const Services = () => (
  <section id="servicios" className="py-20 bg-white">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-bold text-emerald-900 mb-4">
          Nuestros Servicios
        </h2>
        <p className="text-xl text-emerald-700 max-w-2xl mx-auto">
          Conectamos la región con comodidad, seguridad y profesionalismo
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {services.map((service, index) => (
          <div
            key={index}
            className="bg-gradient-to-br from-emerald-50 to-green-50 p-8 rounded-2xl
                       border border-emerald-100 hover:shadow-xl transition-all duration-300
                       hover:-translate-y-2"
          >
            <div className="text-4xl mb-4">{service.icon}</div>
            <h3 className="text-xl font-bold text-emerald-900 mb-3">{service.title}</h3>
            <p className="text-emerald-700">{service.description}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default Services;