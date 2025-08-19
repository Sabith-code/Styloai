import requests
import json

# Configuration
BASE_URL = "http://localhost:8000"
FIREBASE_TOKEN = "YOUR_FIREBASE_TOKEN_HERE"  # Replace with actual token
USER_ID = "test_user_123"

# Headers for authenticated requests
auth_headers = {
    "Authorization": f"Bearer {FIREBASE_TOKEN}",
    "Content-Type": "application/json"
}

def test_root():
    """Test the root endpoint"""
    response = requests.get(f"{BASE_URL}/")
    print("Root endpoint:", response.json())
    return response.status_code == 200

def test_create_questionnaire():
    """Test creating a questionnaire"""
    data = {
        "userId": USER_ID,
        "answers": {
            "bodyType": "athletic",
            "faceType": "oval",
            "skinTone": "warm",
            "colorPreferences": ["blue", "black", "white"]
        }
    }
    
    response = requests.post(f"{BASE_URL}/api/questionnaire", 
                           headers=auth_headers, 
                           json=data)
    print("Create questionnaire:", response.json())
    return response.status_code == 200

def test_get_questionnaire():
    """Test getting a questionnaire"""
    response = requests.get(f"{BASE_URL}/api/questionnaire/{USER_ID}", 
                          headers=auth_headers)
    print("Get questionnaire:", response.json())
    return response.status_code == 200

def test_add_wardrobe_item():
    """Test adding a wardrobe item"""
    data = {
        "userId": USER_ID,
        "type": "shirt",
        "color": "blue",
        "nature": "casual",
        "imageUrl": "https://res.cloudinary.com/demo/image/upload/v123/wardrobe/blue_shirt.jpg"
    }
    
    response = requests.post(f"{BASE_URL}/api/wardrobe", 
                           headers=auth_headers, 
                           json=data)
    print("Add wardrobe item:", response.json())
    return response.status_code == 200

def test_get_wardrobe():
    """Test getting wardrobe items"""
    response = requests.get(f"{BASE_URL}/api/wardrobe/{USER_ID}", 
                          headers=auth_headers)
    print("Get wardrobe:", response.json())
    return response.status_code == 200

def test_get_recommendations():
    """Test getting AI recommendations"""
    data = {
        "userId": USER_ID
    }
    
    response = requests.post(f"{BASE_URL}/api/recommend", 
                           headers=auth_headers, 
                           json=data)
    print("Get recommendations:", response.json())
    return response.status_code == 200

def test_voice_assistant():
    """Test the voice assistant"""
    data = {
        "text": "Suggest me a casual outfit for a weekend brunch"
    }
    
    response = requests.post(f"{BASE_URL}/api/voice", 
                           json=data)
    print("Voice assistant:", response.json())
    return response.status_code == 200

def run_all_tests():
    """Run all tests"""
    print("Running API tests...")
    print("=" * 50)
    
    tests = [
        ("Root endpoint", test_root),
        ("Create questionnaire", test_create_questionnaire),
        ("Get questionnaire", test_get_questionnaire),
        ("Add wardrobe item", test_add_wardrobe_item),
        ("Get wardrobe", test_get_wardrobe),
        ("Get recommendations", test_get_recommendations),
        ("Voice assistant", test_voice_assistant),
    ]
    
    results = []
    for test_name, test_func in tests:
        try:
            success = test_func()
            status = "✅ PASS" if success else "❌ FAIL"
            results.append((test_name, status))
        except Exception as e:
            status = f"❌ ERROR: {str(e)}"
            results.append((test_name, status))
    
    print("\nTest Results:")
    print("=" * 50)
    for test_name, status in results:
        print(f"{test_name}: {status}")

if __name__ == "__main__":
    print("API Test Suite for Stylo AI Backend")
    print("Make sure the server is running on http://localhost:8000")
    print("Update FIREBASE_TOKEN with a valid token before running tests")
    print()
    
    # Uncomment the line below to run tests
    # run_all_tests()
    
    print("To run tests, uncomment the run_all_tests() call in the script")


