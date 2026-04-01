import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, User, MessageSquare, Send, CheckCircle } from 'lucide-react';

const Contact = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: '',
    });

    const [errors, setErrors] = useState({
        name: '',
        email: '',
        message: '',
    });

    const [submitted, setSubmitted] = useState(false);

    const validateEmail = (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

    const newErrors = {
        name: '',
        email: '',
        message: '',
    };

    if (!formData.name.trim()) {
        newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
        newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
        newErrors.email = 'Please enter a valid email';
    }

    if (!formData.message.trim()) {
        newErrors.message = 'Message is required';
    } else if (formData.message.trim().length < 10) {
        newErrors.message = 'Message must be at least 10 characters';
    }

    setErrors(newErrors);

    if (!newErrors.name && !newErrors.email && !newErrors.message) {
        setSubmitted(true);
        setTimeout(() => {
            setSubmitted(false);
            setFormData({ name: '', email: '', message: '' });
        }, 3000);
    }
};

return (
    <div className="min-h-screen min-w-fit bg-gradient-to-br from-slate-900 via-black to-slate-900 text-white pt-24 pb-16 px-6">
        <div className="max-w-4xl mx-auto">
            <motion.h1
                className="text-5xl font-bold text-center mb-4"
                initial={{ opacity: 0, y: -30 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <span className="bg-gradient-to-r from-cyan-400 to-blue-500 text-transparent bg-clip-text">
                    Contact Us
                </span>
            </motion.h1>

            <motion.p
                className="text-center text-gray-400 mb-12 text-lg"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
            >
                Have questions or feedback? We'd love to hear from you.
            </motion.p>

            <div className="grid md:grid-cols-2 gap-8">
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <div className="bg-white/5 backdrop-blur-lg border border-cyan-500/20 rounded-2xl p-8 h-full">
                        <h2 className="text-2xl font-bold mb-6">Get in Touch</h2>
                        <p className="text-gray-300 mb-8">
                            Whether you have questions about our earthquake prediction system, need technical
                            support, or want to collaborate, our team is here to help.
                        </p>

                        <div className="space-y-6">
                            <div className="flex items-start space-x-4">
                                <Mail className="w-6 h-6 text-cyan-400 mt-1" />
                                <div>
                                    <div className="font-semibold mb-1">Email</div>
                                    <div className="text-gray-400">ashutoshfzl12@gmail.com</div>
                                </div>
                            </div>

                            <div className="flex items-start space-x-4">
                                <MessageSquare className="w-6 h-6 text-cyan-400 mt-1" />
                                <div>
                                    <div className="font-semibold mb-1">Support</div>
                                    <div className="text-gray-400">Available 24/7 for emergency inquiries</div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 pt-8 border-t border-white/10">
                            <h3 className="font-semibold mb-4">Quick Response Time</h3>
                            <p className="text-gray-400 text-sm">
                                We typically respond to all inquiries within 24 hours. For urgent matters
                                related to active seismic events, we provide immediate assistance.
                            </p>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <div className="bg-white/5 backdrop-blur-lg border border-cyan-500/20 rounded-2xl p-8">
                        {submitted ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="flex flex-col items-center justify-center h-full py-12"
                            >
                                <CheckCircle className="w-20 h-20 text-green-400 mb-6" />
                                <h3 className="text-2xl font-bold mb-2">Message Sent!</h3>
                                <p className="text-gray-400 text-center">
                                    Thank you for reaching out. We'll get back to you soon.
                                </p>
                            </motion.div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="relative">
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Name
                                    </label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className={`w-full pl-12 pr-4 py-3 bg-white/10 border rounded-lg focus:outline-none transition-all ${errors.name
                                                    ? 'border-red-500 focus:border-red-400'
                                                    : 'border-cyan-500/30 focus:border-cyan-400'
                                                }`}
                                            placeholder="Your name"
                                        />
                                    </div>
                                    {errors.name && (
                                        <motion.p
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="text-red-400 text-sm mt-1"
                                        >
                                            {errors.name}
                                        </motion.p>
                                    )}
                                </div>

                                <div className="relative">
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Email
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className={`w-full pl-12 pr-4 py-3 bg-white/10 border rounded-lg focus:outline-none transition-all ${errors.email
                                                    ? 'border-red-500 focus:border-red-400'
                                                    : 'border-cyan-500/30 focus:border-cyan-400'
                                                }`}
                                            placeholder="your.email@example.com"
                                        />
                                    </div>
                                    {errors.email && (
                                        <motion.p
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="text-red-400 text-sm mt-1"
                                        >
                                            {errors.email}
                                        </motion.p>
                                    )}
                                </div>

                                <div className="relative">
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Message
                                    </label>
                                    <div className="relative">
                                        <MessageSquare className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
                                        <textarea
                                            value={formData.message}
                                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                            rows={5}
                                            className={`w-full pl-12 pr-4 py-3 bg-white/10 border rounded-lg focus:outline-none transition-all resize-none ${errors.message
                                                    ? 'border-red-500 focus:border-red-400'
                                                    : 'border-cyan-500/30 focus:border-cyan-400'
                                                }`}
                                            placeholder="Your message..."
                                        />
                                    </div>
                                    {errors.message && (
                                        <motion.p
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="text-red-400 text-sm mt-1"
                                        >
                                            {errors.message}
                                        </motion.p>
                                    )}
                                </div>

                                <motion.button
                                    type="submit"
                                    className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg font-semibold text-lg flex items-center justify-center space-x-2"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <span>Send Message</span>
                                    <Send className="w-5 h-5" />
                                </motion.button>
                            </form>
                        )}
                    </div>
                </motion.div>
            </div>

            <motion.div
                className="mt-12 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 backdrop-blur-lg border border-cyan-500/20 rounded-2xl p-8"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
            >
                <h3 className="text-2xl font-bold mb-4 text-center">Emergency Response</h3>
                <p className="text-gray-300 text-center max-w-2xl mx-auto">
                    For immediate assistance during active seismic events or urgent safety concerns,
                    please contact your local emergency services. Our system provides predictive analysis
                    and should not replace official emergency protocols.
                </p>
            </motion.div>
        </div>
    </div>
);
};

export default Contact;
