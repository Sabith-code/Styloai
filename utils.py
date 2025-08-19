import cloudinary.uploader
import os
from typing import Dict, Any, List
import json

def upload_image_to_cloudinary(image_file, folder: str = "wardrobe") -> Dict[str, Any]:
    """
    Upload an image to Cloudinary and return the URL and metadata.
    
    Args:
        image_file: The image file to upload
        folder: The folder in Cloudinary to store the image
    
    Returns:
        Dict containing image URL and metadata
    """
    try:
        result = cloudinary.uploader.upload(
            image_file,
            folder=folder,
            resource_type="image",
            transformation=[
                {"width": 800, "height": 800, "crop": "limit"},
                {"quality": "auto", "fetch_format": "auto"}
            ]
        )
        
        return {
            "url": result["secure_url"],
            "public_id": result["public_id"],
            "width": result["width"],
            "height": result["height"],
            "format": result["format"]
        }
    except Exception as e:
        raise Exception(f"Failed to upload image to Cloudinary: {str(e)}")

def delete_image_from_cloudinary(public_id: str) -> bool:
    """
    Delete an image from Cloudinary.
    
    Args:
        public_id: The public ID of the image to delete
    
    Returns:
        True if successful, False otherwise
    """
    try:
        result = cloudinary.uploader.destroy(public_id)
        return result.get("result") == "ok"
    except Exception as e:
        print(f"Failed to delete image from Cloudinary: {str(e)}")
        return False

def generate_ai_prompt(questionnaire_data: Dict[str, Any], wardrobe_items: List[Dict[str, Any]]) -> str:
    """
    Generate a comprehensive AI prompt for outfit recommendations.
    
    Args:
        questionnaire_data: User's questionnaire answers
        wardrobe_items: User's wardrobe items
    
    Returns:
        Formatted prompt string for AI
    """
    prompt = f"""
    As a fashion AI assistant, create outfit recommendations for a user based on their profile and wardrobe.
    
    User Profile:
    - Body Type: {questionnaire_data.get('bodyType', 'Not specified')}
    - Face Type: {questionnaire_data.get('faceType', 'Not specified')}
    - Skin Tone: {questionnaire_data.get('skinTone', 'Not specified')}
    - Color Preferences: {questionnaire_data.get('colorPreferences', [])}
    
    Current Wardrobe Items ({len(wardrobe_items)} items):
    {json.dumps(wardrobe_items, indent=2)}
    
    Please provide 3 types of outfit recommendations:
    1. Wardrobe-only outfits (using only items from their current wardrobe)
    2. Mixed outfits (combining wardrobe items with suggested new items)
    3. New outfit suggestions (completely new items that would complement their style)
    
    For each outfit, include:
    - Type: "wardrobe_only", "mix", or "new"
    - Items: List of clothing items with specific details (color, style, etc.)
    - Comment: Brief explanation of the outfit and why it works for their profile
    
    Consider:
    - Color harmony with their skin tone and preferences
    - Body type flattering combinations
    - Seasonal appropriateness
    - Occasion suitability
    
    Return the response as a JSON object with an "outfits" array containing these 3 outfit objects.
    """
    
    return prompt

def generate_voice_prompt(user_text: str) -> str:
    """
    Generate a prompt for the voice assistant.
    
    Args:
        user_text: User's input text
    
    Returns:
        Formatted prompt string for AI
    """
    prompt = f"""
    You are a friendly fashion assistant. The user said: "{user_text}"
    
    Provide a helpful, conversational response about fashion advice, outfit suggestions, or style tips.
    Keep your response:
    - Under 100 words
    - Friendly and encouraging
    - Specific and actionable
    - Relevant to their question
    
    If they're asking for outfit suggestions, consider:
    - Occasion appropriateness
    - Seasonal factors
    - General style principles
    - Color coordination tips
    """
    
    return prompt

def validate_wardrobe_item(item_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Validate and clean wardrobe item data.
    
    Args:
        item_data: Raw wardrobe item data
    
    Returns:
        Cleaned and validated data
    """
    # Define valid options
    valid_types = ["shirt", "pants", "dress", "skirt", "jacket", "sweater", "shoes", "accessory"]
    valid_natures = ["casual", "formal", "business", "party", "sport", "elegant"]
    
    # Clean and validate type
    item_type = item_data.get("type", "").lower().strip()
    if item_type not in valid_types:
        item_type = "accessory"  # Default fallback
    
    # Clean and validate nature
    nature = item_data.get("nature", "").lower().strip()
    if nature not in valid_natures:
        nature = "casual"  # Default fallback
    
    # Clean color
    color = item_data.get("color", "").lower().strip()
    
    # Validate image URL
    image_url = item_data.get("imageUrl", "")
    if not image_url.startswith("http"):
        raise ValueError("Invalid image URL")
    
    return {
        "type": item_type,
        "color": color,
        "nature": nature,
        "imageUrl": image_url
    }

def validate_questionnaire_data(answers: Dict[str, Any]) -> Dict[str, Any]:
    """
    Validate and clean questionnaire data.
    
    Args:
        answers: Raw questionnaire answers
    
    Returns:
        Cleaned and validated data
    """
    # Define valid options
    valid_body_types = ["athletic", "slim", "curvy", "plus-size", "petite", "tall"]
    valid_face_types = ["oval", "round", "square", "heart", "diamond", "triangle"]
    valid_skin_tones = ["warm", "cool", "neutral", "olive", "fair", "medium", "dark"]
    
    # Clean and validate body type
    body_type = answers.get("bodyType", "").lower().strip()
    if body_type not in valid_body_types:
        body_type = "athletic"  # Default fallback
    
    # Clean and validate face type
    face_type = answers.get("faceType", "").lower().strip()
    if face_type not in valid_face_types:
        face_type = "oval"  # Default fallback
    
    # Clean and validate skin tone
    skin_tone = answers.get("skinTone", "").lower().strip()
    if skin_tone not in valid_skin_tones:
        skin_tone = "neutral"  # Default fallback
    
    # Clean color preferences
    color_preferences = answers.get("colorPreferences", [])
    if isinstance(color_preferences, str):
        color_preferences = [color_preferences]
    color_preferences = [color.lower().strip() for color in color_preferences if color.strip()]
    
    return {
        "bodyType": body_type,
        "faceType": face_type,
        "skinTone": skin_tone,
        "colorPreferences": color_preferences
    }


