import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, ShoppingBag, XCircle } from 'lucide-react';
import { useCartStore } from '../cart/cartStore';
import { cn } from '../../lib/utils';
import { MENU_IMAGE_OVERRIDES } from './imageOverrides';

export default function MenuCard({ item }) {
    const { items, addItem, removeItem, updateQuantity } = useCartStore();

    const cartItem = items.find((i) => i.id === item.id);
    const quantity = cartItem ? cartItem.quantity : 0;
    const isAvailable = item.isAvailable !== false; // Default to true if not specified

    const handleCreate = (e) => {
        e.stopPropagation();
        if (isAvailable) {
            addItem(item);
        }
    };

    const increment = (e) => {
        e.stopPropagation();
        if (isAvailable) {
            addItem(item);
        }
    };

    const decrement = (e) => {
        e.stopPropagation();
        if (quantity > 1) {
            updateQuantity(item.id, quantity - 1);
        } else {
            removeItem(item.id);
        }
    };

    const imageSrc = MENU_IMAGE_OVERRIDES[item.name] ?? item.image;

    return (
        <motion.div
            layout
            className={cn(
                "rounded-3xl overflow-hidden group relative transition-all duration-500",
                quantity > 0
                    ? "bg-surface shadow-[0_10px_40px_-10px_rgba(255,69,0,0.3)] ring-1 ring-primary transform -translate-y-2 scale-[1.02]"
                    : "bg-white/5 border border-white/5 hover:border-primary/30 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-2"
            )}
        >
            <div className="relative h-64 overflow-hidden">
                <img
                    src={imageSrc}
                    alt={item.name}
                    className={cn(
                        "w-full h-full object-cover transition-transform duration-700 will-change-transform",
                        quantity > 0 ? "scale-110 saturate-150" : "group-hover:scale-110 group-hover:saturate-150"
                    )}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />

                <div className="absolute top-4 right-4 z-10">
                    <AnimatePresence>
                        {quantity > 0 && (
                            <motion.div
                                initial={{ scale: 0, rotate: -20 }}
                                animate={{ scale: 1, rotate: 0 }}
                                exit={{ scale: 0 }}
                                className="bg-gradient-to-r from-primary to-accent text-background text-xs font-black px-4 py-1.5 rounded-full flex items-center gap-1 shadow-lg shadow-primary/40"
                            >
                                <ShoppingBag size={14} fill="currentColor" /> {quantity} IN CART
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="absolute bottom-4 left-4 z-10 flex gap-2">
                    {item.isVegetarian !== false ? (
                        <span className="bg-green-500/80 backdrop-blur-xl border border-green-400/50 text-white text-[10px] uppercase tracking-widest font-bold px-3 py-1 rounded-full">
                            Veg
                        </span>
                    ) : (
                        <span className="bg-red-500/80 backdrop-blur-xl border border-red-400/50 text-white text-[10px] uppercase tracking-widest font-bold px-3 py-1 rounded-full">
                            Non-Veg
                        </span>
                    )}
                </div>
                {!isAvailable && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-20">
                        <div className="bg-red-500/90 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2">
                            <XCircle size={20} /> Out of Stock
                        </div>
                    </div>
                )}
            </div>

            <div className="p-6 flex flex-col relative">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="text-2xl font-black font-serif text-white leading-none group-hover:text-primary transition-colors duration-300">{item.name}</h3>
                </div>

                <div className="flex items-center gap-2 mb-4">
                    <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">₹{item.price}</span>
                    {item.price > 400 && <span className="bg-primary/20 text-primary text-[10px] px-2 py-0.5 rounded font-bold">BESTSELLER</span>}
                    {!isAvailable && <span className="bg-red-500/20 text-red-400 text-[10px] px-2 py-0.5 rounded font-bold">OUT OF STOCK</span>}
                </div>

                <p className="text-gray-400 text-sm mb-6 line-clamp-2 leading-relaxed">{item.description}</p>

                <div className="mt-auto relative z-20">
                    <AnimatePresence mode='wait'>
                        {!isAvailable ? (
                            <motion.button
                                disabled
                                className="w-full py-4 rounded-xl font-bold text-gray-500 bg-gray-800/50 cursor-not-allowed relative overflow-hidden"
                            >
                                <span className="relative flex items-center justify-center gap-2">
                                    <XCircle size={20} /> Out of Stock
                                </span>
                            </motion.button>
                        ) : quantity === 0 ? (
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleCreate}
                                className="w-full py-4 rounded-xl font-bold text-white relative overflow-hidden group/btn"
                            >
                                <div className="absolute inset-0 bg-white/10 group-hover/btn:bg-primary transition-colors duration-300" />
                                <div className="absolute inset-0 opacity-0 group-hover/btn:opacity-100 bg-gradient-to-r from-primary to-accent transition-opacity duration-300" />
                                <span className="relative flex items-center justify-center gap-2">
                                    <Plus size={20} /> Add to Cart
                                </span>
                            </motion.button>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="flex items-center justify-between bg-black/40 backdrop-blur-md border border-primary/50 rounded-xl p-1.5"
                            >
                                <button
                                    onClick={decrement}
                                    className="w-10 h-10 flex items-center justify-center rounded-lg text-white hover:bg-white/10 transition-colors active:scale-90"
                                >
                                    <Minus size={20} />
                                </button>
                                <motion.div
                                    key={quantity}
                                    initial={{ scale: 1.5 }}
                                    animate={{ scale: 1 }}
                                    className="font-black text-xl text-primary w-8 text-center"
                                >
                                    {quantity}
                                </motion.div>
                                <button
                                    onClick={increment}
                                    className="w-10 h-10 flex items-center justify-center bg-primary text-background rounded-lg hover:bg-accent transition-colors active:scale-90 shadow-lg shadow-primary/20"
                                >
                                    <Plus size={20} />
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </motion.div>
    );
}
