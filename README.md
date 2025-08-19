# Stylo AI Frontend

A modern Next.js frontend for the Stylo AI MVP that provides an intuitive interface for fashion recommendations, wardrobe management, and voice interactions.

## Features

- 🔐 **Firebase Authentication** - Secure Google login with automatic token management
- 🎤 **Voice Assistant** - Speech-to-text and text-to-speech functionality
- 👔 **Wardrobe Management** - Add, edit, and delete clothing items with image upload
- 📝 **Style Questionnaire** - Multi-step form for collecting user preferences
- 🤖 **AI Recommendations** - Real-time outfit suggestions from the backend
- 📱 **Responsive Design** - Modern UI that works on all devices
- 🎨 **Beautiful Animations** - Smooth transitions and micro-interactions

## Tech Stack

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Firebase Auth** - User authentication and token management
- **Framer Motion** - Animation library
- **React Hot Toast** - Toast notifications
- **React Dropzone** - File upload handling
- **Lucide React** - Icon library

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Firebase project with Authentication enabled
- Backend API running (see backend README)
- Cloudinary account for image uploads

### Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd stylo-ai-frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   ```bash
   cp env.local.example .env.local
   ```
   
   Fill in your configuration in `.env.local`:
   ```env
   # Firebase Configuration
   NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
   NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef123456

   # Backend API URL
   NEXT_PUBLIC_API_URL=http://localhost:8000

   # Cloudinary Configuration
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=stylo_wardrobe
   ```

4. **Run the development server**:
   ```bash
   npm run dev
   ```

5. **Open your browser** and navigate to `http://localhost:3000`

## Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing one
3. Enable Authentication:
   - Go to Authentication > Sign-in method
   - Enable Google provider
4. Get your configuration:
   - Go to Project Settings > General
   - Scroll down to "Your apps" section
   - Add a web app if you haven't already
   - Copy the configuration values to your `.env.local`

## Cloudinary Setup

1. Sign up at [Cloudinary](https://cloudinary.com/)
2. Go to Settings > Upload
3. Create an upload preset:
   - Set to "Unsigned"
   - Name it "stylo_wardrobe"
   - Set folder to "wardrobe"
4. Copy your cloud name to `.env.local`

## Project Structure

```
stylo-ai-frontend/
├── app/                    # Next.js App Router pages
│   ├── dashboard/         # Main dashboard with AI assistant
│   ├── questionnaire/     # Style preference form
│   ├── wardrobe/          # Wardrobe management
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Landing page
├── components/            # Reusable components
│   ├── AuthProvider.tsx   # Firebase auth context
│   ├── VoiceRecorder.tsx  # Speech-to-text component
│   └── ImageUpload.tsx    # Cloudinary upload component
├── lib/                   # Utility libraries
│   ├── firebase.ts        # Firebase configuration
│   └── api.ts            # Backend API client
├── public/               # Static assets
└── package.json          # Dependencies and scripts
```

## Key Components

### AuthProvider
Manages Firebase authentication state and provides login/logout functionality.

### VoiceRecorder
Handles speech-to-text using Web Speech API and text-to-speech for AI responses.

### ImageUpload
Manages image uploads to Cloudinary with drag-and-drop functionality.

### API Client
Handles all backend communication with automatic Firebase token injection.

## Pages

### Landing Page (`/`)
- Welcome screen with feature overview
- Google login button
- Automatic redirect to questionnaire if not completed

### Questionnaire (`/questionnaire`)
- Multi-step form for style preferences
- Progress indicator
- Body type, face shape, skin tone, color preferences

### Dashboard (`/dashboard`)
- Main AI assistant interface
- Voice interaction
- Outfit recommendations display
- Navigation to wardrobe

### Wardrobe (`/wardrobe`)
- Grid view of clothing items
- Add/edit/delete functionality
- Image upload with Cloudinary
- Item categorization

## API Integration

The frontend communicates with the backend using the following endpoints:

- `POST /api/questionnaire` - Save user preferences
- `GET /api/questionnaire/:userId` - Get user preferences
- `POST /api/wardrobe` - Add wardrobe item
- `GET /api/wardrobe/:userId` - Get user's wardrobe
- `DELETE /api/wardrobe/:itemId` - Delete wardrobe item
- `POST /api/recommend` - Get AI recommendations
- `POST /api/voice` - Send voice message to AI

All requests automatically include Firebase ID tokens for authentication.

## Voice Features

### Speech Recognition
- Uses Web Speech API
- Supports multiple browsers
- Real-time transcription
- Error handling for unsupported browsers

### Text-to-Speech
- Browser-native speech synthesis
- Automatic playback of AI responses
- Configurable voice settings

## Styling

The app uses Tailwind CSS with custom components:

- `.btn-primary` - Primary action buttons
- `.btn-secondary` - Secondary action buttons
- `.btn-outline` - Outline style buttons
- `.card` - Card containers
- `.input-field` - Form inputs
- `.voice-button` - Voice recording button
- `.text-gradient` - Gradient text effects

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically

### Other Platforms

The app can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase API key | Yes |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase auth domain | Yes |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase project ID | Yes |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket | Yes |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID | Yes |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase app ID | Yes |
| `NEXT_PUBLIC_API_URL` | Backend API URL | Yes |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | Yes |
| `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` | Cloudinary upload preset | Yes |

## Browser Support

- Chrome/Edge (full support)
- Firefox (full support)
- Safari (limited voice features)
- Mobile browsers (responsive design)

## Troubleshooting

### Voice Not Working
- Ensure HTTPS in production (required for Web Speech API)
- Check browser permissions for microphone
- Some browsers may require user interaction before enabling voice

### Image Upload Issues
- Verify Cloudinary configuration
- Check upload preset permissions
- Ensure image file size is reasonable

### Authentication Problems
- Verify Firebase configuration
- Check if Google sign-in is enabled
- Ensure domain is authorized in Firebase console

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
