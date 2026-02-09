import { Link } from 'react-router-dom';
import Hero from '../components/Hero';
import { motion } from 'framer-motion';
import { Clock, Truck, ChefHat, ChevronRight } from 'lucide-react';

export default function Home() {
    return (
        <div>
            <Hero />

            {/* Features Section */}
            <section className="py-20 bg-background relative overflow-hidden">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { icon: <Clock className="w-10 h-10 text-primary" />, title: "30 Min Delivery", desc: "Hot and fresh, right to your door." },
                            { icon: <ChefHat className="w-10 h-10 text-primary" />, title: "Master Chefs", desc: "Curated by award-winning culinary experts." },
                            { icon: <Truck className="w-10 h-10 text-primary" />, title: "Live Tracking", desc: "Follow your food's journey in real-time." },
                        ].map((feature, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.2 }}
                                viewport={{ once: true }}
                                className="bg-white dark:bg-surface p-8 rounded-2xl border border-gray-100 dark:border-white/5 hover:border-primary/30 transition-colors shadow-lg dark:shadow-none group"
                            >
                                <div className="mb-4 bg-primary/10 w-fit p-4 rounded-full group-hover:bg-primary/20 transition-colors">
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-bold font-serif mb-2 text-gray-900 dark:text-white">{feature.title}</h3>
                                <p className="text-gray-600 dark:text-gray-400">{feature.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Intro Section */}
            <section className="py-20 bg-white dark:bg-surface/50 border-y border-gray-100 dark:border-white/5">
                <div className="container mx-auto px-4 flex flex-col md:flex-row items-center gap-12">
                    <div className="flex-1 space-y-6">
                        <span className="text-primary font-bold tracking-widest uppercase text-sm">Our Story</span>
                        <h2 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 dark:text-white">Crafting Health, <br /> One Bowl at a Time</h2>
                        <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-lg">
                            At Healthy Bowl, we believe that food is nourishment for body and soul.
                            Our chefs meticulously blend ancient Indian traditions with modern techniques to create
                            dishes that are visually stunning and exploding with flavor.
                        </p>
                        <Link to="/locations" className="text-primary font-bold hover:text-gray-900 dark:hover:text-white transition-colors flex items-center gap-2">
                            Read Our Story <ChevronRight size={16} />
                        </Link>
                    </div>
                    <div className="flex-1 relative">
                        <div className="aspect-video rounded-2xl overflow-hidden border border-gray-200 dark:border-white/5">
                            <img
                                src="/website menu images/paneer butter masala.jpg"
                                alt="Healthy Bowl cuisine"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="absolute -bottom-4 -right-4 w-32 h-32 rounded-2xl overflow-hidden border-2 border-primary/50 shadow-xl">
                            <img
                                src="/website menu images/Chicken Dum Biryani.jpg"
                                alt="Featured dish"
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
