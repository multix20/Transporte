import React, { useState } from 'react';
import { Users, Briefcase, X, ChevronLeft, ChevronRight } from 'lucide-react';

const vehicles = [
  {
    name: 'Mercedes Sprinter',
    capacity: '16 pasajeros',
    features: ['Aire acondicionado', 'Máximo confort', 'Asientos reclinables', 'Audio/Video', 'Cinturones de seguridad'],
    images: [
      '/sprinter-frontal.jpg',
      '/sprinter-lateral.jpg',
      '/sprinter-interior1.jpg',
      '/sprinter-interior2.jpg',
    ],
    icon: Users,
  },
  {
    name: 'Van JAC',
    capacity: '12 pasajeros',
    features: ['Máximo confort', 'Asientos premium', 'Audio/Video','Aire acondicionado', 'Cinturones de seguridad'],
    images: [
      '/jac-frontal.jpg',
      '/jac-lateral.jpg',
      '/jac-interior1.jpg',
      '/jac-interior2.jpg',
    ],
    icon: Users,
  },
];

const ImageCarousel = ({ images, name, onClick }) => {
  const [current, setCurrent] = useState(0);

  const prev = (e) => {
    e.stopPropagation();
    setCurrent((current - 1 + images.length) % images.length);
  };

  const next = (e) => {
    e.stopPropagation();
    setCurrent((current + 1) % images.length);
  };

  return (
    <div className="relative h-56 overflow-hidden" onClick={onClick}>
      <img
        src={images[current]}
        alt={`${name} - foto ${current + 1}`}
        className="w-full h-full object-cover transition-opacity duration-300"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

      {/* Flechas */}
      <button
        onClick={prev}
        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white p-1.5 rounded-full transition-colors"
        aria-label="Anterior"
      >
        <ChevronLeft size={18} />
      </button>
      <button
        onClick={next}
        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white p-1.5 rounded-full transition-colors"
        aria-label="Siguiente"
      >
        <ChevronRight size={18} />
      </button>

      {/* Dots */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
        {images.map((_, i) => (
          <button
            key={i}
            onClick={(e) => { e.stopPropagation(); setCurrent(i); }}
            className={`rounded-full transition-all duration-200 ${i === current ? 'bg-emerald-400 w-5 h-2' : 'bg-white/60 w-2 h-2'}`}
          />
        ))}
      </div>
    </div>
  );
};

const ModalCarousel = ({ images, name }) => {
  const [current, setCurrent] = useState(0);

  const prev = () => setCurrent((current - 1 + images.length) % images.length);
  const next = () => setCurrent((current + 1) % images.length);

  return (
    <div className="relative">
      <img
        src={images[current]}
        alt={`${name} - foto ${current + 1}`}
        className="w-full h-80 object-cover"
      />
      <button
        onClick={prev}
        className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white p-2 rounded-full transition-colors"
        aria-label="Anterior"
      >
        <ChevronLeft size={22} />
      </button>
      <button
        onClick={next}
        className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white p-2 rounded-full transition-colors"
        aria-label="Siguiente"
      >
        <ChevronRight size={22} />
      </button>
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {images.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`rounded-full transition-all duration-200 ${i === current ? 'bg-emerald-400 w-6 h-2.5' : 'bg-white/60 w-2.5 h-2.5'}`}
          />
        ))}
      </div>
    </div>
  );
};

const Fleet = () => {
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  return (
    <>
      <section className="py-20 bg-gradient-to-br from-emerald-50 to-green-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-emerald-900 mb-4">
              Nuestra Flota
            </h2>
            <p className="text-xl text-emerald-700 max-w-2xl mx-auto">
              Vehículos modernos, cómodos y seguros para cada tipo de viaje
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {vehicles.map((vehicle, index) => {
              const Icon = vehicle.icon;
              return (
                <div
                  key={index}
                  className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 cursor-pointer group relative"
                >
                  <ImageCarousel
                    images={vehicle.images}
                    name={vehicle.name}
                    onClick={() => setSelectedVehicle(vehicle)}
                  />

                  {/* Capacity badge */}
                  <div className="absolute top-44 left-4 bg-emerald-600 text-white px-4 py-2 rounded-full flex items-center gap-2 z-10">
                    <Icon size={18} />
                    <span className="font-semibold text-sm">{vehicle.capacity}</span>
                  </div>

                  <div className="p-6 pt-8" onClick={() => setSelectedVehicle(vehicle)}>
                    <h3 className="text-xl font-bold text-emerald-900 mb-4">{vehicle.name}</h3>
                    <ul className="space-y-2">
                      {vehicle.features.map((feature, i) => (
                        <li key={i} className="flex items-center text-emerald-700">
                          <span className="w-2 h-2 bg-emerald-500 rounded-full mr-3 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <p className="text-emerald-500 text-sm mt-4 font-medium">Ver detalles →</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="text-center mt-12">
            <p className="text-emerald-700 text-lg">
              ¿Necesitas un vehículo especial?{' '}
              <a href="#contacto" className="text-emerald-900 font-bold hover:underline">
                Contáctanos
              </a>
            </p>
          </div>
        </div>
      </section>

      {/* Modal */}
      {selectedVehicle && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedVehicle(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-3xl w-full overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative">
              <ModalCarousel images={selectedVehicle.images} name={selectedVehicle.name} />
              <button
                onClick={() => setSelectedVehicle(null)}
                className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors z-10"
                aria-label="Cerrar"
              >
                <X size={24} />
              </button>
            </div>
            <div className="p-8">
              <h3 className="text-3xl font-bold text-emerald-900 mb-4">{selectedVehicle.name}</h3>
              <div className="flex items-center gap-2 text-emerald-700 mb-6">
                {React.createElement(selectedVehicle.icon, { size: 20 })}
                <span className="font-semibold">{selectedVehicle.capacity}</span>
              </div>
              <h4 className="text-lg font-semibold text-emerald-800 mb-3">Características:</h4>
              <ul className="space-y-2 mb-6">
                {selectedVehicle.features.map((feature, i) => (
                  <li key={i} className="flex items-center text-emerald-700">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full mr-3 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
              <a
                href="#contacto"
                className="block w-full bg-emerald-600 hover:bg-emerald-700 text-white text-center py-3 rounded-xl font-semibold transition-colors"
              >
                Solicitar cotización
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Fleet;