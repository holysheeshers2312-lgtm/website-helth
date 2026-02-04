import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, CheckCircle, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Support() {
    const [step, setStep] = useState('identification'); // identification -> select-order -> category -> details -> success
    const [formData, setFormData] = useState({ category: '', orderId: '', details: '', phone: '' });
    const [ticketId, setTicketId] = useState(null);
    const [userOrders, setUserOrders] = useState([]);

    const fetchOrders = async () => {
        if (!formData.phone) return;
        try {
            const res = await fetch(`/api/orders?phone=${formData.phone}`);
            const data = await res.json();
            setUserOrders(data);
            setStep('select-order');
        } catch (e) {
            console.error(e);
        }
    };

    const categories = ['Late Delivery', 'Missing Item', 'Quality Issue', 'Other'];

    const handleCategorySelect = (cat) => {
        setFormData({ ...formData, category: cat });
        setStep('details');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const res = await fetch('/api/tickets', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        const data = await res.json();
        setTicketId(data._id);
        setStep('success');
    };

    return (
        <div className="min-h-screen bg-background pt-24 px-4 pb-20">
            <div className="max-w-2xl mx-auto">
                <h1 className="text-4xl font-serif font-bold text-white mb-2 text-center">Help Center</h1>
                <p className="text-gray-400 text-center mb-12">We are here to help you with your order.</p>

                <div className="bg-surface border border-white/5 rounded-2xl p-8 shadow-2xl">
                    <AnimatePresence mode="wait">

                        {/* Step 1: User Identification (Phone) */}
                        {step === 'identification' && (
                            <motion.div
                                key="ident"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                            >
                                <h3 className="text-xl font-bold text-white mb-6">Find your orders</h3>
                                <div className="space-y-4">
                                    <input
                                        type="tel"
                                        placeholder="Enter your phone number"
                                        className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white"
                                        value={formData.phone || ''}
                                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                    />
                                    <button
                                        onClick={fetchOrders}
                                        disabled={!formData.phone || formData.phone.length < 10}
                                        className="w-full bg-primary text-background font-bold py-3 rounded-lg disabled:opacity-50"
                                    >
                                        Find Orders
                                    </button>
                                    <button
                                        onClick={() => setStep('category')}
                                        className="w-full text-gray-400 text-sm hover:text-white"
                                    >
                                        Skip & Continue without Order ID
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {/* Step 1.5: Select Order */}
                        {step === 'select-order' && (
                            <motion.div
                                key="select-order"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                            >
                                <h3 className="text-xl font-bold text-white mb-6">Select an Order</h3>
                                <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                                    {userOrders.length === 0 ? (
                                        <p className="text-gray-400">No recent orders found.</p>
                                    ) : (
                                        userOrders.map(order => (
                                            <button
                                                key={order._id}
                                                onClick={() => {
                                                    setFormData({ ...formData, orderId: order._id });
                                                    setStep('category');
                                                }}
                                                className="w-full text-left p-4 rounded-xl bg-white/5 border border-white/10 hover:border-primary transition-all"
                                            >
                                                <div className="flex justify-between mb-1">
                                                    <span className="font-bold text-white">#{order._id.slice(-6)}</span>
                                                    <span className="text-gray-400 text-sm">{new Date(order.createdAt).toLocaleDateString()}</span>
                                                </div>
                                                <p className="text-gray-500 text-sm truncate">
                                                    {order.items.map(i => i.name).join(', ')}
                                                </p>
                                                <div className="mt-2 text-primary font-bold text-sm">₹{order.totalAmount}</div>
                                            </button>
                                        ))
                                    )}
                                </div>
                                <button onClick={() => setStep('category')} className="w-full mt-4 py-3 border border-white/10 rounded-lg text-gray-400 hover:text-white">
                                    Continue without selecting
                                </button>
                            </motion.div>
                        )}

                        {/* Step 2: Category Selection */}
                        {step === 'category' && (
                            <motion.div
                                key="cat"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                            >
                                <h3 className="text-xl font-bold text-white mb-6">What do you need help with?</h3>
                                {formData.orderId && (
                                    <div className="mb-6 p-3 bg-primary/10 border border-primary/30 rounded-lg text-sm text-primary flex justify-between items-center">
                                        <span>Selected Order: #{formData.orderId.slice(-6)}</span>
                                        <button onClick={() => { setFormData({ ...formData, orderId: '' }); setStep('identification'); }} className="underline">Change</button>
                                    </div>
                                )}
                                <div className="grid gap-4">
                                    {categories.map((cat) => (
                                        <button
                                            key={cat}
                                            onClick={() => handleCategorySelect(cat)}
                                            className="w-full text-left p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-primary/10 hover:border-primary/50 transition-all group flex justify-between items-center"
                                        >
                                            <span className="font-medium text-gray-200">{cat}</span>
                                            <ChevronRight className="text-gray-500 group-hover:text-primary" size={20} />
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {/* Step 3: Form Details */}
                        {step === 'details' && (
                            <motion.div
                                key="details"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                            >
                                <h3 className="text-xl font-bold text-white mb-6">Tell us more details</h3>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    {/* Order ID field removed as it is now selected previously */}

                                    <div>
                                        <label className="text-sm text-gray-400 mb-1 block">Additional Details</label>
                                        <textarea
                                            required
                                            className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white h-32"
                                            placeholder="Please explain the issue..."
                                            value={formData.details}
                                            onChange={e => setFormData({ ...formData, details: e.target.value })}
                                        ></textarea>
                                    </div>
                                    <div className="flex gap-4">
                                        <button type="button" onClick={() => setStep('category')} className="px-6 py-3 rounded-lg border border-white/10 text-white hover:bg-white/5">Back</button>
                                        <button type="submit" className="flex-1 bg-primary text-background font-bold rounded-lg hover:bg-accent">Submit Ticket</button>
                                    </div>
                                </form>
                            </motion.div>
                        )}

                        {/* Step 3: Success */}
                        {step === 'success' && (
                            <motion.div
                                key="success"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center py-8"
                            >
                                <div className="w-20 h-20 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <CheckCircle size={48} />
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-2">Ticket Created!</h3>
                                <p className="text-gray-400 mb-8">Ticket ID: #{ticketId?.slice(-6)}<br />We will resolve this shortly.</p>
                                <Link to="/" className="inline-block px-8 py-3 bg-white/10 rounded-full text-white hover:bg-white/20 font-bold">
                                    Return Home
                                </Link>
                            </motion.div>
                        )}

                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
