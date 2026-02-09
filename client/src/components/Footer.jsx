import { Github, Twitter, Instagram, Facebook } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import LegalModal from './LegalModal'; // Ensure this path is correct based on your file structure

const legalContent = {
    privacy: (
        <>
            <p><strong>Effective Date:</strong> {new Date().toLocaleDateString()}</p>
            <p>At Healthy Bowl, we respect your privacy and are committed to protecting your personal data. This Privacy Policy describes how we look after your personal data when you visit our website.</p>
            <h3 className="text-foreground font-bold text-lg mt-4">1. Information We Collect</h3>
            <p>We may collect personal identification information (Name, email, phone number, etc.) only when voluntarily submitted by you during checkout or reservation.</p>
            <h3 className="text-foreground font-bold text-lg mt-4">2. How We Use Your Information</h3>
            <p>We use your data to process orders, manage your account, and, if you agree, to email you about other products and services we think may be of interest to you.</p>
            <h3 className="text-foreground font-bold text-lg mt-4">3. Data Security</h3>
            <p>We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorized way.</p>
        </>
    ),
    terms: (
        <>
            <p><strong>Welcome to Healthy Bowl.</strong></p>
            <p>These terms and conditions outline the rules and regulations for the use of Healthy Bowl's Website.</p>
            <h3 className="text-foreground font-bold text-lg mt-4">1. License</h3>
            <p>Unless otherwise stated, Healthy Bowl and/or its licensors own the intellectual property rights for all material on Healthy Bowl. All intellectual property rights are reserved.</p>
            <h3 className="text-foreground font-bold text-lg mt-4">2. Restrictions</h3>
            <p>You are specifically restricted from all of the following: publishing any Website material in any other media; selling, sublicensing and/or otherwise commercializing any Website material.</p>
        </>
    ),
    refund: (
        <>
            <p><strong>Refund Policy</strong></p>
            <p>We want you to be completely satisfied with your order.</p>
            <h3 className="text-foreground font-bold text-lg mt-4">1. Order Errors</h3>
            <p>If you receive food that is different from your receipt, we often apologize for the error and will offer you a refund or store credit.</p>
            <h3 className="text-foreground font-bold text-lg mt-4">2. Order Incomplete</h3>
            <p>On specific occasions, we may miss an item. We will refund you specifically for the missed item.</p>
            <h3 className="text-foreground font-bold text-lg mt-4">3. Food Dissatisfaction</h3>
            <p>We cook our food fresh to order with only the finest and freshest ingredients. We take great care and pride in all of the dishes we make. Refunds are not typically provided for food that a customer simply does not like.</p>
        </>
    )
};

export default function Footer() {
    const [activeDoc, setActiveDoc] = useState(null);

    return (
        <footer className="bg-secondary/50 border-t border-gray-200 dark:border-white/5 py-12 mt-20">
            <LegalModal
                isOpen={!!activeDoc}
                onClose={() => setActiveDoc(null)}
                title={activeDoc === 'privacy' ? 'Privacy Policy' : activeDoc === 'terms' ? 'Terms of Service' : 'Refund Policy'}
                content={activeDoc ? legalContent[activeDoc] : null}
            />

            <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
                <div>
                    <h3 className="text-2xl font-serif text-primary font-bold mb-4">Healthy Bowl</h3>
                    <p className="text-gray-500 dark:text-gray-400">
                        Fresh, nutritious meals delivered to your doorstep. Nourish your body with every bite.
                    </p>
                </div>

                <div>
                    <h4 className="text-lg font-bold mb-4 text-foreground">Quick Links</h4>
                    <ul className="space-y-2 text-gray-500 dark:text-gray-400">
                        <li><Link to="/" className="hover:text-primary transition-colors">Home</Link></li>
                        <li><Link to="/menu" className="hover:text-primary transition-colors">Menu</Link></li>
                        <li><Link to="/locations" className="hover:text-primary transition-colors">Locations</Link></li>
                    </ul>
                </div>

                <div>
                    <h4 className="text-lg font-bold mb-4 text-foreground">Legal</h4>
                    <ul className="space-y-2 text-gray-500 dark:text-gray-400">
                        <li><button onClick={() => setActiveDoc('privacy')} className="hover:text-primary transition-colors text-left">Privacy Policy</button></li>
                        <li><button onClick={() => setActiveDoc('terms')} className="hover:text-primary transition-colors text-left">Terms of Service</button></li>
                        <li><button onClick={() => setActiveDoc('refund')} className="hover:text-primary transition-colors text-left">Refund Policy</button></li>
                    </ul>
                </div>

                <div>
                    <h4 className="text-lg font-bold mb-4 text-foreground">Connect With Us</h4>
                    <div className="flex gap-4">
                        <a href="#" className="w-10 h-10 rounded-full bg-gray-200 dark:bg-white/5 flex items-center justify-center hover:bg-primary hover:text-white transition-all text-foreground">
                            <Instagram size={20} />
                        </a>
                        <a href="#" className="w-10 h-10 rounded-full bg-gray-200 dark:bg-white/5 flex items-center justify-center hover:bg-primary hover:text-white transition-all text-foreground">
                            <Facebook size={20} />
                        </a>
                        <a href="#" className="w-10 h-10 rounded-full bg-gray-200 dark:bg-white/5 flex items-center justify-center hover:bg-primary hover:text-white transition-all text-foreground">
                            <Twitter size={20} />
                        </a>
                    </div>
                </div>
            </div>
            <div className="container mx-auto px-4 mt-8 pt-8 border-t border-gray-200 dark:border-white/5 text-center text-gray-500 text-sm">
                © {new Date().getFullYear()} Healthy Bowl. All rights reserved.
            </div>
        </footer>
    );
}
