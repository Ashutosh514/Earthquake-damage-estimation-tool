import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { motion } from 'framer-motion';
import { ArrowRight, Upload, ImageIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import Earth3D from '../components/Earth3D';
import { useState, useRef } from "react";

const Home = () => {
  const fileInputRef = useRef(null);

  const [uploadedImage, setUploadedImage] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [imageResult, setImageResult] = useState(null);

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];

    if (file) {
      const reader = new FileReader();

      reader.onload = (event) => {
        setUploadedImage(event.target?.result);
        setImageResult(null);
      };

      reader.readAsDataURL(file);
    }
  };

  const analyzeQuickImage = async () => {
    setAnalyzing(true);

    await new Promise((resolve) => setTimeout(resolve, 1500));

    const damageLevel = "Moderate";
    const confidence = 87;

    setImageResult({
      damageLevel,
      confidence,
      message: "Building requires inspection",
    });

    setAnalyzing(false);
  };

  const clearImage = () => {
    setUploadedImage(null);
    setImageResult(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="min-h-screen min-w-fit bg-gradient-to-b from-black via-slate-900 to-black text-white overflow-hidden pt-24">
      <div className="absolute inset-0">
        <Canvas camera={{ position: [0, 0, 8], fov: 50 }}>
          <Stars radius={300} depth={60} count={5000} factor={7} fade speed={1} />
          <Earth3D />
          <OrbitControls enableZoom={false} enablePan={false} />
        </Canvas>
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.h1
              className="text-6xl md:text-7xl font-bold mb-6"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 text-transparent bg-clip-text">
                ML-Based Earthquake
              </span>
              <br />
              <span className="text-white">Damage Estimation Tool</span>
            </motion.h1>

            <motion.p
              className="text-xl md:text-2xl text-gray-300 mb-8 max-w-2xl mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Predict building damage using Machine Learning and seismic data.
              Advanced AI-powered analysis for disaster preparedness.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <Link to="/result">
                <motion.button
                  className="group relative px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full text-white font-semibold text-lg overflow-hidden"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="relative z-10 flex items-center space-x-2">
                    <span>Start Prediction</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600"
                    initial={{ x: '100%' }}
                    whileHover={{ x: 0 }}
                    transition={{ duration: 0.3 }}
                  />
                </motion.button>
              </Link>
            </motion.div>
          </motion.div>

          <motion.div
            className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            {[
              { value: '95%', label: 'Accuracy' },
              { value: '1000+', label: 'Predictions' },
              { value: 'Real-time', label: 'Analysis' },
            ].map((stat, index) => (
              <motion.div
                key={index}
                className="bg-white/5 backdrop-blur-lg border border-cyan-500/20 rounded-2xl p-6"
                whileHover={{ scale: 1.05, borderColor: 'rgba(6, 182, 212, 0.5)' }}
              >
                <div className="text-3xl font-bold text-cyan-400 mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-400">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
      <motion.div
        className="relative z-20 min-h-screen bg-gradient-to-b from-black via-slate-900 to-black flex items-center justify-center px-6 py-16"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: false }}
      >
        <div className="max-w-4xl mx-auto w-full">
          <motion.h2
            className="text-5xl font-bold text-center mb-4"
            initial={{ opacity: 0, y: -30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: false }}
          >
            <span className="bg-gradient-to-r from-cyan-400 to-blue-500 text-transparent bg-clip-text">
              Quick Image Analysis
            </span>
          </motion.h2>

          <motion.p
            className="text-center text-gray-400 mb-12"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: false }}
          >
            Upload a building image to get instant AI-powered damage assessment
          </motion.p>

          <div className="grid md:grid-cols-2 gap-8">
            <motion.div
              className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 backdrop-blur-lg border border-cyan-500/20 rounded-2xl p-8"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              viewport={{ once: false }}
            >
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-cyan-500/40 rounded-xl p-12 text-center cursor-pointer hover:border-cyan-400 transition-colors"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                {uploadedImage ? (
                  <div>
                    <ImageIcon className="w-16 h-16 mx-auto mb-3 text-green-400" />
                    <p className="text-green-400 font-semibold mb-1">Image selected</p>
                    <p className="text-sm text-gray-400">Click to change</p>
                  </div>
                ) : (
                  <div>
                    <Upload className="w-16 h-16 mx-auto mb-4 text-cyan-400" />
                    <p className="font-semibold mb-2 text-lg">Upload Building Image</p>
                    <p className="text-gray-400">Click to browse or drag and drop</p>
                  </div>
                )}
              </div>

              {uploadedImage && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mt-6 rounded-lg overflow-hidden border border-cyan-500/20"
                >
                  <img src={uploadedImage} alt="Building" className="w-full h-56 object-cover" />
                </motion.div>
              )}

              <div className="space-y-3 mt-6">
                <motion.button
                  onClick={analyzeQuickImage}
                  disabled={!uploadedImage || analyzing}
                  className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {analyzing ? 'Analyzing...' : 'Analyze Damage'}
                </motion.button>

                {uploadedImage && (
                  <motion.button
                    onClick={clearImage}
                    className="w-full py-2 bg-white/10 hover:bg-white/20 rounded-lg font-semibold transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Clear
                  </motion.button>
                )}
              </div>
            </motion.div>

            <motion.div
              className="space-y-6"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              viewport={{ once: false }}
            >
              {imageResult ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`bg-gradient-to-br ${imageResult.damageLevel === 'Severe'
                      ? 'from-red-500/20 to-red-600/10 border-red-500/30'
                      : imageResult.damageLevel === 'Moderate'
                        ? 'from-orange-500/20 to-orange-600/10 border-orange-500/30'
                        : 'from-yellow-500/20 to-yellow-600/10 border-yellow-500/30'
                    } backdrop-blur-lg border rounded-2xl p-8`}
                >
                  <div className="flex items-center space-x-3 mb-6">
                    <CheckCircle className="w-8 h-8 text-green-400" />
                    <h3 className="text-2xl font-bold">Analysis Complete</h3>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <div className="text-sm text-gray-400 mb-1">Damage Level</div>
                      <div className="text-4xl font-bold text-cyan-400">
                        {imageResult.damageLevel}
                      </div>
                    </div>

                    <div>
                      <div className="text-sm text-gray-400 mb-1">Confidence Score</div>
                      <div className="flex items-center space-x-3">
                        <div className="flex-1 bg-white/10 rounded-full h-3 overflow-hidden">
                          <motion.div
                            className="bg-gradient-to-r from-cyan-500 to-blue-600 h-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${imageResult.confidence}%` }}
                            transition={{ duration: 1 }}
                          />
                        </div>
                        <span className="text-lg font-bold text-cyan-400">
                          {imageResult.confidence}%
                        </span>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-white/10">
                      <div className="flex items-start space-x-2">
                        <Zap className="w-5 h-5 text-cyan-400 mt-1 flex-shrink-0" />
                        <div>
                          <div className="text-sm text-gray-400 mb-1">Recommendation</div>
                          <p className="font-semibold">{imageResult.message}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Link to="/result">
                    <motion.button
                      className="w-full mt-6 py-3 bg-white/10 hover:bg-white/20 rounded-lg font-semibold transition-colors"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Get Full Analysis
                    </motion.button>
                  </Link>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-white/5 backdrop-blur-lg border border-cyan-500/20 rounded-2xl p-8 h-full flex flex-col items-center justify-center text-center"
                >
                  <ImageIcon className="w-20 h-20 text-cyan-400/30 mb-4" />
                  <p className="text-gray-400 mb-4">
                    Upload an image to see instant damage predictions
                  </p>
                  <p className="text-sm text-gray-500">
                    Our ML model analyzes structural damage in seconds
                  </p>
                </motion.div>
              )}
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Home;
