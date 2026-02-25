import React, { useState } from 'react';
import { Users, Briefcase, X } from 'lucide-react';

const vehicles = [
  {
    name: 'Minibús Premium',
    capacity: '15-19 pasajeros',
    features: ['Aire acondicionado', 'Asientos reclinables', 'Audio/Video'],
    image: 'https://chileautos.pxcrush.net/chileautos/cars/private/cq73iavfxndqwl26pgk899zbg.jpg?pxc_method=fitfill&pxc_bgtype=self&height=725&width=1087',
    icon: Users,
  },
  {
    name: 'Van Ejecutiva',
    capacity: '8-12 pasajeros',
    features: ['Máximo confort', 'Servicio VIP', 'Wi-Fi disponible'],
    image: 'https://images.unsplash.com/photo-1562519819-016a93476804?auto=format&fit=crop&w=1200&q=80',
    icon: Briefcase,
  },
  {
    name: 'Minibús Turismo',
    capacity: '20-25 pasajeros',
    features: ['Amplias ventanas', 'Maletero grande', 'Guía incluido'],
    image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1200&q=80',
    icon: Users,
  },
];

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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {vehicles.map((vehicle, index) => {
              const Icon = vehicle.icon;
              return (
                <div
                  key={index}
                  className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl
                             transition-all duration-300 hover:-translate-y-1 cursor-pointer group"
                  onClick={() => setSelectedVehicle(vehicle)}
                >
                  {/* Image */}
                  <div className="relative h-56 overflow-hidden">
                    <img
                      src={vehicle.image}
                      alt={vehicle.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    
                    {/* Capacity badge */}
                    <div className="absolute bottom-4 left-4 bg-emerald-600 text-white px-4 py-2 rounded-full flex items-center gap-2">
                      <Icon size={18} />
                      <span className="font-semibold text-sm">{vehicle.capacity}</span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-emerald-900 mb-4">
                      {vehicle.name}
                    </h3>
                    <ul className="space-y-2">
                      {vehicle.features.map((feature, i) => (
                        <li key={i} className="flex items-center text-emerald-700">
                          <span className="w-2 h-2 bg-emerald-500 rounded-full mr-3" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-emerald-600/0 group-hover:bg-emerald-600/10 transition-colors duration-300 pointer-events-none" />
                </div>
              );
            })}
          </div>

          <div className="text-center mt-12">
            <p className="text-emerald-700 text-lg">
              ¿Necesitas un vehículo especial?{' '}
              <a
                href="#contacto"
                className="text-emerald-900 font-bold hover:underline"
              >
                Contáctanos
              </a>
            </p>
          </div>
        </div>
      </section>

      {/* Modal for vehicle details */}
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
              <img
                src={selectedVehicle.image}
                alt={selectedVehicle.name}
                className="w-full h-80 object-cover"
              />
              <button
                onClick={() => setSelectedVehicle(null)}
                className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
                aria-label="Cerrar"
              >
                <X size={24} />
              </button>
            </div>
            <div className="p-8">
              <h3 className="text-3xl font-bold text-emerald-900 mb-4">
                {selectedVehicle.name}
              </h3>
              <div className="flex items-center gap-2 text-emerald-700 mb-6">
                {React.createElement(selectedVehicle.icon, { size: 20 })}
                <span className="font-semibold">{selectedVehicle.capacity}</span>
              </div>
              <h4 className="text-lg font-semibold text-emerald-800 mb-3">
                Características:
              </h4>
              <ul className="space-y-2 mb-6">
                {selectedVehicle.features.map((feature, i) => (
                  <li key={i} className="flex items-center text-emerald-700">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full mr-3" />
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