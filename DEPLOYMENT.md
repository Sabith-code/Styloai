# Deployment Guide

This guide covers deploying the Stylo AI Backend to various hosting platforms.

## Prerequisites

Before deploying, ensure you have:
- All environment variables configured
- Firebase service account key
- Cloudinary and Gemini API credentials
- Domain name (optional)

## Deployment Options

### 1. Railway (Recommended for MVP)

Railway is a simple platform for deploying FastAPI applications.

#### Setup Steps:

1. **Install Railway CLI**:
   ```bash
   npm install -g @railway/cli
   ```

2. **Login to Railway**:
   ```bash
   railway login
   ```

3. **Initialize Project**:
   ```bash
   railway init
   ```

4. **Add Environment Variables**:
   ```bash
   railway variables set CLOUDINARY_CLOUD_NAME=your_cloud_name
   railway variables set CLOUDINARY_API_KEY=your_api_key
   railway variables set CLOUDINARY_API_SECRET=your_api_secret
   railway variables set GEMINI_API_KEY=your_gemini_key
   ```

5. **Upload Firebase Service Account**:
   ```bash
   railway variables set FIREBASE_SERVICE_ACCOUNT="$(cat firebase-service-account.json)"
   ```

6. **Deploy**:
   ```bash
   railway up
   ```

### 2. Render

Render provides free hosting for web services.

#### Setup Steps:

1. **Create a Render Account** at [render.com](https://render.com)

2. **Create New Web Service**:
   - Connect your GitHub repository
   - Choose "Python" as runtime
   - Set build command: `pip install -r requirements.txt`
   - Set start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`

3. **Add Environment Variables** in Render dashboard:
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`
   - `GEMINI_API_KEY`

4. **Add Firebase Service Account**:
   - Create a new environment variable called `FIREBASE_SERVICE_ACCOUNT`
   - Copy the entire content of your `firebase-service-account.json` file

5. **Deploy**:
   - Render will automatically deploy when you push to your main branch

### 3. Heroku

Heroku is a popular platform for Python applications.

#### Setup Steps:

1. **Install Heroku CLI**:
   ```bash
   # macOS
   brew install heroku/brew/heroku
   
   # Windows
   # Download from https://devcenter.heroku.com/articles/heroku-cli
   ```

2. **Create Heroku App**:
   ```bash
   heroku create your-app-name
   ```

3. **Add Buildpack**:
   ```bash
   heroku buildpacks:set heroku/python
   ```

4. **Create Procfile**:
   ```bash
   echo "web: uvicorn main:app --host 0.0.0.0 --port \$PORT" > Procfile
   ```

5. **Set Environment Variables**:
   ```bash
   heroku config:set CLOUDINARY_CLOUD_NAME=your_cloud_name
   heroku config:set CLOUDINARY_API_KEY=your_api_key
   heroku config:set CLOUDINARY_API_SECRET=your_api_secret
   heroku config:set GEMINI_API_KEY=your_gemini_key
   ```

6. **Add Firebase Service Account**:
   ```bash
   heroku config:set FIREBASE_SERVICE_ACCOUNT="$(cat firebase-service-account.json)"
   ```

7. **Deploy**:
   ```bash
   git add .
   git commit -m "Deploy to Heroku"
   git push heroku main
   ```

### 4. DigitalOcean App Platform

DigitalOcean provides managed app hosting.

#### Setup Steps:

1. **Create DigitalOcean Account** at [digitalocean.com](https://digitalocean.com)

2. **Create New App**:
   - Connect your GitHub repository
   - Choose "Python" as runtime
   - Set build command: `pip install -r requirements.txt`
   - Set run command: `uvicorn main:app --host 0.0.0.0 --port $PORT`

3. **Add Environment Variables**:
   - Add all required environment variables in the app settings

4. **Deploy**:
   - DigitalOcean will automatically deploy your app

## Environment Variables for Production

Make sure to set these environment variables in your hosting platform:

```env
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
GEMINI_API_KEY=your_gemini_api_key
FIREBASE_SERVICE_ACCOUNT={"type": "service_account", ...}
```

## Firebase Service Account Setup

For platforms that don't support file uploads, you'll need to set the Firebase service account as an environment variable:

1. **Read the JSON file**:
   ```bash
   cat firebase-service-account.json
   ```

2. **Copy the entire JSON content** and set it as an environment variable named `FIREBASE_SERVICE_ACCOUNT`

3. **Update main.py** to handle the environment variable:
   ```python
   import json
   import os
   
   # Initialize Firebase
   if not firebase_admin._apps:
       if os.getenv("FIREBASE_SERVICE_ACCOUNT"):
           # Use environment variable
           cred_dict = json.loads(os.getenv("FIREBASE_SERVICE_ACCOUNT"))
           cred = credentials.Certificate(cred_dict)
       else:
           # Use file
           cred = credentials.Certificate("firebase-service-account.json")
       firebase_admin.initialize_app(cred)
   ```

## Custom Domain Setup

### Railway
1. Go to your project settings
2. Add custom domain
3. Update DNS records as instructed

### Render
1. Go to your service settings
2. Add custom domain
3. Update DNS records as instructed

### Heroku
```bash
heroku domains:add yourdomain.com
# Update DNS records as instructed
```

## SSL/HTTPS

Most platforms automatically provide SSL certificates. For custom domains:
- Railway: Automatic SSL
- Render: Automatic SSL
- Heroku: Automatic SSL with paid plans
- DigitalOcean: Automatic SSL

## Monitoring and Logs

### Railway
```bash
railway logs
```

### Render
- View logs in the Render dashboard
- Set up log forwarding if needed

### Heroku
```bash
heroku logs --tail
```

### DigitalOcean
- View logs in the DigitalOcean dashboard
- Set up log forwarding if needed

## Scaling Considerations

For production scaling:

1. **Database**: Consider using Firebase Firestore production rules
2. **Image Storage**: Cloudinary free tier has limits, consider paid plans
3. **AI API**: Monitor Gemini API usage and costs
4. **Caching**: Add Redis for caching if needed
5. **CDN**: Use Cloudinary's CDN for image delivery

## Security Checklist

- [ ] Environment variables are set (not in code)
- [ ] Firebase service account is secure
- [ ] CORS is properly configured for production
- [ ] API rate limiting is implemented
- [ ] Input validation is working
- [ ] Error handling doesn't expose sensitive information

## Troubleshooting

### Common Issues:

1. **Port Issues**: Make sure to use `$PORT` environment variable
2. **Dependencies**: Ensure all packages are in `requirements.txt`
3. **Environment Variables**: Double-check all variables are set
4. **Firebase**: Verify service account JSON is correct
5. **CORS**: Update CORS origins for your domain

### Debug Commands:

```bash
# Check if server starts locally
python start.py

# Test API endpoints
python test_api.py

# Check environment variables
python -c "import os; print(os.getenv('CLOUDINARY_CLOUD_NAME'))"
```


