import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit2, Save, Trash, Plus, MessageSquare, CheckCircle, ArrowUp, ArrowDown, X } from 'lucide-react';
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
const socket = io(SOCKET_URL);

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState('orders'); // menu | tickets | orders
    const [items, setItems] = useState([]);
    const [categories, setCategories] = useState([]);
    const [tickets, setTickets] = useState([]);
    const [orders, setOrders] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({});
    const [newCategoryName, setNewCategoryName] = useState('');
    const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
    const [newOrderNotification, setNewOrderNotification] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const isAdmin = localStorage.getItem('isAdmin');
        if (!isAdmin) navigate('/admin');

        fetchItems();
        fetchCategories();
        fetchTickets();
        fetchOrders();

        // Socket.io real-time updates
        socket.on('new_order', (newOrder) => {
            console.log('New order received:', newOrder);
            setNewOrderNotification(true);
            fetchOrders(); // Refresh orders list
            fetchItems(); // Also refresh menu items in case they were updated
            // Auto-hide notification after 5 seconds
            setTimeout(() => setNewOrderNotification(false), 5000);
        });

        socket.on('admin_order_update', (updatedOrder) => {
            console.log('Order updated:', updatedOrder);
            fetchOrders(); // Refresh orders list
        });

        // Also keep polling as backup (every 5 seconds)
        const interval = setInterval(() => {
            fetchItems();
            fetchTickets();
            fetchOrders();
        }, 5000);

        return () => {
            socket.off('new_order');
            socket.off('admin_order_update');
            clearInterval(interval);
        };
    }, []);

    const fetchItems = () => {
        fetch('/api/menu')
            .then(res => res.json())
            .then(data => setItems(data));
    };

    const fetchCategories = () => {
        fetch('/api/categories')
            .then(res => res.json())
            .then(data => setCategories(data))
            .catch(err => console.error('Failed to fetch categories:', err));
    };

    const handleCreateCategory = async () => {
        if (!newCategoryName.trim()) {
            alert('Please enter a category name');
            return;
        }

        try {
            const res = await fetch('/api/categories', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newCategoryName.trim() })
            });

            if (res.ok) {
                const newCategory = await res.json();
                const updatedCategories = [...categories, newCategory].sort((a, b) => a.displayOrder - b.displayOrder);
                setCategories(updatedCategories);
                setNewCategoryName('');
                setShowNewCategoryInput(false);
                return newCategory; // Return the new category
            } else {
                const error = await res.json();
                alert(error.error || 'Failed to create category');
                return null;
            }
        } catch (error) {
            alert('Failed to create category');
            return null;
        }
    };

    const handleMoveCategory = async (categoryId, direction) => {
        const categoryIndex = categories.findIndex(c => c._id === categoryId);
        if (categoryIndex === -1) return;

        const newIndex = direction === 'up' ? categoryIndex - 1 : categoryIndex + 1;
        if (newIndex < 0 || newIndex >= categories.length) return;

        // Swap display orders
        const updatedCategories = [...categories];
        const temp = updatedCategories[categoryIndex].displayOrder;
        updatedCategories[categoryIndex].displayOrder = updatedCategories[newIndex].displayOrder;
        updatedCategories[newIndex].displayOrder = temp;

        // Update state optimistically
        setCategories(updatedCategories.sort((a, b) => a.displayOrder - b.displayOrder));

        // Save to server
        try {
            await fetch('/api/categories/reorder', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    categories: updatedCategories.map(cat => ({
                        id: cat._id,
                        displayOrder: cat.displayOrder
                    }))
                })
            });
            fetchCategories(); // Refresh to ensure consistency
        } catch (error) {
            alert('Failed to reorder categories');
            fetchCategories(); // Revert on error
        }
    };

    const handleDeleteCategory = async (categoryId, categoryName) => {
        // Check if category has items
        const itemsInCategory = items.filter(item => item.category === categoryName);
        if (itemsInCategory.length > 0) {
            if (!window.confirm(`This category has ${itemsInCategory.length} item(s). Deleting it will remove the category but the items will remain. Are you sure you want to delete this category?`)) {
                return;
            }
        } else {
            if (!window.confirm(`Are you sure you want to delete the category "${categoryName}"? This action cannot be undone.`)) {
                return;
            }
        }

        try {
            const res = await fetch(`/api/categories/${categoryId}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                fetchCategories(); // Refresh categories
                fetchItems(); // Refresh items in case any were affected
            } else {
                const error = await res.json();
                alert(error.error || 'Failed to delete category');
            }
        } catch (error) {
            alert('Failed to delete category');
        }
    };

    const fetchTickets = () => {
        fetch('/api/tickets')
            .then(res => res.json())
            .then(data => setTickets(data));
    };

    const fetchOrders = () => {
        fetch('/api/admin/orders')
            .then(res => res.json())
            .then(data => setOrders(data));
    };

    const handleEdit = (item) => {
        setEditingId(item.id);
        setEditForm(item);
    };

    const handleSave = async () => {
        const res = await fetch(`/api/menu/${editingId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(editForm)
        });
        if (res.ok) {
            setEditingId(null);
            fetchItems(); // Refresh menu items
        } else {
            alert('Failed to update item');
        }
    };

    const updateOrderStatus = async (id, status) => {
        await fetch(`/api/orders/${id}/status`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status })
        });
        fetchOrders();
    };

    const handleResolveTicket = async (id) => {
        await fetch(`/api/tickets/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'Resolved' })
        });
        fetchTickets();
    };

    const handleChange = (field, value) => {
        setEditForm(prev => ({ ...prev, [field]: value }));
    };

    const handleDelete = async (itemId) => {
        if (!window.confirm('Are you sure you want to delete this dish? This action cannot be undone.')) {
            return;
        }
        try {
            const res = await fetch(`/api/menu/${itemId}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                fetchItems(); // Refresh menu items
            } else {
                alert('Failed to delete item');
            }
        } catch (error) {
            alert('Failed to delete item');
        }
    };

    return (
        <div className="min-h-screen bg-background p-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-4xl font-serif font-bold text-white">Admin Dashboard</h1>
                    <div className="flex items-center gap-4">
                        {newOrderNotification && (
                            <div className="bg-green-500/20 border border-green-500/50 text-green-400 px-4 py-2 rounded-lg text-sm font-bold animate-pulse">
                                New Order Received! 🎉
                            </div>
                        )}
                        <button
                            onClick={() => {
                                localStorage.removeItem('isAdmin');
                                navigate('/admin');
                            }}
                            className="text-red-400 hover:text-red-300"
                        >
                            Logout
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-4 mb-8 border-b border-white/10">
                    <button
                        onClick={() => setActiveTab('menu')}
                        className={`px-6 py-3 font-bold border-b-2 transition-colors ${activeTab === 'menu' ? 'border-primary text-primary' : 'border-transparent text-gray-400 hover:text-white'}`}
                    >
                        Menu Management
                    </button>
                    <button
                        onClick={() => setActiveTab('orders')}
                        className={`px-6 py-3 font-bold border-b-2 transition-colors ${activeTab === 'orders' ? 'border-primary text-primary' : 'border-transparent text-gray-400 hover:text-white'}`}
                    >
                        Orders
                        {orders.filter(o => o.status !== 'delivered').length > 0 && (
                            <span className="ml-2 bg-primary text-background text-xs px-2 py-0.5 rounded-full">
                                {orders.filter(o => o.status !== 'delivered').length}
                            </span>
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('tickets')}
                        className={`px-6 py-3 font-bold border-b-2 transition-colors ${activeTab === 'tickets' ? 'border-primary text-primary' : 'border-transparent text-gray-400 hover:text-white'}`}
                    >
                        Support Tickets
                        {tickets.filter(t => t.status === 'Open').length > 0 && (
                            <span className="ml-2 bg-primary text-background text-xs px-2 py-0.5 rounded-full">
                                {tickets.filter(t => t.status === 'Open').length}
                            </span>
                        )}
                    </button>
                </div>

                {/* Menu Tab */}
                {activeTab === 'menu' && (
                    <div className="space-y-6">
                        {/* Category Management Section */}
                        <div className="bg-surface p-6 rounded-xl border border-white/5">
                            <h3 className="text-xl font-bold text-white mb-4">Manage Categories</h3>
                            <p className="text-gray-400 text-sm mb-4">Drag or use arrows to reorder categories. Categories appear in this order on the menu.</p>
                            
                            <div className="space-y-2 mb-4">
                                {categories.length === 0 ? (
                                    <p className="text-gray-400 text-sm">No categories yet. Create your first category below.</p>
                                ) : (
                                    categories.map((category, index) => (
                                        <div key={category._id} className="bg-black/40 p-3 rounded-lg flex items-center justify-between">
                                            <span className="text-white font-medium">{category.name}</span>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleMoveCategory(category._id, 'up')}
                                                    disabled={index === 0}
                                                    className="p-1.5 bg-white/10 hover:bg-white/20 rounded disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                                    title="Move up"
                                                >
                                                    <ArrowUp size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleMoveCategory(category._id, 'down')}
                                                    disabled={index === categories.length - 1}
                                                    className="p-1.5 bg-white/10 hover:bg-white/20 rounded disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                                    title="Move down"
                                                >
                                                    <ArrowDown size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteCategory(category._id, category.name)}
                                                    className="p-1.5 bg-red-600/20 hover:bg-red-600/40 rounded transition-colors text-red-400"
                                                    title="Delete category"
                                                >
                                                    <Trash size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            {showNewCategoryInput ? (
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="Enter new category name"
                                        value={newCategoryName}
                                        onChange={(e) => setNewCategoryName(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleCreateCategory()}
                                        className="flex-1 bg-black/40 border border-white/10 p-2 rounded-lg text-white"
                                        autoFocus
                                    />
                                    <button
                                        onClick={handleCreateCategory}
                                        className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg font-bold"
                                    >
                                        Add
                                    </button>
                                    <button
                                        onClick={() => {
                                            setShowNewCategoryInput(false);
                                            setNewCategoryName('');
                                        }}
                                        className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => setShowNewCategoryInput(true)}
                                    className="bg-primary/20 hover:bg-primary/30 text-primary border border-primary/50 px-4 py-2 rounded-lg font-bold flex items-center gap-2"
                                >
                                    <Plus size={18} /> Add New Category
                                </button>
                            )}
                        </div>

                        {/* Add Item Button */}
                        <div className="bg-surface p-4 rounded-xl border border-white/5 flex flex-col md:flex-row gap-4 items-center justify-between">
                            <div>
                                <h3 className="text-xl font-bold text-white">Add New Dish</h3>
                                <p className="text-gray-400 text-sm">Create a new menu item.</p>
                            </div>
                            <div className="flex gap-2 w-full md:w-auto">
                                <button
                                    onClick={() => {
                                        setEditingId('new');
                                        setEditForm({ 
                                            name: '', 
                                            price: '', 
                                            category: categories.length > 0 ? categories[0].name : '', 
                                            description: '', 
                                            image: '', 
                                            isAvailable: true,
                                            isVegetarian: true
                                        });
                                        setShowNewCategoryInput(false);
                                        setNewCategoryName('');
                                    }}
                                    className="bg-primary text-black font-bold px-4 py-2 rounded-lg flex items-center gap-2 w-full md:w-auto justify-center hover:bg-white transition-colors"
                                >
                                    <Plus size={20} /> Add Item
                                </button>
                            </div>
                        </div>

                        {/* Add/Edit Form Context */}
                        {editingId === 'new' && (
                            <div className="bg-surface p-6 rounded-xl border border-primary/50 relative">
                                <h3 className="text-xl font-bold text-white mb-4">Create New Item</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <input
                                        placeholder="Item Name"
                                        value={editForm.name}
                                        onChange={(e) => handleChange('name', e.target.value)}
                                        className="bg-black/40 border border-white/10 p-3 rounded-lg text-white"
                                    />
                                    <input
                                        placeholder="Price"
                                        type="number"
                                        value={editForm.price}
                                        onChange={(e) => handleChange('price', e.target.value)}
                                        className="bg-black/40 border border-white/10 p-3 rounded-lg text-white"
                                    />
                                    <div className="md:col-span-2">
                                        <label className="text-sm text-gray-400 mb-2 block">Category</label>
                                        {showNewCategoryInput ? (
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    placeholder="Enter new category name"
                                                    value={newCategoryName}
                                                    onChange={(e) => setNewCategoryName(e.target.value)}
                                                    onKeyPress={async (e) => {
                                                        if (e.key === 'Enter') {
                                                            const newCategory = await handleCreateCategory();
                                                            if (newCategory) {
                                                                handleChange('category', newCategory.name);
                                                            }
                                                        }
                                                    }}
                                                    className="flex-1 bg-black/40 border border-white/10 p-3 rounded-lg text-white"
                                                    autoFocus
                                                />
                                                <button
                                                    onClick={async () => {
                                                        const newCategory = await handleCreateCategory();
                                                        if (newCategory) {
                                                            handleChange('category', newCategory.name);
                                                        }
                                                    }}
                                                    className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg font-bold"
                                                >
                                                    Add & Use
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setShowNewCategoryInput(false);
                                                        setNewCategoryName('');
                                                    }}
                                                    className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg"
                                                >
                                                    <X size={20} />
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex gap-2">
                                                <select
                                                    value={editForm.category || ''}
                                                    onChange={(e) => {
                                                        if (e.target.value === '__NEW__') {
                                                            setShowNewCategoryInput(true);
                                                        } else {
                                                            handleChange('category', e.target.value);
                                                        }
                                                    }}
                                                    className="flex-1 bg-black/40 border border-white/10 p-3 rounded-lg text-white"
                                                >
                                                    <option value="">Select a category</option>
                                                    {categories.length === 0 ? (
                                                        <option value="" disabled>No categories available</option>
                                                    ) : (
                                                        categories.map(cat => (
                                                            <option key={cat._id} value={cat.name}>{cat.name}</option>
                                                        ))
                                                    )}
                                                    <option value="__NEW__">+ Create New Category</option>
                                                </select>
                                            </div>
                                        )}
                                    </div>
                                    <input
                                        placeholder="Image URL (http://...)"
                                        value={editForm.image}
                                        onChange={(e) => handleChange('image', e.target.value)}
                                        className="bg-black/40 border border-white/10 p-3 rounded-lg text-white"
                                    />
                                    <textarea
                                        placeholder="Description"
                                        value={editForm.description}
                                        onChange={(e) => handleChange('description', e.target.value)}
                                        className="bg-black/40 border border-white/10 p-3 rounded-lg text-white md:col-span-2 h-20"
                                    />
                                    <div className="md:col-span-2">
                                        <label className="text-sm text-gray-400 mb-2 block">Type</label>
                                        <div className="flex gap-4">
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name="isVegetarian"
                                                    value="true"
                                                    checked={editForm.isVegetarian !== false}
                                                    onChange={() => handleChange('isVegetarian', true)}
                                                    className="w-4 h-4 text-primary"
                                                />
                                                <span className="text-white">Vegetarian</span>
                                            </label>
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name="isVegetarian"
                                                    value="false"
                                                    checked={editForm.isVegetarian === false}
                                                    onChange={() => handleChange('isVegetarian', false)}
                                                    className="w-4 h-4 text-primary"
                                                />
                                                <span className="text-white">Non-Vegetarian</span>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-4 mt-4">
                                    <button
                                        onClick={async () => {
                                            if (!editForm.category) {
                                                alert('Please select or create a category');
                                                return;
                                            }
                                            if (!editForm.name || !editForm.price) {
                                                alert('Please fill in item name and price');
                                                return;
                                            }
                                            const newItem = { 
                                                ...editForm, 
                                                id: "item_" + Date.now(),
                                                price: Number(editForm.price) // Ensure price is a number
                                            };
                                            const res = await fetch('/api/menu', { 
                                                method: 'POST', 
                                                headers: { 'Content-Type': 'application/json' }, 
                                                body: JSON.stringify(newItem) 
                                            });
                                            if (res.ok) {
                                                setEditingId(null);
                                                setEditForm({});
                                                fetchItems(); // Refresh menu items
                                            } else {
                                                const error = await res.json();
                                                alert('Failed to create item: ' + (error.error || 'Unknown error'));
                                            }
                                        }}
                                        className="bg-green-600 hover:bg-green-500 text-white font-bold px-6 py-2 rounded-lg"
                                    >
                                        Save Item
                                    </button>
                                    <button 
                                        onClick={() => {
                                            setEditingId(null);
                                            setEditForm({});
                                            setShowNewCategoryInput(false);
                                            setNewCategoryName('');
                                        }} 
                                        className="bg-white/10 text-white px-6 py-2 rounded-lg hover:bg-white/20"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="grid gap-4">
                            {items.map(item => (
                                <div key={item.id} className="bg-surface p-4 rounded-xl border border-white/5 flex flex-col md:flex-row gap-4 items-center">
                                    <img src={item.image} alt={item.name} className="w-20 h-20 rounded-lg object-cover" />

                                    <div className="flex-1 w-full">
                                        {editingId === item.id ? (
                                            <div className="grid gap-2">
                                                <input
                                                    placeholder="Item Name"
                                                    value={editForm.name}
                                                    onChange={(e) => handleChange('name', e.target.value)}
                                                    className="bg-black/40 border border-white/10 p-2 rounded text-white"
                                                />
                                                <input
                                                    placeholder="Price"
                                                    value={editForm.price}
                                                    type="number"
                                                    onChange={(e) => handleChange('price', e.target.value)}
                                                    className="bg-black/40 border border-white/10 p-2 rounded text-white"
                                                />
                                                <div>
                                                    <label className="text-white text-sm mb-1 block">Cover Image URL:</label>
                                                    <input
                                                        placeholder="Image URL (http://...)"
                                                        value={editForm.image || ''}
                                                        onChange={(e) => handleChange('image', e.target.value)}
                                                        className="bg-black/40 border border-white/10 p-2 rounded text-white w-full"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-white text-sm mb-1 block">Category:</label>
                                                    <select
                                                        value={editForm.category || ''}
                                                        onChange={(e) => handleChange('category', e.target.value)}
                                                        className="bg-black/40 border border-white/10 p-2 rounded text-white w-full"
                                                    >
                                                        <option value="">Select a category</option>
                                                        {categories.map(cat => (
                                                            <option key={cat._id} value={cat.name}>{cat.name}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <label className="text-white text-sm">In Stock:</label>
                                                    <input
                                                        type="checkbox"
                                                        checked={editForm.isAvailable !== false}
                                                        onChange={(e) => handleChange('isAvailable', e.target.checked)}
                                                        className="w-5 h-5"
                                                    />
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <label className="text-white text-sm">Type:</label>
                                                    <label className="flex items-center gap-2 cursor-pointer">
                                                        <input
                                                            type="radio"
                                                            name={`isVegetarian-${item.id}`}
                                                            value="true"
                                                            checked={editForm.isVegetarian !== false}
                                                            onChange={() => handleChange('isVegetarian', true)}
                                                            className="w-4 h-4 text-primary"
                                                        />
                                                        <span className="text-white text-sm">Veg</span>
                                                    </label>
                                                    <label className="flex items-center gap-2 cursor-pointer">
                                                        <input
                                                            type="radio"
                                                            name={`isVegetarian-${item.id}`}
                                                            value="false"
                                                            checked={editForm.isVegetarian === false}
                                                            onChange={() => handleChange('isVegetarian', false)}
                                                            className="w-4 h-4 text-primary"
                                                        />
                                                        <span className="text-white text-sm">Non-Veg</span>
                                                    </label>
                                                </div>
                                            </div>
                                        ) : (
                                            <div>
                                                <h3 className="text-xl font-bold text-white">{item.name}</h3>
                                                <p className="text-primary font-mono">₹{item.price}</p>
                                                <div className="flex gap-2 mt-1 flex-wrap">
                                                    <span className="text-xs px-2 py-1 rounded bg-primary/20 text-primary border border-primary/50">
                                                        {item.category || 'Uncategorized'}
                                                    </span>
                                                    <span className={`text-xs px-2 py-1 rounded ${item.isAvailable !== false ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                                        {item.isAvailable !== false ? 'In Stock' : 'Out of Stock'}
                                                    </span>
                                                    <span className={`text-xs px-2 py-1 rounded ${item.isVegetarian !== false ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                                        {item.isVegetarian !== false ? 'Veg' : 'Non-Veg'}
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex gap-2">
                                        {editingId === item.id ? (
                                            <button onClick={handleSave} className="p-2 bg-green-600 rounded hover:bg-green-700 text-white"><Save size={20} /></button>
                                        ) : (
                                            <>
                                                <button onClick={() => handleEdit(item)} className="p-2 bg-blue-600 rounded hover:bg-blue-700 text-white"><Edit2 size={20} /></button>
                                                <button onClick={() => handleDelete(item.id)} className="p-2 bg-red-600 rounded hover:bg-red-700 text-white"><Trash size={20} /></button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Tickets Tab */}
                {activeTab === 'tickets' && (
                    <div className="grid gap-4">
                        {tickets.length === 0 && <p className="text-gray-500 text-center py-10">No tickets found.</p>}
                        {tickets.map(ticket => (
                            <div key={ticket._id} className="bg-surface p-6 rounded-xl border border-white/5">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                            <MessageSquare size={18} className="text-primary" />
                                            {ticket.category}
                                        </h3>
                                        {(ticket.orderId) && <p className="text-sm text-gray-400">Order ID: #{ticket.orderId}</p>}
                                        <p className="text-xs text-gray-500 mt-1">{new Date(ticket.createdAt).toLocaleString()}</p>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${ticket.status === 'Open' ? 'bg-yellow-500/20 text-yellow-500' : 'bg-green-500/20 text-green-500'}`}>
                                        {ticket.status}
                                    </span>
                                </div>
                                <p className="text-gray-300 bg-black/20 p-4 rounded-lg mb-4">{ticket.details}</p>

                                {ticket.status === 'Open' && (
                                    <button
                                        onClick={() => handleResolveTicket(ticket._id)}
                                        className="flex items-center gap-2 bg-white/5 hover:bg-green-600 hover:text-white px-4 py-2 rounded-lg transition-colors text-gray-300 text-sm font-bold"
                                    >
                                        <CheckCircle size={16} /> Mark as Resolved
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* Orders Tab */}
                {activeTab === 'orders' && (
                    <div className="grid gap-6">
                        {orders.length === 0 && <p className="text-gray-500 text-center py-10">No orders found.</p>}
                        {orders.map(order => (
                            <div key={order._id} className="bg-surface p-6 rounded-xl border border-white/5 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${order.status === 'delivered' ? 'bg-green-500/20 text-green-500' :
                                        order.status === 'received' ? 'bg-blue-500/20 text-blue-500' :
                                            'bg-yellow-500/20 text-yellow-500'
                                        }`}>
                                        {order.status.replace('_', ' ')}
                                    </span>
                                </div>

                                <div className="mb-6">
                                    <h3 className="text-xl font-bold text-white mb-1">
                                        Order {order.orderId ? `#${order.orderId}` : `#${order._id.slice(-6)}`}
                                    </h3>
                                    <p className="text-gray-400 text-sm">{new Date(order.createdAt).toLocaleString()}</p>
                                    <div className="mt-2 text-sm text-gray-300">
                                        <p><span className="text-gray-500">Customer:</span> {order.customer?.name} ({order.customer?.phone})</p>
                                        {order.userId && typeof order.userId === 'object' && (
                                            <p><span className="text-gray-500">User ID:</span> {order.userId.name || order.userId.phone || order.userId._id}</p>
                                        )}
                                        <p><span className="text-gray-500">Address:</span> {order.customer?.address}</p>
                                    </div>
                                </div>

                                <div className="bg-black/20 rounded-lg p-4 mb-6">
                                    {order.items.map((item, idx) => (
                                        <div key={idx} className="flex justify-between items-center mb-2 last:mb-0">
                                            <span className="text-gray-300">{item.quantity}x {item.name}</span>
                                            <span className="text-gray-500">₹{item.price * item.quantity}</span>
                                        </div>
                                    ))}
                                    <div className="border-t border-white/10 mt-3 pt-3 flex justify-between font-bold text-white">
                                        <span>Total</span>
                                        <span className="text-primary">₹{order.totalAmount}</span>
                                    </div>
                                </div>

                                <div className="flex gap-2 flex-wrap">
                                    {order.status === 'received' && (
                                        <button
                                            onClick={() => updateOrderStatus(order._id, 'preparing')}
                                            className="bg-primary/20 hover:bg-primary/40 text-primary border border-primary/50 px-4 py-2 rounded-lg text-sm font-bold transition-colors"
                                        >
                                            Mark as Preparing
                                        </button>
                                    )}
                                    {order.status === 'preparing' && (
                                        <button
                                            onClick={() => updateOrderStatus(order._id, 'out_for_delivery')}
                                            className="bg-yellow-500/20 hover:bg-yellow-500/40 text-yellow-500 border border-yellow-500/50 px-4 py-2 rounded-lg text-sm font-bold transition-colors"
                                        >
                                            Mark Out for Delivery
                                        </button>
                                    )}
                                    {order.status === 'out_for_delivery' && (
                                        <button
                                            onClick={() => updateOrderStatus(order._id, 'delivered')}
                                            className="bg-green-500/20 hover:bg-green-500/40 text-green-500 border border-green-500/50 px-4 py-2 rounded-lg text-sm font-bold transition-colors"
                                        >
                                            Mark Delivered
                                        </button>
                                    )}
                                    {order.status === 'delivered' && (
                                        <span className="text-green-500 flex items-center gap-2 font-bold text-sm bg-green-500/10 px-4 py-2 rounded-full">
                                            <CheckCircle size={16} /> Order Completed
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

            </div>
        </div>
    );
}
