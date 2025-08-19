'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { ImageUpload } from '@/components/ImageUpload';
import { motion } from 'framer-motion';
import { Sparkles, Shirt, Plus, Trash2, Edit, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

interface WardrobeItem {
  id: string;
  type: string;
  color: string;
  nature: string;
  imageUrl: string;
}

export default function WardrobePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [items, setItems] = useState<WardrobeItem[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loadingItems, setLoadingItems] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    type: '',
    color: '',
    nature: '',
    imageUrl: '',
    material: '',
    brand: '',
    size: '',
  });

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
      return;
    }
    if (user) {
      loadWardrobe();
    }
  }, [user, loading, router]);

  const loadWardrobe = async () => {
    if (!user) return;
    
    setLoadingItems(true);
    try {
      const data = await apiClient.getWardrobe(user.uid);
      setItems(data.items || []);
    } catch (error) {
      console.error('Error loading wardrobe:', error);
      toast.error('Failed to load wardrobe');
    } finally {
      setLoadingItems(false);
    }
  };

  const handleImageUpload = (imageUrl: string) => {
    setFormData(prev => ({ ...prev, imageUrl }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!formData.type || !formData.color || !formData.nature || !formData.imageUrl || !formData.material || !formData.brand || !formData.size) {
      toast.error('Please fill in all fields');
      return;
    }

    setSubmitting(true);
    try {
      await apiClient.addWardrobeItem({
        userId: user.uid,
        ...formData,
      });
      toast.success('Item added successfully!');
  setFormData({ type: '', color: '', nature: '', imageUrl: '', material: '', brand: '', size: '' });
      setShowAddForm(false);
      loadWardrobe();
    } catch (error) {
      console.error('Error adding item:', error);
      toast.error('Failed to add item');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (itemId: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
      if (!user) throw new Error('User not found');
      await apiClient.deleteWardrobeItem(user.uid, itemId);
      toast.success('Item deleted successfully!');
      loadWardrobe();
    } catch (error) {
      console.error('Error deleting item:', error);
      toast.error('Failed to delete item');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      {/* StyloAI Heading */}
      <div className="w-full flex flex-col items-center mt-8 mb-4">
        <h1 className="text-4xl font-bold text-purple-700">StyloAI</h1>
        <p className="text-lg text-gray-600 mt-2">Your personal AI stylist</p>
      </div>
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => router.push('/dashboard')}
                className="text-gray-600 hover:text-gray-800 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <Sparkles className="w-8 h-8 text-purple-600" />
              <h1 className="text-xl font-bold text-gray-900">My Wardrobe</h1>
            </div>
            
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Item</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-lg p-6 mb-8"
          >
            <h2 className="text-2xl font-bold mb-6">Add New Item</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select type</option>
                    <option value="shirt">Shirt</option>
                    <option value="pants">Pants</option>
                    <option value="dress">Dress</option>
                    <option value="shoes">Shoes</option>
                    <option value="jacket">Jacket</option>
                    <option value="accessory">Accessory</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Color
                  </label>
                  <input
                    type="text"
                    value={formData.color}
                    onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="e.g., blue, red, black"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nature
                  </label>
                  <select
                    value={formData.nature}
                    onChange={(e) => setFormData(prev => ({ ...prev, nature: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select nature</option>
                    <option value="casual">Casual</option>
                    <option value="formal">Formal</option>
                    <option value="sporty">Sporty</option>
                    <option value="elegant">Elegant</option>
                    <option value="vintage">Vintage</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Material
                  </label>
                  <input
                    type="text"
                    value={formData.material}
                    onChange={(e) => setFormData(prev => ({ ...prev, material: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="e.g., cotton, denim, wool"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Brand
                  </label>
                  <input
                    type="text"
                    value={formData.brand}
                    onChange={(e) => setFormData(prev => ({ ...prev, brand: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="e.g., Nike, Zara"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Size
                  </label>
                  <input
                    type="text"
                    value={formData.size}
                    onChange={(e) => setFormData(prev => ({ ...prev, size: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="e.g., M, 32, 8.5"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Image
                </label>
                <ImageUpload onImageUpload={handleImageUpload} />
                {formData.imageUrl && (
                  <p className="text-sm text-green-600 mt-2">✓ Image uploaded successfully</p>
                )}
              </div>

              <div className="flex space-x-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Adding...' : 'Add Item'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {/* Wardrobe Grid */}
        {loadingItems ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading wardrobe...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-12">
            <Shirt className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Your wardrobe is empty</h3>
            <p className="text-gray-600 mb-6">Add your first item to get started!</p>
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
            >
              Add Your First Item
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {items.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
              >
                <div className="aspect-square bg-gray-100">
                  <img
                    src={item.imageUrl || "/placeholder-wardrobe.png"}
                    alt={item.type}
                    className="w-full h-full object-cover"
                    onError={e => {
                      (e.target as HTMLImageElement).src = "/placeholder-wardrobe.png";
                    }}
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 capitalize">{item.type}</h3>
                  <p className="text-sm text-gray-600 capitalize">{item.color}</p>
                  <p className="text-sm text-gray-600 capitalize">{item.nature}</p>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="mt-2 text-red-600 hover:text-red-800 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
