'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { motion } from 'framer-motion';
import { ArrowRight, User } from 'lucide-react';
import toast from 'react-hot-toast';

const genders = ['male', 'female', 'other'];
const bodyTypes = ['athletic', 'slim', 'curvy', 'plus-size', 'petite', 'tall'];
const faceTypes = ['oval', 'round', 'square', 'heart', 'diamond', 'triangle'];
const skinColors = ['fair', 'light', 'medium', 'olive', 'brown', 'dark'];
const hairStyles = ['short', 'medium', 'long', 'curly', 'straight', 'wavy', 'bald'];
const colors = [
  'red', 'blue', 'green', 'yellow', 'purple', 'pink', 
  'orange', 'black', 'white', 'gray', 'brown', 'navy'
];
const styles = ['casual', 'formal', 'sporty', 'elegant', 'vintage', 'street', 'bohemian'];

export default function QuestionnairePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    gender: '',
    age: '',
    skinColor: '',
    faceType: '',
    bodyType: '',
    hairStyle: '',
    favoriteBrand: '',
    nationality: '',
    favoriteColors: [] as string[],
    favoriteAccessories: '',
    favoriteStyle: '',
    occupation: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
      return;
    }
    // If user is present, check if questionnaire exists
    const checkQuestionnaire = async () => {
      if (user) {
        try {
          const q = await apiClient.getQuestionnaire(user.uid);
          // If questionnaire exists, redirect to dashboard
          if (q) {
            router.push('/dashboard');
          }
        } catch (err: any) {
          // If 404, allow to fill; if 409 or other, handle accordingly
          if (err?.response?.status !== 404) {
            toast.error('Error checking questionnaire');
          }
        }
      }
    };
    checkQuestionnaire();
  }, [user, loading, router]);

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
    return null; // redirecting to login
  }

  const handleColorToggle = (color: string) => {
    setFormData(prev => ({
      ...prev,
      favoriteColors: prev.favoriteColors.includes(color)
        ? prev.favoriteColors.filter(c => c !== color)
        : [...prev.favoriteColors, color]
    }));
  };

  const handleSubmit = async () => {
    if (
      !formData.gender ||
      !formData.age ||
      !formData.skinColor ||
      !formData.faceType ||
      !formData.bodyType ||
      !formData.hairStyle ||
      !formData.favoriteBrand ||
      !formData.nationality ||
      formData.favoriteColors.length === 0 ||
      !formData.favoriteAccessories ||
      !formData.favoriteStyle ||
      !formData.occupation
    ) {
      toast.error('Please complete all fields');
      return;
    }

    setSubmitting(true);
    try {
      await apiClient.saveQuestionnaire(user.uid, formData);
      toast.success('Style preferences saved!');
      router.push('/dashboard');
    } catch (error) {
      console.error('Error saving questionnaire:', error);
      toast.error('Failed to save preferences');
    } finally {
      setSubmitting(false);
    }
  };

  const steps = [
    {
      label: 'Gender',
      content: (
        <div className="space-y-6">
          <div className="text-center mb-8">
            <User className="w-16 h-16 text-purple-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Gender</h2>
            <p className="text-gray-600">Tell us your gender for tailored recommendations</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {genders.map((g) => (
              <button
                key={g}
                onClick={() => setFormData(prev => ({ ...prev, gender: g }))}
                className={`p-4 rounded-xl border-2 transition-all ${
                  formData.gender === g
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-gray-200 hover:border-primary-300'
                }`}
              >
                <span className="capitalize">{g}</span>
              </button>
            ))}
          </div>
        </div>
      ),
    },
    {
      label: 'Age',
      content: (
        <div className="space-y-6">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">Age</h2>
            <p className="text-gray-600">Enter your age</p>
          </div>
          <div className="flex justify-center">
            <input
              type="number"
              min={1}
              max={120}
              value={formData.age}
              onChange={e => setFormData(prev => ({ ...prev, age: e.target.value }))}
              className="w-32 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-center"
              placeholder="Your age"
              required
            />
          </div>
        </div>
      ),
    },
    {
      label: 'Skin Color',
      content: (
        <div className="space-y-6">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">Skin Color</h2>
            <p className="text-gray-600">Select your skin color</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {skinColors.map((color) => (
              <button
                key={color}
                onClick={() => setFormData(prev => ({ ...prev, skinColor: color }))}
                className={`p-4 rounded-xl border-2 transition-all ${
                  formData.skinColor === color
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-gray-200 hover:border-primary-300'
                }`}
              >
                <span className="capitalize">{color}</span>
              </button>
            ))}
          </div>
        </div>
      ),
    },
    {
      label: 'Face Type',
      content: (
        <div className="space-y-6">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">Face Type</h2>
            <p className="text-gray-600">Select your face type</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {faceTypes.map((type) => (
              <button
                key={type}
                onClick={() => setFormData(prev => ({ ...prev, faceType: type }))}
                className={`p-4 rounded-xl border-2 transition-all ${
                  formData.faceType === type
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-gray-200 hover:border-primary-300'
                }`}
              >
                <span className="capitalize">{type}</span>
              </button>
            ))}
          </div>
        </div>
      ),
    },
    {
      label: 'Body Type',
      content: (
        <div className="space-y-6">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">Body Type</h2>
            <p className="text-gray-600">Select your body type</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {bodyTypes.map((type) => (
              <button
                key={type}
                onClick={() => setFormData(prev => ({ ...prev, bodyType: type }))}
                className={`p-4 rounded-xl border-2 transition-all ${
                  formData.bodyType === type
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-gray-200 hover:border-primary-300'
                }`}
              >
                <span className="capitalize">{type}</span>
              </button>
            ))}
          </div>
        </div>
      ),
    },
    {
      label: 'Hair Style',
      content: (
        <div className="space-y-6">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">Hair Style</h2>
            <p className="text-gray-600">Select your hair style</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {hairStyles.map((style) => (
              <button
                key={style}
                onClick={() => setFormData(prev => ({ ...prev, hairStyle: style }))}
                className={`p-4 rounded-xl border-2 transition-all ${
                  formData.hairStyle === style
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-gray-200 hover:border-primary-300'
                }`}
              >
                <span className="capitalize">{style}</span>
              </button>
            ))}
          </div>
        </div>
      ),
    },
    {
      label: 'Favorite Brand',
      content: (
        <div className="space-y-6">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">Favorite Brand</h2>
            <p className="text-gray-600">Enter your favorite clothing brand</p>
          </div>
          <div className="flex justify-center">
            <input
              type="text"
              value={formData.favoriteBrand}
              onChange={e => setFormData(prev => ({ ...prev, favoriteBrand: e.target.value }))}
              className="w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-center"
              placeholder="e.g. Nike, Zara, H&M"
              required
            />
          </div>
        </div>
      ),
    },
    {
      label: 'Nationality',
      content: (
        <div className="space-y-6">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">Nationality</h2>
            <p className="text-gray-600">Enter your nationality</p>
          </div>
          <div className="flex justify-center">
            <input
              type="text"
              value={formData.nationality}
              onChange={e => setFormData(prev => ({ ...prev, nationality: e.target.value }))}
              className="w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-center"
              placeholder="e.g. Indian, American"
              required
            />
          </div>
        </div>
      ),
    },
    {
      label: 'Favorite Color(s)',
      content: (
        <div className="space-y-6">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">Favorite Color(s)</h2>
            <p className="text-gray-600">Select your favorite colors (multiple allowed)</p>
          </div>
          <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
            {colors.map((color) => (
              <button
                key={color}
                onClick={() => handleColorToggle(color)}
                className={`p-4 rounded-xl border-2 transition-all ${
                  formData.favoriteColors.includes(color)
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-gray-200 hover:border-primary-300'
                }`}
              >
                <span className="capitalize">{color}</span>
              </button>
            ))}
          </div>
          {formData.favoriteColors.length > 0 && (
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">Selected colors:</p>
              <div className="flex flex-wrap justify-center gap-2">
                {formData.favoriteColors.map((color) => (
                  <span
                    key={color}
                    className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm capitalize"
                  >
                    {color}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      ),
    },
    {
      label: 'Favorite Accessories',
      content: (
        <div className="space-y-6">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">Favorite Accessories</h2>
            <p className="text-gray-600">Enter your favorite accessories</p>
          </div>
          <div className="flex justify-center">
            <input
              type="text"
              value={formData.favoriteAccessories}
              onChange={e => setFormData(prev => ({ ...prev, favoriteAccessories: e.target.value }))}
              className="w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-center"
              placeholder="e.g. watches, hats, scarves"
              required
            />
          </div>
        </div>
      ),
    },
    {
      label: 'Favorite Style',
      content: (
        <div className="space-y-6">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">Favorite Style</h2>
            <p className="text-gray-600">Select your favorite style</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {styles.map((style) => (
              <button
                key={style}
                onClick={() => setFormData(prev => ({ ...prev, favoriteStyle: style }))}
                className={`p-4 rounded-xl border-2 transition-all ${
                  formData.favoriteStyle === style
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-gray-200 hover:border-primary-300'
                }`}
              >
                <span className="capitalize">{style}</span>
              </button>
            ))}
          </div>
        </div>
      ),
    },
    {
      label: 'Occupation',
      content: (
        <div className="space-y-6">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">Occupation</h2>
            <p className="text-gray-600">Enter your occupation</p>
          </div>
          <div className="flex justify-center">
            <input
              type="text"
              value={formData.occupation}
              onChange={e => setFormData(prev => ({ ...prev, occupation: e.target.value }))}
              className="w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-center"
              placeholder="e.g. student, engineer, artist"
              required
            />
          </div>
        </div>
      ),
    },
  ];

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStep = () => steps[currentStep - 1]?.content;

  return (
    <div className="min-h-screen bg-gradient py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* StyloAI Heading */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-purple-700">StyloAI</h1>
          <p className="text-lg text-gray-600 mt-2">Your personal AI stylist</p>
        </div>
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm text-gray-600">Step {currentStep} of {steps.length}</span>
            <span className="text-sm text-gray-600">{Math.round((currentStep / steps.length) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-primary-500 to-secondary-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / steps.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Step Content */}
        <div className="card">{renderStep()}</div>

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <button
            onClick={prevStep}
            disabled={currentStep === 1}
            className={`px-6 py-3 rounded-full border-2 transition-all ${
              currentStep === 1
                ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                : 'border-primary-600 text-primary-600 hover:bg-primary-600 hover:text-white'
            }`}
          >
            Previous
          </button>

          {currentStep < steps.length ? (
            <button onClick={nextStep} className="btn-primary flex items-center space-x-2">
              <span>Next</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="btn-primary flex items-center space-x-2"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <span>Complete Setup</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
