#🌍 Earthquake Damage Prediction System

An AI-assisted web application that predicts potential building damage after an earthquake using structural and seismic parameters. The system analyzes earthquake magnitude, depth, duration, soil type, and building characteristics to estimate risk levels and provide safety recommendations.

This project aims to support disaster management, urban planning, and emergency response teams by providing quick damage assessments through an interactive and visual dashboard.

🚀 Features
📊 Earthquake Damage Prediction based on multiple parameters
🏢 Building Structural Analysis (age, floors, materials)
🌱 Soil Type Impact Evaluation (soft vs hard soil)
📈 Interactive Charts & Risk Visualization
🖼 Image Upload for Quick Damage Inspection
🗺 Global Earthquake Map Visualization
⚡ Modern UI with Smooth Animations
🧠 Prediction Parameters

The system calculates a Risk Score using the following inputs:

Earthquake Magnitude
Earthquake Depth
Earthquake Duration
Soil Type
Building Age
Number of Floors
Building Material

The model outputs:

Damage Level (Minimal / Minor / Moderate / Severe)
Risk Score (%)
Structural Integrity
Safety Recommendations
🛠 Technologies Used
Frontend
React.js
Tailwind CSS
Framer Motion
Lucide React Icons
Data Visualization
Chart.js
React Chart.js
Map Visualization
Leaflet.js
React Leaflet
Image Processing (Simulation)
Image upload and quick inspection module
📊 Risk Calculation Logic

The system calculates the damage risk using a weighted formula based on earthquake and building parameters.

Example:

Risk Score =
(Magnitude × 10)
+ (Building Age × 0.5)
+ (Floors × 2)
- (Depth × 0.5)
+ (Soil Factor × 8)
+ (Duration × 1.5)

The final score is normalized between 0–100.

🎯 Project Goal

The goal of this project is to:

Provide quick earthquake damage estimation
Help disaster response teams make faster decisions
Demonstrate how AI and web technology can assist disaster management
🔮 Future Improvements
Integration with real-time earthquake data APIs (USGS)
Machine Learning model for damage prediction
Satellite image analysis
Real-time earthquake alerts
Mobile application support


                                            👨‍💻 Author

                                            Ashutosh Kumar
                                 Computer Science Engineering Student
                                 Babu Banarasi Das University, Lucknow
