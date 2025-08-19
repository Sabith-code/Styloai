'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { VoiceRecorder } from '@/components/VoiceRecorder';
import { motion } from 'framer-motion';
import { Sparkles, Shirt, LogOut, MessageCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface Outfit {
  type: string;
  items: string[];
  comment: string;
}

export default function DashboardPage() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();
  const [recommendations, setRecommendations] = useState<Outfit[]>([]);
  const [voiceResponse, setVoiceResponse] = useState('');
  const [loadingState, setLoadingState] = useState(false);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
      return;
    }
    if (user) {
      loadRecommendations();
    }
  }, [user, loading, router]);

  const loadRecommendations = async () => {
    if (!user) return;
    
    setLoadingRecommendations(true);
    try {
      const data = await apiClient.getRecommendations(user.uid);
      setRecommendations(data.outfits || []);
    } catch (error) {
      console.error('Error loading recommendations:', error);
      toast.error('Failed to load recommendations');
    } finally {
      setLoadingRecommendations(false);
    }
  };

  const handleVoiceTranscript = async (text: string) => {
    setLoadingState(true);
    try {
      if (!user) throw new Error('User not authenticated');
      const response = await apiClient.sendVoiceMessage(text, user.uid);
      setVoiceResponse(response.response);
    } catch (error) {
      console.error('Error sending voice message:', error);
      toast.error('Failed to get AI response');
    } finally {
      setLoadingState(false);
    }
  };

  const handleVoiceResponse = (response: string) => {
    setVoiceResponse(response);
  };

  const handleLogout = async () => {
    await logout();
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
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Sparkles className="w-8 h-8 text-purple-600" />
              <h1 className="text-xl font-bold text-gray-900">Stylo AI</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/wardrobe')}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
              >
                <Shirt className="w-4 h-4" />
                <span>Wardrobe</span>
              </button>
              <button
                onClick={handleLogout}
                className="text-gray-600 hover:text-gray-800 transition-colors"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>
      {/* StyloAI Heading */}
      <div className="w-full flex flex-col items-center mt-8 mb-4">
        <h1 className="text-4xl font-bold text-purple-700">StyloAI</h1>
        <p className="text-lg text-gray-600 mt-2">Your personal AI stylist</p>
      </div>
      <main className="flex flex-col items-center justify-center w-full py-12 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-3xl space-y-6"
        >
          <div className="card p-8 lg:p-12 xl:p-16">
            <div className="text-center mb-8">
              <MessageCircle className="w-16 h-16 text-primary-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Talk to Stylo AI</h2>
              <p className="text-gray-600">
                Ask for fashion advice, outfit suggestions, or style tips
              </p>
            </div>
            <VoiceRecorder
              onTranscript={handleVoiceTranscript}
              onResponse={handleVoiceResponse}
              disabled={loadingState}
            />
            {loadingState && (
              <div className="text-center mt-6">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                <p className="text-sm text-gray-600 mt-2">AI is thinking...</p>
              </div>
            )}
            {voiceResponse && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card mt-6"
              >
                <h3 className="text-lg font-semibold mb-2 flex items-center space-x-2">
                  <Sparkles className="w-5 h-5 text-primary-600" />
                  <span>AI Response</span>
                </h3>
                <p className="text-gray-700 leading-relaxed">{voiceResponse}</p>
              </motion.div>
            )}
          </div>
        </motion.div>
      </main>
    </div>
  );
}
