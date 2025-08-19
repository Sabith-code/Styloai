#!/usr/bin/env python3
"""
Startup script for Stylo AI Backend
Checks for required configuration files and starts the server
"""

import os
import sys
from pathlib import Path

def check_requirements():
    """Check if all required files and environment variables are present"""
    errors = []
    warnings = []
    
    # Check for Firebase service account file
    if not os.path.exists("firebase-service-account.json"):
        errors.append("❌ firebase-service-account.json not found")
        print("   → Download from Firebase Console > Project Settings > Service Accounts")
    else:
        print("✅ Firebase service account file found")
    
    # Check for .env file
    if not os.path.exists(".env"):
        warnings.append("⚠️  .env file not found")
        print("   → Copy env.example to .env and fill in your credentials")
    else:
        print("✅ .env file found")
    
    # Check Python dependencies
    try:
        import fastapi
        import firebase_admin
        import cloudinary
        import google.generativeai
        print("✅ All Python dependencies are installed")
    except ImportError as e:
        errors.append(f"❌ Missing Python dependency: {e}")
        print("   → Run: pip install -r requirements.txt")
    
    return errors, warnings

def main():
    """Main startup function"""
    print("🚀 Stylo AI Backend Startup")
    print("=" * 40)
    
    # Check requirements
    errors, warnings = check_requirements()
    
    if warnings:
        print("\n⚠️  Warnings:")
        for warning in warnings:
            print(f"   {warning}")
    
    if errors:
        print("\n❌ Errors found:")
        for error in errors:
            print(f"   {error}")
        print("\nPlease fix the errors above before starting the server.")
        sys.exit(1)
    
    print("\n✅ All checks passed! Starting server...")
    print("=" * 40)
    
    # Start the server
    try:
        import uvicorn
        from main import app
        
        print("🌐 Server starting on http://localhost:8000")
        print("📚 API Documentation: http://localhost:8000/docs")
        print("🔧 Press Ctrl+C to stop the server")
        print("=" * 40)
        
        uvicorn.run(
            "main:app",
            host="0.0.0.0",
            port=8000,
            reload=True,
            log_level="info"
        )
        
    except KeyboardInterrupt:
        print("\n👋 Server stopped by user")
    except Exception as e:
        print(f"\n❌ Error starting server: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
