import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCartStore } from '../features/cart/cartStore';
import { useAuthStore } from '../features/auth/authStore';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Smartphone, MapPin, User, Phone, Wallet, Trash2, ChevronRight, Banknote } from 'lucide-react';
import { cn } from '../lib/utils';

export default function Checkout() {
    const { items, total, clearCart, removeItem, updateQuantity } = useCartStore();
    const { isAuthenticated, token, user, verifyToken } = useAuthStore();
    const navigate = useNavigate();
    const [step, setStep] = useState(1); // 1: Cart Items, 2: Delivery Details, 3: Payment
    const [form, setForm] = useState({ name: '', phone: '', address: '' });
    const [paymentMethod, setPaymentMethod] = useState('');
    const [loading, setLoading] = useState(false);
    const [deliveryFee, setDeliveryFee] = useState(40);

    useEffect(() => {
        // Fetch dynamic delivery fee
        fetch('/api/calculate-fee', { method: 'POST' })
            .then(res => res.json())
            .then(data => setDeliveryFee(data.fee))
            .catch(err => console.error(err));
    }, []);

    // Pre-fill form with user data when user is available and on delivery step
    useEffect(() => {
        if (user && step >= 2) {
            setForm(prev => ({
                ...prev,
                name: user.name || prev.name,
                phone: user.phone || prev.phone,
                address: user.address || prev.address
            }));
        }
    }, [user, step]);

    // Check authentication before proceeding to delivery step
    const handleNextStep = () => {
        // If moving from cart (step 1) to delivery (step 2), require authentication
        if (step === 1 && !isAuthenticated) {
            navigate('/login?redirect=/checkout');
            return;
        }
        // If moving from delivery (step 2) to payment (step 3), validate form
        if (step === 2) {
            if (!form.name || !form.phone || !form.address) {
                alert("Please fill in all delivery details");
                return;
            }
        }
        setStep(step + 1);
    };

    // Handle payment based on payment method
    const handlePayment = async () => {
        // Double check authentication
        if (!isAuthenticated || !token) {
            navigate('/login?redirect=/checkout');
            return;
        }

        if (!form.name || !form.phone || !form.address) {
            alert("Please fill in all delivery details");
            return;
        }

        if (!paymentMethod) {
            alert("Please select a payment method");
            return;
        }

        setLoading(true);

        try {
            // For COD, create order directly without payment gateway
            if (paymentMethod === 'COD' || paymentMethod === 'cod') {
                const orderRes = await fetch('/api/create-order-direct', {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        customer: form,
                        items: items,
                        totalAmount: grandTotal,
                        paymentMethod: 'COD'
                    })
                });

                const orderData = await orderRes.json();

                if (orderData.success) {
                    clearCart();
                    navigate(`/track-order?orderId=${orderData.orderId}`);
                } else {
                    alert("Failed to create order: " + (orderData.message || "Unknown error"));
                    setLoading(false);
                }
                return;
            }

            // For UPI/Card, use Razorpay flow
            const orderRes = await fetch('/api/create-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount: grandTotal })
            });
            const orderData = await orderRes.json();

            // Simulate Verification (in production, this would be handled by Razorpay callback)
            setTimeout(async () => {
                const verifyRes = await fetch('/api/verify-payment', {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        razorpay_order_id: orderData.id || "mock_order_id",
                        razorpay_payment_id: "mock_payment_id_" + Date.now(),
                        razorpay_signature: "mock_signature",
                        orderDetails: {
                            customer: form,
                            items: items,
                            totalAmount: grandTotal
                        }
                    })
                });

                const verifyData = await verifyRes.json();

                if (verifyData.success) {
                    clearCart();
                    navigate(`/track-order?orderId=${verifyData.orderId}`);
                } else {
                    alert("Payment Verification Failed");
                }
                setLoading(false);
            }, 2000);

        } catch (e) {
            console.error(e);
            setLoading(false);
            alert("Payment Failed. Check Console.");
        }
    };

    // Redirect to login if not authenticated when trying to proceed past cart step
    useEffect(() => {
        if (step > 1 && !isAuthenticated) {
            if (token) {
                verifyToken();
            } else {
                navigate('/login?redirect=/checkout');
            }
        }
    }, [step, isAuthenticated, token, verifyToken, navigate]);

    if (items.length === 0) {
        return (
            <div className="min-h-screen bg-background pt-24 text-center px-4">
                <div className="w-20 h-20 bg-surface rounded-full flex items-center justify-center mx-auto mb-6">
                    <Banknote className="w-10 h-10 text-gray-500" />
                </div>
                <h2 className="text-2xl font-serif font-bold mb-2">Your cart is empty</h2>
                <p className="text-gray-400 mb-8">Looks like you haven't added anything yet.</p>
                <button onClick={() => navigate('/menu')} className="bg-primary text-background px-8 py-3 rounded-full font-bold hover:bg-accent transition-colors">
                    Browse Menu
                </button>
            </div>
        )
    }

    const cartTotal = total();
    const grandTotal = cartTotal + deliveryFee;

    return (
        <div className="min-h-screen bg-background pt-24 pb-20 px-4">
            <div className="container mx-auto max-w-6xl">
                <h1 className="text-3xl font-serif font-bold mb-8">Checkout</h1>

                {/* Steps Indicator */}
                <div className="flex items-center justify-between mb-8 px-4">
                    {[1, 2, 3].map((s) => (
                        <div key={s} className="flex items-center gap-2">
                            <div className={cn(
                                "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm",
                                step >= s ? "bg-primary text-background" : "bg-surface text-gray-500"
                            )}>
                                {s}
                            </div>
                            <span className={cn("text-sm", step >= s ? "text-white" : "text-gray-500")}>
                                {s === 1 ? 'Cart' : s === 2 ? 'Delivery' : 'Payment'}
                            </span>
                            {s < 3 && <div className="w-10 h-[1px] bg-white/10 mx-2" />}
                        </div>
                    ))}
                </div>

                {!isAuthenticated && step >= 2 && (
                    <div className="bg-yellow-500/20 border border-yellow-500/50 text-yellow-400 px-4 py-3 rounded-lg mb-6 text-sm">
                        ⚠️ You must be logged in to place an order. <button onClick={() => navigate('/login?redirect=/checkout')} className="underline font-bold hover:text-yellow-300">Login here</button>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content Area */}
                    <div className="lg:col-span-2 space-y-6">
                        <AnimatePresence mode="wait">
                            {step === 1 && (
                                <motion.div
                                    key="cart"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    className="bg-surface border border-white/5 rounded-2xl overflow-hidden"
                                >
                                    <div className="p-6">
                                        <h2 className="text-xl font-bold mb-6">Your Items</h2>
                                        <div className="space-y-6">
                                            {items.map((item) => (
                                                <div key={item.id} className="flex gap-4 items-center">
                                                    <img src={item.image} alt={item.name} className="w-20 h-20 rounded-lg object-cover" />
                                                    <div className="flex-1">
                                                        <h3 className="font-bold text-white">{item.name}</h3>
                                                        <p className="text-primary text-sm font-bold">₹{item.price}</p>
                                                    </div>
                                                    <div className="flex items-center gap-3 bg-background/50 rounded-lg p-1">
                                                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-8 h-8 flex items-center justify-center hover:text-primary transition-colors">-</button>
                                                        <span className="font-bold w-4 text-center text-white">{item.quantity}</span>
                                                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-8 h-8 flex items-center justify-center hover:text-primary transition-colors">+</button>
                                                    </div>
                                                    <button onClick={() => removeItem(item.id)} className="p-2 text-gray-500 hover:text-red-500 transition-colors">
                                                        <Trash2 size={20} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {step === 2 && (
                                <motion.div
                                    key="delivery"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    className="bg-surface border border-white/5 rounded-2xl p-6"
                                >
                                    <h2 className="text-xl font-bold mb-6">Delivery Details</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm text-gray-400">Full Name</label>
                                            <div className="bg-background border border-white/10 rounded-lg px-4 py-3 flex items-center gap-3">
                                                <User className="text-gray-400" size={20} />
                                                <input
                                                    type="text"
                                                    value={form.name}
                                                    onChange={e => setForm({ ...form, name: e.target.value })}
                                                    className="bg-transparent w-full text-white outline-none"
                                                    placeholder="John Doe"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm text-gray-400">Phone Number</label>
                                            <div className="bg-background border border-white/10 rounded-lg px-4 py-3 flex items-center gap-3">
                                                <Phone className="text-gray-400" size={20} />
                                                <input
                                                    type="tel"
                                                    value={form.phone}
                                                    onChange={e => setForm({ ...form, phone: e.target.value })}
                                                    className="bg-transparent w-full text-white outline-none"
                                                    placeholder="+91 98765 43210"
                                                />
                                            </div>
                                        </div>
                                        <div className="md:col-span-2 space-y-2">
                                            <label className="text-sm text-gray-400">Address</label>
                                            <div className="bg-background border border-white/10 rounded-lg px-4 py-3 flex items-start gap-3">
                                                <MapPin className="text-gray-400 mt-1" size={20} />
                                                <textarea
                                                    value={form.address}
                                                    onChange={e => setForm({ ...form, address: e.target.value })}
                                                    className="bg-transparent w-full text-white outline-none resize-none h-24"
                                                    placeholder="Flat No, Building, Street..."
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {step === 3 && (
                                <motion.div
                                    key="payment"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    className="bg-surface border border-white/5 rounded-2xl p-6"
                                >
                                    <h2 className="text-xl font-bold mb-6">Payment Method</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                                        {['UPI', 'Card', 'COD'].map((method) => (
                                            <button
                                                key={method}
                                                onClick={() => setPaymentMethod(method)}
                                                className={cn(
                                                    "p-4 rounded-xl border flex flex-col items-center gap-3 transition-all",
                                                    paymentMethod === method
                                                        ? "bg-primary/10 border-primary text-primary"
                                                        : "bg-background border-white/5 hover:border-white/20"
                                                )}
                                            >
                                                {method === 'UPI' && <Smartphone size={32} />}
                                                {method === 'Card' && <CreditCard size={32} />}
                                                {method === 'COD' && <Wallet size={32} />}
                                                <span className="font-bold">{method}</span>
                                            </button>
                                        ))}
                                    </div>

                                    {paymentMethod === 'UPI' && (
                                        <div className="mt-8 p-6 bg-background rounded-xl border border-white/5 text-center">
                                            <div className="w-48 h-48 bg-white mx-auto mb-4 p-2">
                                                <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=mock@upi&pn=SpiceRoute" alt="QR Code" />
                                            </div>
                                            <p className="text-sm text-gray-400">Scan to pay with Any UPI App</p>
                                        </div>
                                    )}
                                    {paymentMethod === 'Card' && (
                                        <div className="mt-8 p-6 bg-background rounded-xl border border-white/5 space-y-4 max-w-sm mx-auto">
                                            <input type="text" placeholder="Card Number" className="w-full bg-surface border border-white/10 rounded-lg px-4 py-3 text-white" />
                                            <div className="grid grid-cols-2 gap-4">
                                                <input type="text" placeholder="MM/YY" className="w-full bg-surface border border-white/10 rounded-lg px-4 py-3 text-white" />
                                                <input type="password" placeholder="CVV" className="w-full bg-surface border border-white/10 rounded-lg px-4 py-3 text-white" />
                                            </div>
                                        </div>
                                    )}
                                    {paymentMethod === 'COD' && (
                                        <div className="mt-8 p-6 bg-background rounded-xl border border-white/5 text-center text-gray-400">
                                            Please keep exact change ready at delivery.
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="flex justify-between mt-8">
                            {step > 1 && (
                                <button
                                    onClick={() => setStep(step - 1)}
                                    className="px-6 py-3 font-bold text-gray-400 hover:text-white transition-colors"
                                >
                                    Back
                                </button>
                            )}
                            {step < 3 ? (
                                <button
                                    onClick={handleNextStep}
                                    className="ml-auto bg-primary text-background px-8 py-3 rounded-full font-bold hover:bg-accent transition-colors flex items-center gap-2"
                                >
                                    Next <ChevronRight size={18} />
                                </button>
                            ) : (
                                <button
                                    onClick={handlePayment}
                                    disabled={loading || !paymentMethod}
                                    className="ml-auto bg-green-500 text-white px-8 py-3 rounded-full font-bold hover:bg-green-600 transition-colors flex items-center gap-2 disabled:opacity-50"
                                >
                                    {loading ? 'Processing...' : paymentMethod === 'COD' ? `Place Order ₹${grandTotal}` : `Pay ₹${grandTotal}`}
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Sidebar Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-surface border border-white/5 rounded-2xl p-6 sticky top-24">
                            <h2 className="text-xl font-bold font-serif mb-6">Order Summary</h2>
                            <div className="space-y-4 mb-6">
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Subtotal</span>
                                    <span className="text-white">₹{cartTotal}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Delivery Fee</span>
                                    <span className="text-white">₹{deliveryFee}</span>
                                </div>
                                <div className="h-[1px] bg-white/10 my-4" />
                                <div className="flex justify-between text-xl font-bold text-primary">
                                    <span>Total</span>
                                    <span>₹{grandTotal}</span>
                                </div>
                            </div>
                            <p className="text-xs text-gray-500 text-center">
                                Secure checkout powered by Razorpay
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
