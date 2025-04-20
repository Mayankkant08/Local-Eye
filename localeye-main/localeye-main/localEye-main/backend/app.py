from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import os
from datetime import datetime
import hashlib

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Create data directory if it doesn't exist
if not os.path.exists('data'):
    os.makedirs('data')

# File paths for our JSON storage
GUIDES_FILE = 'data/guides.json'
TOURISTS_FILE = 'data/tourists.json'
REVIEWS_FILE = 'data/reviews.json'

# Password hashing function
def hash_password(password):
    return hashlib.sha256(password.encode()).hexdigest()

# Function to update guide's average rating
def update_guide_rating(guide_id):
    with open(REVIEWS_FILE, 'r') as f:
        reviews = json.load(f)
    
    guide_reviews = [review for review in reviews if review['guide_id'] == guide_id]
    if not guide_reviews:
        return 0
    
    total_rating = sum(review['rating'] for review in guide_reviews)
    average_rating = total_rating / len(guide_reviews)
    
    # Update guide's rating
    with open(GUIDES_FILE, 'r') as f:
        guides = json.load(f)
    
    for guide in guides:
        if guide['id'] == guide_id:
            guide['rating'] = round(average_rating, 1)
            break
    
    with open(GUIDES_FILE, 'w') as f:
        json.dump(guides, f, indent=4)
    
    return average_rating

# Initialize JSON files if they don't exist
def init_json_files():
    if not os.path.exists(GUIDES_FILE):
        with open(GUIDES_FILE, 'w') as f:
            json.dump([], f)
    if not os.path.exists(TOURISTS_FILE):
        with open(TOURISTS_FILE, 'w') as f:
            json.dump([], f)
    if not os.path.exists(REVIEWS_FILE):
        with open(REVIEWS_FILE, 'w') as f:
            json.dump([], f)

# Initialize files
init_json_files()

@app.route('/')
def home():
    return jsonify({
        "message": "LocalEye Backend API",
        "status": "running",
        "version": "1.0.0"
    })

# Guide registration endpoint
@app.route('/api/guides/register', methods=['POST'])
def register_guide():
    try:
        data = request.json
        required_fields = ['name', 'email', 'password']
        
        # Check if all required fields are present
        if not all(field in data for field in required_fields):
            return jsonify({
                'error': 'Missing required fields',
                'required_fields': required_fields
            }), 400
        
        # Read existing guides
        with open(GUIDES_FILE, 'r') as f:
            guides = json.load(f)
        
        # Check if email already exists
        if any(guide['email'] == data['email'] for guide in guides):
            return jsonify({
                'error': 'Email already registered',
                'status': 'error'
            }), 400
        
        # Add new guide
        new_guide = {
            'id': len(guides) + 1,
            'name': data['name'],
            'email': data['email'],
            'password': hash_password(data['password']),
            'location': '',  # Empty by default
            'expertise': '',  # Empty by default
            'rating': 0,
            'reviews': [],
            'is_verified': False,
            'created_at': datetime.now().isoformat()
        }
        
        guides.append(new_guide)
        
        # Save updated guides
        with open(GUIDES_FILE, 'w') as f:
            json.dump(guides, f, indent=4)
        
        # Remove password from response
        response_guide = {k: v for k, v in new_guide.items() if k != 'password'}
        
        return jsonify({
            'message': 'Guide registered successfully',
            'guide': response_guide,
            'status': 'success'
        }), 201
    except Exception as e:
        return jsonify({
            'error': str(e),
            'status': 'error'
        }), 500

# Tourist registration endpoint
@app.route('/api/tourists/register', methods=['POST'])
def register_tourist():
    try:
        data = request.json
        required_fields = ['name', 'email', 'password']
        
        # Check if all required fields are present
        if not all(field in data for field in required_fields):
            return jsonify({
                'error': 'Missing required fields',
                'required_fields': required_fields
            }), 400
        
        # Read existing tourists
        with open(TOURISTS_FILE, 'r') as f:
            tourists = json.load(f)
        
        # Check if email already exists
        if any(tourist['email'] == data['email'] for tourist in tourists):
            return jsonify({
                'error': 'Email already registered',
                'status': 'error'
            }), 400
        
        # Add new tourist
        new_tourist = {
            'id': len(tourists) + 1,
            'name': data['name'],
            'email': data['email'],
            'password': hash_password(data['password']),
            'bookings': [],
            'reviews': [],
            'created_at': datetime.now().isoformat()
        }
        
        tourists.append(new_tourist)
        
        # Save updated tourists
        with open(TOURISTS_FILE, 'w') as f:
            json.dump(tourists, f, indent=4)
        
        # Remove password from response
        response_tourist = {k: v for k, v in new_tourist.items() if k != 'password'}
        
        return jsonify({
            'message': 'Tourist registered successfully',
            'tourist': response_tourist,
            'status': 'success'
        }), 201
    except Exception as e:
        return jsonify({
            'error': str(e),
            'status': 'error'
        }), 500

# Login endpoint for both guides and tourists
@app.route('/api/login', methods=['POST'])
def login():
    try:
        data = request.json
        required_fields = ['email', 'password', 'user_type']
        
        # Check if all required fields are present
        if not all(field in data for field in required_fields):
            return jsonify({
                'error': 'Missing required fields',
                'required_fields': required_fields
            }), 400
        
        email = data['email']
        password = hash_password(data['password'])
        user_type = data['user_type']
        
        if user_type == 'guide':
            with open(GUIDES_FILE, 'r') as f:
                users = json.load(f)
        elif user_type == 'tourist':
            with open(TOURISTS_FILE, 'r') as f:
                users = json.load(f)
        else:
            return jsonify({
                'error': 'Invalid user type',
                'status': 'error'
            }), 400
        
        # Find user with matching email and password
        user = next((user for user in users if user['email'] == email and user['password'] == password), None)
        
        if user:
            # Remove password from response
            user_data = {k: v for k, v in user.items() if k != 'password'}
            return jsonify({
                'message': 'Login successful',
                'user': user_data,
                'status': 'success'
            })
        else:
            return jsonify({
                'error': 'Invalid email or password',
                'status': 'error'
            }), 401
    except Exception as e:
        return jsonify({
            'error': str(e),
            'status': 'error'
        }), 500

# Submit a review
@app.route('/api/reviews', methods=['POST'])
def submit_review():
    try:
        data = request.json
        required_fields = ['tourist_id', 'guide_id', 'rating', 'comment']
        
        # Check if all required fields are present
        if not all(field in data for field in required_fields):
            return jsonify({
                'error': 'Missing required fields',
                'required_fields': required_fields
            }), 400
        
        # Validate rating (should be between 1 and 5)
        if not 1 <= data['rating'] <= 5:
            return jsonify({
                'error': 'Rating must be between 1 and 5',
                'status': 'error'
            }), 400
        
        # Check if tourist exists
        with open(TOURISTS_FILE, 'r') as f:
            tourists = json.load(f)
        tourist = next((t for t in tourists if t['id'] == data['tourist_id']), None)
        if not tourist:
            return jsonify({
                'error': 'Tourist not found',
                'status': 'error'
            }), 404
        
        # Check if guide exists
        with open(GUIDES_FILE, 'r') as f:
            guides = json.load(f)
        guide = next((g for g in guides if g['id'] == data['guide_id']), None)
        if not guide:
            return jsonify({
                'error': 'Guide not found',
                'status': 'error'
            }), 404
        
        # Create new review
        with open(REVIEWS_FILE, 'r') as f:
            reviews = json.load(f)
        
        new_review = {
            'id': len(reviews) + 1,
            'tourist_id': data['tourist_id'],
            'guide_id': data['guide_id'],
            'rating': data['rating'],
            'comment': data['comment'],
            'date': datetime.now().isoformat(),
            'tourist_name': tourist['name']
        }
        
        reviews.append(new_review)
        
        # Save review
        with open(REVIEWS_FILE, 'w') as f:
            json.dump(reviews, f, indent=4)
        
        # Update guide's rating
        update_guide_rating(data['guide_id'])
        
        return jsonify({
            'message': 'Review submitted successfully',
            'review': new_review,
            'status': 'success'
        }), 201
    except Exception as e:
        return jsonify({
            'error': str(e),
            'status': 'error'
        }), 500

# Get reviews for a specific guide
@app.route('/api/guides/<int:guide_id>/reviews', methods=['GET'])
def get_guide_reviews(guide_id):
    try:
        # Check if guide exists
        with open(GUIDES_FILE, 'r') as f:
            guides = json.load(f)
        guide = next((g for g in guides if g['id'] == guide_id), None)
        if not guide:
            return jsonify({
                'error': 'Guide not found',
                'status': 'error'
            }), 404
        
        # Get reviews for the guide
        with open(REVIEWS_FILE, 'r') as f:
            reviews = json.load(f)
        
        guide_reviews = [review for review in reviews if review['guide_id'] == guide_id]
        
        return jsonify({
            'guide_id': guide_id,
            'total_reviews': len(guide_reviews),
            'average_rating': guide['rating'],
            'reviews': guide_reviews,
            'status': 'success'
        })
    except Exception as e:
        return jsonify({
            'error': str(e),
            'status': 'error'
        }), 500

# Get all guides endpoint
@app.route('/api/guides', methods=['GET'])
def get_guides():
    try:
        with open(GUIDES_FILE, 'r') as f:
            guides = json.load(f)
        
        # Remove passwords from response
        guides_without_passwords = [{k: v for k, v in guide.items() if k != 'password'} for guide in guides]
        
        return jsonify({
            'guides': guides_without_passwords,
            'total': len(guides),
            'status': 'success'
        })
    except Exception as e:
        return jsonify({
            'error': str(e),
            'status': 'error'
        }), 500

if __name__ == '__main__':
    app.run(debug=True) 