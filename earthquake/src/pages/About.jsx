import { motion } from 'framer-motion';
import { Brain, Database, Zap, Shield, Globe, Activity } from 'lucide-react';

const About = () => {
  const features = [
    {
      icon: Brain,
      title: 'Machine Learning',
      description: 'Advanced ML algorithms analyze seismic data patterns to predict building damage with high accuracy.',
    },
    {
      icon: Database,
      title: 'Big Data Analysis',
      description: 'Process massive datasets of historical earthquake data and building characteristics.',
    },
    {
      icon: Zap,
      title: 'Real-time Processing',
      description: 'Instant predictions and analysis powered by optimized computational models.',
    },
    {
      icon: Shield,
      title: 'Safety First',
      description: 'Prioritizing public safety with reliable predictions and actionable recommendations.',
    },
  ];

  const technologies = [
    { name: 'React.js', category: 'Frontend Framework' },
    { name: 'Three.js', category: '3D Graphics' },
    { name: 'React Three Fiber', category: '3D Rendering' },
    { name: 'Framer Motion', category: 'Animation' },
    { name: 'Tailwind CSS', category: 'Styling' },
    { name: 'Leaflet.js', category: 'Mapping' },
    { name: 'Chart.js', category: 'Data Visualization' },
    { name: 'TensorFlow', category: 'Machine Learning' },
  ];

  return (
    <div className="min-h-screen min-w-fit bg-gradient-to-br from-slate-900 via-black to-slate-900 text-white pt-24 pb-16 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.h1
          className="text-5xl font-bold text-center mb-4"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <span className="bg-gradient-to-r from-cyan-400 to-blue-500 text-transparent bg-clip-text">
            About the Project
          </span>
        </motion.h1>

        <motion.p
          className="text-center text-gray-400 mb-16 max-w-3xl mx-auto text-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Leveraging cutting-edge technology to predict and assess earthquake damage,
          helping communities prepare and respond to seismic events effectively.
        </motion.p>

        <motion.div
          className="bg-white/5 backdrop-blur-lg border border-cyan-500/20 rounded-2xl p-12 mb-16"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-start space-x-4 mb-6">
            <Globe className="w-12 h-12 text-cyan-400 flex-shrink-0" />
            <div>
              <h2 className="text-3xl mx-auto font-bold mb-4">What the System Does</h2>
              <p className="text-gray-300 mx-auto text-lg leading-relaxed">
                Our ML-Based Earthquake Damage Estimation Tool combines advanced machine learning
                algorithms with comprehensive seismic data analysis to predict potential building
                damage during earthquakes. The system processes multiple parameters including
                earthquake magnitude, depth, building characteristics, and historical data to
                generate accurate risk assessments and safety recommendations.
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-3xl font-bold mb-8 flex items-center space-x-3">
            <Activity className="w-8 h-8 text-cyan-400" />
            <span>How Machine Learning Predicts Damage</span>
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white/5 backdrop-blur-lg border border-cyan-500/20 rounded-xl p-8">
              <div className="text-cyan-400 font-bold text-lg mb-4">1. Data Collection</div>
              <p className="text-gray-300">
                Gather seismic parameters, building characteristics, and historical earthquake data
                from multiple reliable sources.
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-lg border border-cyan-500/20 rounded-xl p-8">
              <div className="text-cyan-400 font-bold text-lg mb-4">2. Feature Engineering</div>
              <p className="text-gray-300">
                Extract and transform relevant features like magnitude, depth, building age,
                material composition, and structural design.
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-lg border border-cyan-500/20 rounded-xl p-8">
              <div className="text-cyan-400 font-bold text-lg mb-4">3. Model Training</div>
              <p className="text-gray-300">
                Train neural networks on thousands of historical earthquake-building damage
                correlations to identify patterns and relationships.
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-lg border border-cyan-500/20 rounded-xl p-8">
              <div className="text-cyan-400 font-bold text-lg mb-4">4. Prediction & Assessment</div>
              <p className="text-gray-300">
                Generate real-time damage predictions with confidence scores and actionable
                safety recommendations for emergency response.
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h2 className="text-3xl font-bold mb-8 text-center">Core Features</h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 backdrop-blur-lg border border-cyan-500/20 rounded-xl p-6 hover:border-cyan-400/50 transition-all"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                whileHover={{ scale: 1.05 }}
              >
                <feature.icon className="w-12 h-12 text-cyan-400 mb-4" />
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-gray-400 text-sm">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <h2 className="text-3xl font-bold mb-8 text-center">Technologies Used</h2>

          <div className="bg-white/5 backdrop-blur-lg border border-cyan-500/20 rounded-2xl p-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {technologies.map((tech, index) => (
                <motion.div
                  key={index}
                  className="bg-gradient-to-br from-cyan-500/5 to-blue-500/5 border border-cyan-500/10 rounded-lg p-4 hover:border-cyan-400/30 transition-all"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8 + index * 0.05 }}
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="font-bold text-cyan-400 mb-1">{tech.name}</div>
                  <div className="text-xs text-gray-500">{tech.category}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default About;
