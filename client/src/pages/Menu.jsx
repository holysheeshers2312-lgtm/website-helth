import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import MenuCard from '../features/menu/MenuCard';
import { Search, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '../lib/utils';

export default function Menu() {
    const [activeCategory, setActiveCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [menuItems, setMenuItems] = useState([]);
    const [categoryList, setCategoryList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [vegFilter, setVegFilter] = useState(false); // false = show all, true = show only veg
    const [expandedCategories, setExpandedCategories] = useState({}); // Track which categories are expanded

    useEffect(() => {
        // Fetch both categories and menu items
        Promise.all([
            fetch('/api/categories').then(res => res.json()).catch(() => []),
            fetch('/api/menu').then(res => res.json()).catch(() => [])
        ]).then(([cats, items]) => {
            setMenuItems(items);
            if (cats && cats.length > 0) {
                // Categories are already sorted by displayOrder from API
                setCategoryList(cats.map(c => c.name));
            } else {
                // Fallback: get categories from items
                setCategoryList([...new Set(items.map(item => item.category).filter(Boolean))].sort());
            }
            setLoading(false);
        }).catch(err => {
            console.error("Failed to fetch menu:", err);
            setLoading(false);
        });
    }, []);

    // Use categoryList if available, otherwise fallback
    const categories = categoryList.length > 0 ? categoryList : [...new Set(menuItems.map(item => item.category).filter(Boolean))].sort();

    // Filter items by search query, availability, and veg filter, then group by category
    const groupedItems = categories.reduce((acc, category) => {
        const items = menuItems.filter(item => 
            item.category === category && 
            item.isAvailable !== false && // Only show available items
            item.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
            (vegFilter === false || item.isVegetarian !== false) // If vegFilter is true, only show veg items
        );
        if (items.length > 0) {
            acc[category] = items;
        }
        return acc;
    }, {});

    const scrollToSection = (id) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
            setActiveCategory(id);
        }
    };

    const toggleCategory = (category) => {
        setExpandedCategories(prev => ({
            ...prev,
            [category]: !prev[category]
        }));
    };

    // Initialize all categories as expanded by default
    useEffect(() => {
        const cats = categoryList.length > 0 ? categoryList : [...new Set(menuItems.map(item => item.category).filter(Boolean))].sort();
        if (cats.length > 0 && Object.keys(expandedCategories).length === 0) {
            const initialExpanded = {};
            cats.forEach(cat => {
                initialExpanded[cat] = true;
            });
            setExpandedCategories(initialExpanded);
        }
    }, [categoryList, menuItems]);

    return (
        <div className="min-h-screen bg-background pb-20">
            {/* Header */}
            <div className="bg-surface/50 border-b border-white/5 py-12">
                <div className="container mx-auto px-4 text-center">
                    <h1 className="text-4xl md:text-6xl font-serif font-bold mb-4 text-primary">Our Menu</h1>
                    <p className="text-gray-400 max-w-2xl mx-auto">
                        Explore our curated selection of modern Indian delicacies, crafted with passion and precision.
                    </p>
                </div>
            </div>

            {/* Category Navigation */}
            <div className="sticky top-20 z-40 bg-background/95 backdrop-blur-md border-b border-white/5 py-4">
                <div className="container mx-auto px-4 flex flex-col gap-4">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex overflow-x-auto pb-2 md:pb-0 gap-2 w-full md:w-auto -mx-4 md:mx-0 px-4 md:px-0 scrollbar-hide">
                            {categories.length > 0 ? categories.map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => scrollToSection(cat)}
                                    className={cn(
                                        "px-6 py-2 rounded-full whitespace-nowrap text-sm font-bold transition-all border",
                                        activeCategory === cat
                                            ? "bg-primary text-background border-primary"
                                            : "bg-surface text-gray-400 border-white/5 hover:border-white/20"
                                    )}
                                >
                                    {cat}
                                </button>
                            )) : (
                                <p className="text-gray-400">No categories available</p>
                            )}
                        </div>

                        <div className="relative w-full md:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Search..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-surface border border-white/10 rounded-full pl-9 pr-4 py-1.5 text-sm text-white focus:outline-none focus:border-primary/50"
                            />
                        </div>
                    </div>
                    
                    {/* Veg/Non-Veg Toggle */}
                    <div className="flex items-center justify-center gap-3">
                        <span className={cn("text-sm font-bold transition-colors", vegFilter ? "text-gray-400" : "text-white")}>
                            All Dishes
                        </span>
                        <button
                            onClick={() => setVegFilter(!vegFilter)}
                            className={cn(
                                "relative inline-flex h-8 w-16 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background",
                                vegFilter ? "bg-green-600" : "bg-gray-600"
                            )}
                            role="switch"
                            aria-checked={vegFilter}
                        >
                            <span
                                className={cn(
                                    "inline-block h-6 w-6 transform rounded-full bg-white transition-transform",
                                    vegFilter ? "translate-x-9" : "translate-x-1"
                                )}
                            />
                        </button>
                        <span className={cn("text-sm font-bold transition-colors", vegFilter ? "text-green-400" : "text-gray-400")}>
                            Vegetarian Only
                        </span>
                    </div>
                </div>
            </div>

            {/* Menu Sections */}
            <div className="container mx-auto px-4 mt-8 space-y-8">
                {loading ? (
                    <div className="text-center py-20 text-gray-500">Loading menu...</div>
                ) : Object.keys(groupedItems).length > 0 ? (
                    Object.entries(groupedItems).map(([category, items]) => {
                        const isExpanded = expandedCategories[category] !== false; // Default to true
                        return (
                            <div key={category} id={category} className="scroll-mt-40">
                                <motion.button
                                    onClick={() => toggleCategory(category)}
                                    initial={{ opacity: 0, x: -20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    className="w-full flex items-center justify-between text-left mb-4 group"
                                >
                                    <h2 className="text-3xl font-serif font-bold text-white border-l-4 border-primary pl-4 group-hover:text-primary transition-colors">
                                        {category}
                                    </h2>
                                    <div className="flex items-center gap-3">
                                        <span className="min-w-8 text-center text-sm font-black text-primary bg-primary/10 border border-primary/20 px-2 py-1 rounded-full">
                                            {items.length}
                                        </span>
                                        <motion.div
                                            animate={{ rotate: isExpanded ? 180 : 0 }}
                                            transition={{ duration: 0.3 }}
                                            className="text-primary"
                                        >
                                            <ChevronDown size={28} />
                                        </motion.div>
                                    </div>
                                </motion.button>
                                <AnimatePresence>
                                    {isExpanded && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.3 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pb-8">
                                                {items.map((item) => (
                                                    <MenuCard key={item.id} item={item} />
                                                ))}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        );
                    })
                ) : (
                    <div className="text-center py-20 text-gray-500">
                        No dishes found matching your search.
                    </div>
                )}
            </div>
        </div>
    );
}
