import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

export default function Hero() {
    return (
        <section className="relative h-[90vh] flex items-center justify-center overflow-hidden">
            {/* Background with overlay */}
            <div className="absolute inset-0 z-0">
                <img
                    src="hero_bg.png"
                    alt="Modern Indian Cuisine"
                    className="w-full h-full object-cover scale-110 animate-slow-spin opacity-80"
                    style={{ animationDuration: '60s' }} // Very slow rotation/zoom effect simulated
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
                <div className="absolute inset-0 bg-black/40 mix-blend-multiply" />
            </div>

            {/* Content */}
            <div className="container mx-auto px-4 z-10 text-center relative">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 50 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ type: "spring", duration: 1.2, bounce: 0.3 }}
                >
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="inline-block px-6 py-2 rounded-full border border-primary/30 bg-primary/10 backdrop-blur-md mb-6"
                    >
                        <span className="text-primary tracking-widest text-sm font-bold uppercase drop-shadow-[0_0_10px_rgba(255,69,0,0.5)]">
                            Taste the Fire
                        </span>
                    </motion.div>

                    <h1 className="text-6xl md:text-8xl font-serif font-black text-white mb-6 leading-tight drop-shadow-2xl">
                        Modern India <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 animate-pulse">On A Plate</span>
                    </h1>

                    <p className="text-gray-300 text-lg md:text-2xl max-w-3xl mx-auto mb-12 font-light leading-relaxed">
                        Where <span className="text-accent font-medium">tradition</span> meets <span className="text-primary font-medium">rebellion</span>.
                        Experience flavors that explode and aesthetics that mesmerize.
                    </p>

                    <div className="flex flex-col md:flex-row gap-6 justify-center items-center">
                        <Link
                            to="/menu"
                            className="group relative px-8 py-4 bg-primary rounded-full overflow-hidden shadow-[0_0_20px_rgba(255,69,0,0.4)] hover:shadow-[0_0_40px_rgba(255,69,0,0.6)] transition-all"
                        >
                            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                            <span className="relative font-bold text-xl text-white flex items-center gap-2">
                                Order Now <ChevronRight className="group-hover:translate-x-1 transition-transform" />
                            </span>
                        </Link>

                        <Link
                            to="/locations"
                            className="px-8 py-4 rounded-full border border-white/20 hover:border-white/50 bg-white/5 backdrop-blur-sm text-lg font-medium transition-all hover:bg-white/10"
                        >
                            View Locations
                        </Link>
                    </div>
                </motion.div>
            </div>

            {/* Scroll indicator */}
            <motion.div
                className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10"
                animate={{ y: [0, 10, 0] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
            >
                <div className="w-[1px] h-16 bg-gradient-to-b from-transparent via-primary to-transparent" />
            </motion.div>
        </section>
    );
}
