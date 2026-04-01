import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapContainer, TileLayer, Circle, Marker, Popup } from 'react-leaflet';
import { MapPin, AlertCircle } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const earthquakeData = [
  { lat: 37.7749, lng: -122.4194, magnitude: 7.2, location: 'San Francisco', risk: 'high' },
  { lat: 35.6762, lng: 139.6503, magnitude: 6.5, location: 'Tokyo', risk: 'medium' },
  { lat: -33.8688, lng: 151.2093, magnitude: 5.8, location: 'Sydney', risk: 'low' },
  { lat: 41.9028, lng: 12.4964, magnitude: 6.8, location: 'Rome', risk: 'medium' },
  { lat: 19.4326, lng: -99.1332, magnitude: 7.5, location: 'Mexico City', risk: 'high' },
];

const Map = () => {
  useEffect(() => {
    document.body.style.overflow = 'auto';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  return (
    <div className="min-h-screen min-w-fit bg-gradient-to-br from-slate-900 via-black to-slate-900 text-white pt-24 pb-16 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.h1
          className="text-5xl font-bold text-center mb-4"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <span className="bg-gradient-to-r from-cyan-400 to-blue-500 text-transparent bg-clip-text">
            Global Earthquake Map
          </span>
        </motion.h1>

        <motion.p
          className="text-center text-gray-400 mb-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Interactive visualization of earthquake impact zones and risk levels
        </motion.p>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {[
            { label: 'High Risk', color: 'bg-red-500', count: 2 },
            { label: 'Medium Risk', color: 'bg-orange-500', count: 2 },
            { label: 'Low Risk', color: 'bg-green-500', count: 1 },
          ].map((item, index) => (
            <motion.div
              key={index}
              className="bg-white/5 backdrop-blur-lg border border-cyan-500/20 rounded-xl p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-400 mb-1">{item.label}</div>
                  <div className="text-3xl font-bold">{item.count}</div>
                </div>
                <div className={`w-4 h-4 rounded-full ${item.color}`} />
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="bg-white/5 mx-6 backdrop-blur-lg border border-cyan-500/20 rounded-2xl overflow-hidden"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="h-[500px] relative">
            <MapContainer
              center={[20, 0]}
              zoom={2}
              style={{ height: '100%', width: '100%' }}
              className="z-0"
            >
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              />

              {earthquakeData.map((quake, index) => (
                <div key={index}>
                  <Circle
                    center={[quake.lat, quake.lng]}
                    radius={quake.magnitude * 50000}
                    pathOptions={{
                      color: quake.risk === 'high' ? '#ef4444' : quake.risk === 'medium' ? '#f97316' : '#22c55e',
                      fillColor: quake.risk === 'high' ? '#ef4444' : quake.risk === 'medium' ? '#f97316' : '#22c55e',
                      fillOpacity: 0.3,
                    }}
                  />
                  <Marker position={[quake.lat, quake.lng]}>
                    <Popup>
                      <div className="text-gray-900">
                        <div className="font-bold text-lg">{quake.location}</div>
                        <div className="text-sm">Magnitude: {quake.magnitude}</div>
                        <div className="text-sm capitalize">Risk: {quake.risk}</div>
                      </div>
                    </Popup>
                  </Marker>
                </div>
              ))}
            </MapContainer>
          </div>
        </motion.div>

        <motion.div
          className="mt-8 grid md:grid-cols-2 gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <div className="bg-white/5 backdrop-blur-lg border border-cyan-500/20 rounded-xl p-6">
            <h3 className="text-xl font-bold mb-4 flex items-center space-x-2">
              <MapPin className="w-5 h-5 text-cyan-400" />
              <span>Recent Seismic Activity</span>
            </h3>
            <div className="space-y-3">
              {earthquakeData.slice(0, 3).map((quake, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <div>
                    <div className="font-semibold">{quake.location}</div>
                    <div className="text-sm text-gray-400">Magnitude {quake.magnitude}</div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    quake.risk === 'high' ? 'bg-red-500/20 text-red-400' :
                    quake.risk === 'medium' ? 'bg-orange-500/20 text-orange-400' :
                    'bg-green-500/20 text-green-400'
                  }`}>
                    {quake.risk.toUpperCase()}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-lg border border-cyan-500/20 rounded-xl p-6">
            <h3 className="text-xl font-bold mb-4 flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-cyan-400" />
              <span>Risk Legend</span>
            </h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 rounded-full bg-red-500" />
                <div>
                  <div className="font-semibold">High Risk</div>
                  <div className="text-sm text-gray-400">Magnitude 7.0+, Immediate action required</div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 rounded-full bg-orange-500" />
                <div>
                  <div className="font-semibold">Medium Risk</div>
                  <div className="text-sm text-gray-400">Magnitude 6.0-6.9, Monitor closely</div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 rounded-full bg-green-500" />
                <div>
                  <div className="font-semibold">Low Risk</div>
                  <div className="text-sm text-gray-400">Magnitude below 6.0, Minimal concern</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Map;
