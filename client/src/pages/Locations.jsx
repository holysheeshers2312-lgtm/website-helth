import { MapPin, Phone, Clock } from 'lucide-react';

export default function Locations() {
    return (
        <div className="min-h-screen bg-background py-10">
            <div className="container mx-auto px-4">
                <h1 className="text-4xl font-serif font-bold mb-8 text-center">Our Locations</h1>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Map Placeholder */}
                    <div className="bg-surface rounded-2xl overflow-hidden border border-white/5 h-[400px] relative group">
                        {/* If we had an API key, Google Maps would go here. Using an iframe for now. */}
                        <iframe
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d124412.7231464972!2d77.51656885!3d12.979693!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae1670c9b44e6d%3A0xf8dfc3e8517e4fe0!2sBengaluru%2C%20Karnataka!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
                            width="100%"
                            height="100%"
                            style={{ border: 0 }}
                            allowFullScreen=""
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            className="grayscale group-hover:grayscale-0 transition-all duration-500"
                        ></iframe>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-surface p-6 rounded-2xl border border-white/5 hover:border-primary/50 transition-colors">
                            <h2 className="text-2xl font-serif font-bold mb-2">Indiranagar Flagship</h2>
                            <div className="space-y-3 text-gray-400">
                                <p className="flex items-center gap-2"><MapPin size={18} className="text-primary" /> 12th Main Rd, Indiranagar, Bengaluru</p>
                                <p className="flex items-center gap-2"><Phone size={18} className="text-primary" /> +91 80 4455 6677</p>
                                <p className="flex items-center gap-2"><Clock size={18} className="text-primary" /> 11:00 AM - 11:00 PM</p>
                            </div>
                        </div>

                        <div className="bg-surface p-6 rounded-2xl border border-white/5 hover:border-primary/50 transition-colors">
                            <h2 className="text-2xl font-serif font-bold mb-2">Koramangala Branch</h2>
                            <div className="space-y-3 text-gray-400">
                                <p className="flex items-center gap-2"><MapPin size={18} className="text-primary" /> 5th Block, Koramangala, Bengaluru</p>
                                <p className="flex items-center gap-2"><Phone size={18} className="text-primary" /> +91 80 2233 4455</p>
                                <p className="flex items-center gap-2"><Clock size={18} className="text-primary" /> 11:30 AM - 11:30 PM</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
