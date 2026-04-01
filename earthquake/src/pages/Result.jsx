import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Building2, TrendingUp, Shield } from "lucide-react";
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    BarElement,
} from "chart.js";
import { Doughnut, Bar } from "react-chartjs-2";

ChartJS.register(
    ArcElement,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    BarElement
);

const Result = () => {
    const [formData, setFormData] = useState({
        magnitude: "",
        depth: "",
        Time: "",
        buildingAge: "",
        buildingMaterial: "",
        floors: "",
        SoilType: "",
    });

    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [imageFile, setImageFile] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Attempt to call backend prediction API
        setError(null);
        try {
            const payload = {
                magnitude: parseFloat(formData.magnitude) || 0,
                depth: parseFloat(formData.depth) || 0,
                duration: parseFloat(formData.Time) || 0,
                age: parseFloat(formData.buildingAge) || 0,
                material: (formData.buildingMaterial || "").toLowerCase(),
                floors: parseFloat(formData.floors) || 0,
                SoilType: (formData.SoilType || "").toLowerCase(),
                buildingMaterial: (formData.buildingMaterial || "").toLowerCase(),
            };

            const res = await fetch("http://localhost:5000/predict", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            // Handle non-OK responses with useful error shown to the user
            if (!res.ok) {
                let errMsg = `Backend responded ${res.status} ${res.statusText}`;
                try {
                    const errBody = await res.json();
                    if (errBody.error || errBody.message) errMsg = errBody.error || errBody.message;
                    else errMsg = JSON.stringify(errBody);
                } catch (e) {
                    // non-JSON body
                }
                setError(`Backend unavailable. ${errMsg}`);
                setResult(null);
                return;
            }

            const data = await res.json();

            // If backend returned a full result object, use it directly
            if (data && data.damageLevel && data.riskScore) {
                setResult({
                    damageLevel: data.damageLevel,
                    riskScore: data.riskScore,
                    recommendation: data.recommendation,
                    structuralIntegrity: data.structuralIntegrity,
                });
                return;
            }

            // Fallback: if backend returned only a prediction label, map it to UI fields
            if (data && data.prediction) {
                const pred = (data.prediction || "").toString();
                const map = (label) => {
                    const l = label.toLowerCase();
                    if (l.includes("severe") || l.includes("destructive")) return { riskScore: 90, damageLevel: "Severe", recommendation: "Evacuate Area Immediately" };
                    if (l.includes("moderate")) return { riskScore: 70, damageLevel: "Moderate", recommendation: "Monitor Closely and Prepare for Evacuation" };
                    if (l.includes("minor")) return { riskScore: 50, damageLevel: "Minor", recommendation: "Stay Alert and Follow Safety Protocols" };
                    return { riskScore: 20, damageLevel: "Minimal", recommendation: "Continue Normal Operations with Caution" };
                };
                const mapped = map(pred);
                setResult({
                    damageLevel: mapped.damageLevel,
                    riskScore: mapped.riskScore,
                    recommendation: mapped.recommendation,
                    structuralIntegrity: Math.round(100 - mapped.riskScore),
                });
                return;
            }

            // Final fallback: set whatever was returned
            setResult(data);
            return;
        } catch (err) {
            // network or fetch error — surface an error to the UI (no local fallback)
            const msg = err && err.message ? err.message : String(err);
            setError(`Backend unavailable. Please try again later. ${msg}`);
            setResult(null);
            return;
        }
    };

    const handleImageSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (!imageFile) {
            setError("Please select an image before running image prediction.");
            return;
        }

        try {
            const form = new FormData();
            form.append("image", imageFile);

            const res = await fetch("http://localhost:5000/predict-image", {
                method: "POST",
                body: form,
            });

            if (!res.ok) {
                let errMsg = `Backend responded ${res.status} ${res.statusText}`;
                try {
                    const errBody = await res.json();
                    if (errBody.error || errBody.message) errMsg = errBody.error || errBody.message;
                    else errMsg = JSON.stringify(errBody);
                } catch (readErr) {
                    // non-JSON body
                }
                setError(`Image prediction failed. ${errMsg}`);
                setResult(null);
                return;
            }

            const data = await res.json();
            setResult(data);
        } catch (err) {
            const msg = err && err.message ? err.message : String(err);
            setError(`Image prediction failed. ${msg}`);
            setResult(null);
        }
    };

    const doughnutData = result
        ? {
            labels: ["Risk", "Safety"],
            datasets: [
                {
                    data: [result.riskScore, 100 - result.riskScore],
                    backgroundColor: ["#ef4444", "#10b981"],
                    borderWidth: 0,
                },
            ],
        }
        : null;

    const barData = result
        ? {
            labels: ["Structural", "Foundation", "Roof", "Walls"],
            datasets: [
                {
                    label: "Damage Probability (%)",
                    data: [
                        result.riskScore,
                        result.riskScore * 0.8,
                        result.riskScore * 0.9,
                        result.riskScore * 0.85,
                    ],
                    backgroundColor: "rgba(239, 68, 68, 0.8)",
                },
            ],
        }
        : null;

    const probabilityBarData =
        result && result.classProbabilities
            ? {
                labels: Object.keys(result.classProbabilities),
                datasets: [
                    {
                        label: "Class Probability (%)",
                        data: Object.values(result.classProbabilities),
                        backgroundColor: "rgba(56, 189, 248, 0.75)",
                    },
                ],
            }
            : null;

    return (
        <div className="min-h-screen min-w-fit bg-gradient-to-br from-slate-900 via-black to-slate-900 text-white pt-24 pb-16 px-6">
            <div className="max-w-6xl mx-auto">
                <motion.h1
                    className="text-5xl font-bold text-center mb-4"
                    initial={{ opacity: 0, y: -30 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <span className="bg-gradient-to-r from-cyan-400 to-blue-500 text-transparent bg-clip-text">
                        Damage Prediction
                    </span>
                </motion.h1>

                <motion.p
                    className="text-center text-gray-400 mb-12"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    Enter earthquake and building parameters to estimate potential damage
                </motion.p>

                <div className="grid md:grid-cols-2 gap-8">
                    <motion.div
                        className="bg-white/5 backdrop-blur-lg border border-cyan-500/20 rounded-2xl p-8"
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <h2 className="text-2xl font-bold mb-6 flex items-center space-x-2">
                            <Building2 className="w-6 h-6 text-cyan-400" />
                            <span>Input Parameters</span>
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Earthquake Magnitude (Richter Scale)
                                </label>
                                <input
                                    type="number"
                                    step="0.1"
                                    required
                                    value={formData.magnitude}
                                    onChange={(e) => setFormData({ ...formData, magnitude: e.target.value })}
                                    className="w-full px-4 py-3 bg-white/10 border border-cyan-500/30 rounded-lg focus:outline-none focus:border-cyan-400 transition-colors"
                                    placeholder="e.g., 7.5"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Depth (km)
                                </label>
                                <input
                                    type="number"
                                    step="1"
                                    required
                                    value={formData.depth}
                                    onChange={(e) => setFormData({ ...formData, depth: e.target.value })}
                                    className="w-full px-4 py-3 bg-white/10 border border-cyan-500/30 rounded-lg focus:outline-none focus:border-cyan-400 transition-colors"
                                    placeholder="e.g., 10"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Duration (sec)
                                </label>
                                <input
                                    type="number"
                                    step="0.1"
                                    required
                                    value={formData.Time}
                                    onChange={(e) => setFormData({ ...formData, Time: e.target.value })}
                                    className="w-full px-4 py-3 bg-white/10 border border-cyan-500/30 rounded-lg focus:outline-none focus:border-cyan-400 transition-colors"
                                    placeholder="time = 0.00"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Building Age (years)
                                </label>
                                <input
                                    type="number"
                                    required
                                    value={formData.buildingAge}
                                    onChange={(e) => setFormData({ ...formData, buildingAge: e.target.value })}
                                    className="w-full px-4 py-3 bg-white/10 border border-cyan-500/30 rounded-lg focus:outline-none focus:border-cyan-400 transition-colors"
                                    placeholder="e.g., 25"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Building Material
                                </label>
                                <select
                                    required
                                    value={formData.buildingMaterial}
                                    onChange={(e) =>
                                        setFormData({ ...formData, buildingMaterial: e.target.value })
                                    }
                                    className="w-full px-4 py-3 bg-white/10 text-white border border-cyan-500/30 rounded-lg focus:outline-none focus:border-cyan-400 transition-colors"
                                >
                                    <option value="" hidden className="bg-slate-900 text-white">
                                        Select material
                                    </option>
                                    <option value="concrete" className="bg-slate-900 text-white">
                                        Concrete
                                    </option>
                                    <option value="steel" className="bg-slate-900 text-white">
                                        Steel
                                    </option>
                                    <option value="wood" className="bg-slate-900 text-white">
                                        Wood
                                    </option>
                                    <option value="brick" className="bg-slate-900 text-white">
                                        Brick
                                    </option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Number of Floors
                                </label>
                                <input
                                    type="number"
                                    required
                                    value={formData.floors}
                                    onChange={(e) => setFormData({ ...formData, floors: e.target.value })}
                                    className="w-full px-4 py-3 bg-white/10 border border-cyan-500/30 rounded-lg focus:outline-none focus:border-cyan-400 transition-colors"
                                    placeholder="e.g., 5"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Soil Type
                                </label>
                                <select
                                    required
                                    value={formData.SoilType}
                                    onChange={(e) =>
                                        setFormData({ ...formData, SoilType: e.target.value })
                                    }
                                    className="w-full px-4 py-3 bg-white/10 text-white border border-cyan-500/30 rounded-lg focus:outline-none focus:border-cyan-400 transition-colors"
                                >
                                    <option value="" hidden>
                                        Select Soil
                                    </option>
                                    <option value="hard" className="bg-slate-900 text-white">
                                        Hard Soil (e.g.Bedrock,Gravel Soil)
                                    </option>
                                    <option value="soft" className="bg-slate-900 text-white">
                                        Soft Soil (e.g.Clay Soil,Sandy Soil)
                                    </option>
                                </select>
                            </div>




                            <motion.button
                                type="submit"
                                className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg font-semibold text-lg"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                Calculate Damage Risk
                            </motion.button>
                        </form>

                        <div className="my-8 border-t border-white/10" />

                        <form onSubmit={handleImageSubmit} className="space-y-4">
                            <h3 className="text-xl font-bold text-cyan-300">Image-Based Prediction</h3>
                            <p className="text-sm text-gray-400">
                                Upload a building damage image to predict damage level with the trained image model.
                            </p>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => setImageFile(e.target.files && e.target.files[0] ? e.target.files[0] : null)}
                                className="w-full px-4 py-3 bg-white/10 border border-cyan-500/30 rounded-lg text-sm"
                            />
                            <motion.button
                                type="submit"
                                className="w-full py-3 bg-gradient-to-r from-purple-500 to-fuchsia-600 rounded-lg font-semibold"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                Predict Damage from Image
                            </motion.button>
                        </form>
                    </motion.div>

                    <div>
                        <AnimatePresence mode="wait">
                            {error ? (
                                <motion.div
                                    key="error"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="h-full flex items-center justify-center bg-white/5 backdrop-blur-lg border border-red-500/20 rounded-2xl p-12"
                                >
                                    <div className="text-center text-red-300">
                                        <AlertTriangle className="w-16 h-16 mx-auto mb-4 opacity-80 text-red-400" />
                                        <p className="text-lg font-semibold">{error}</p>
                                        <p className="text-sm text-gray-400 mt-2">Ensure the backend is running on port 5000.</p>
                                    </div>
                                </motion.div>
                            ) : result ? (
                                <motion.div
                                    key="result"
                                    initial={{ opacity: 0, x: 50 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -50 }}
                                    className="space-y-6"
                                >
                                    <div className={`bg-gradient-to-br ${result.riskScore >= 80 ? 'from-red-500/20 to-red-600/10 border-red-500/30' :
                                        result.riskScore >= 60 ? 'from-orange-500/20 to-orange-600/10 border-orange-500/30' :
                                            result.riskScore >= 40 ? 'from-yellow-500/20 to-yellow-600/10 border-yellow-500/30' :
                                                'from-green-500/20 to-green-600/10 border-green-500/30'
                                        } backdrop-blur-lg border rounded-2xl p-8`}>
                                        <div className="flex items-center space-x-3 mb-6">
                                            <AlertTriangle className="w-8 h-8 text-red-400" />
                                            <h2 className="text-2xl font-bold">Prediction Results</h2>
                                        </div>

                                        <div className="space-y-4">
                                            <div>
                                                <div className="text-sm text-gray-400 mb-1">Damage Level</div>
                                                <div className="text-3xl font-bold text-cyan-400">{result.damageLevel}</div>
                                            </div>

                                            {result.source && (
                                                <div>
                                                    <div className="text-sm text-gray-400 mb-1">Prediction Source</div>
                                                    <div className="text-lg font-semibold text-purple-300 capitalize">{result.source}</div>
                                                </div>
                                            )}

                                            <div>
                                                <div className="text-sm text-gray-400 mb-1">Risk Score</div>
                                                <div className="text-3xl font-bold text-red-400">{result.riskScore}%</div>
                                            </div>

                                            <div>
                                                <div className="text-sm text-gray-400 mb-1">Structural Integrity</div>
                                                <div className="text-3xl font-bold text-green-400">{result.structuralIntegrity}%</div>
                                            </div>

                                            <div className="pt-4 border-t border-white/10">
                                                <div className="flex items-start space-x-3">
                                                    <Shield className="w-6 h-6 text-cyan-400 mt-1" />
                                                    <div>
                                                        <div className="text-sm text-gray-400 mb-1">Safety Recommendation</div>
                                                        <div className="text-lg font-semibold">{result.recommendation}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-white/5 backdrop-blur-lg border border-cyan-500/20 rounded-2xl p-6">
                                        <h3 className="text-xl font-bold mb-4 flex items-center space-x-2">
                                            <TrendingUp className="w-5 h-5 text-cyan-400" />
                                            <span>Risk Distribution</span>
                                        </h3>
                                        <div className="h-64">
                                            {doughnutData && <Doughnut data={doughnutData} options={{ maintainAspectRatio: false }} />}
                                        </div>
                                    </div>

                                    <div className="bg-white/5 backdrop-blur-lg border border-cyan-500/20 rounded-2xl p-6">
                                        <h3 className="text-xl font-bold mb-4">Component Analysis</h3>
                                        <div className="h-64">
                                            {barData && <Bar data={barData} options={{ maintainAspectRatio: false }} />}
                                        </div>
                                    </div>

                                    {probabilityBarData && (
                                        <div className="bg-white/5 backdrop-blur-lg border border-purple-500/20 rounded-2xl p-6">
                                            <h3 className="text-xl font-bold mb-4 text-purple-300">Image Damage Class Probabilities</h3>
                                            <div className="h-72">
                                                <Bar data={probabilityBarData} options={{ maintainAspectRatio: false }} />
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="placeholder"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="h-full flex items-center justify-center bg-white/5 backdrop-blur-lg border border-cyan-500/20 rounded-2xl p-12"
                                >
                                    <div className="text-center text-gray-400">
                                        <Building2 className="w-16 h-16 mx-auto mb-4 opacity-50" />
                                        <p>Enter parameters and submit to see prediction results</p>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Result;