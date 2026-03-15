import React from 'react';
import { Landmark, PlaneTakeoff, Waves, Ship, Mountain, PartyPopper } from 'lucide-react';

const services = [
  {
    Icon: Landmark,
    title: 'Turismo',
    description: 'Descubre los lugares más hermosos de la Araucanía con guías especializados y vehículos de lujo.',
    image: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&w=800&q=80',
  },
  {
    Icon: PlaneTakeoff,
    title: 'Traslado Aeropuerto',
    description: 'Llegamos a tiempo, siempre. Traslados puntuales desde y hacia el aeropuerto con seguimiento de vuelo.',
    image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=800&q=80',
  },
  {
    Icon: Waves,
    title: 'Termas',
    description: 'Relájate en las mejores termas de la región. Nos encargamos del transporte para que solo pienses en descansar.',
    image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80',
  },
  {
    Icon: Ship,
    title: 'Costa y Mar',
    description: 'Viajes a la costa para disfrutar de playas y paisajes marinos únicos del sur de Chile.',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
  },
  {
    Icon: Mountain,
    title: 'Lagos y Volcanes',
    description: 'Excursiones a los lagos más espectaculares y vistas privilegiadas de los volcanes Villarrica y Llaima.',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=800&q=80',
  },
  {
    Icon: PartyPopper,
    title: 'Eventos y Matrimonios',
    description: 'Transporte exclusivo para tu evento especial. Coordinamos traslados grupales con puntualidad y estilo.',
    image: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80',
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
        {services.map((service, index) => {
          const { Icon } = service;
          return (
            <div
              key={index}
              className="group relative rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 h-80"
            >
              <img
                src={service.image}
                alt={service.title}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10" />
              <div className="absolute inset-0 flex flex-col justify-end p-6">
                <div className="w-11 h-11 bg-emerald-500/90 rounded-xl flex items-center justify-center mb-3">
                  <Icon size={22} className="text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{service.title}</h3>
                <p className="text-white/80 text-sm leading-relaxed">
                  {service.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  </section>
);

export default Services;