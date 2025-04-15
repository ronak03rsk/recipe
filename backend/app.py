from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime, timedelta
import jwt
import bcrypt
from config import db, JWT_SECRET, PORT
from models import User, Recipe
from bson import ObjectId

app = Flask(__name__)
CORS(app)

# Helper functions
def generate_token(user_id):
    payload = {
        'user_id': str(user_id),
        'exp': datetime.utcnow() + timedelta(days=1)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm='HS256')

def verify_token(token):
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=['HS256'])
        return payload['user_id']
    except:
        return None

def auth_required(f):
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'error': 'No token provided'}), 401
        
        user_id = verify_token(token.split(' ')[1])
        if not user_id:
            return jsonify({'error': 'Invalid token'}), 401
        
        return f(user_id, *args, **kwargs)
    decorated.__name__ = f.__name__
    return decorated

def jwt_required(f):
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'error': 'No token provided'}), 401
        
        user_id = verify_token(token.split(' ')[1])
        if not user_id:
            return jsonify({'error': 'Invalid token'}), 401
        
        return f(*args, **kwargs)
    decorated.__name__ = f.__name__
    return decorated

def get_current_user_id():
    token = request.headers.get('Authorization')
    user_id = verify_token(token.split(' ')[1])
    return user_id

# Auth routes
@app.route('/api/auth/register', methods=['POST'])
def register():
    data = request.json
    if db.users.find_one({'email': data['email']}):
        return jsonify({'error': 'Email already exists'}), 400
    
    hashed_password = bcrypt.hashpw(data['password'].encode('utf-8'), bcrypt.gensalt())
    user = User(
        email=data['email'],
        password=hashed_password,
        name=data['name']
    )
    
    result = db.users.insert_one(user.to_dict())
    token = generate_token(result.inserted_id)
    
    return jsonify({
        'token': token,
        'user': {
            'id': str(result.inserted_id),
            'email': user.email,
            'name': user.name
        }
    })

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.json
    user_data = db.users.find_one({'email': data['email']})
    
    if not user_data or not bcrypt.checkpw(data['password'].encode('utf-8'), user_data['password']):
        return jsonify({'error': 'Invalid credentials'}), 401
    
    token = generate_token(user_data['_id'])
    
    return jsonify({
        'token': token,
        'user': {
            'id': str(user_data['_id']),
            'email': user_data['email'],
            'name': user_data['name']
        }
    })

# Recipe routes
@app.route('/api/recipes', methods=['GET'])
def get_recipes():
    recipes = list(db.recipes.find())
    for recipe in recipes:
        recipe['_id'] = str(recipe['_id'])
        recipe['user_id'] = str(recipe['user_id'])
    return jsonify(recipes)

@app.route('/api/recipes', methods=['POST'])
@jwt_required
def create_recipe():
    try:
        data = request.json
        user_id = get_current_user_id()
        
        required_fields = ['title', 'description', 'ingredients', 'instructions', 'cuisine_type', 'cooking_time', 'difficulty']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400

        recipe = {
            'title': data['title'],
            'description': data['description'],
            'ingredients': data['ingredients'],
            'instructions': data['instructions'],
            'cuisine_type': data['cuisine_type'],
            'cooking_time': data['cooking_time'],
            'difficulty': data['difficulty'],
            'image_url': data.get('image_url', ''),
            'user_id': user_id,
            'created_at': datetime.utcnow()
        }
        
        result = db.recipes.insert_one(recipe)
        recipe['_id'] = str(result.inserted_id)
        return jsonify(recipe), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/recipes/<recipe_id>', methods=['GET'])
def get_recipe(recipe_id):
    recipe = db.recipes.find_one({'_id': ObjectId(recipe_id)})
    if not recipe:
        return jsonify({'error': 'Recipe not found'}), 404
    
    recipe['_id'] = str(recipe['_id'])
    recipe['user_id'] = str(recipe['user_id'])
    return jsonify(recipe)

@app.route('/api/recipes/search', methods=['GET'])
def search_recipes():
    query = request.args.get('q', '')
    cuisine = request.args.get('cuisine', '')
    
    search_query = {}
    if query:
        search_query['$or'] = [
            {'title': {'$regex': query, '$options': 'i'}},
            {'description': {'$regex': query, '$options': 'i'}},
            {'ingredients': {'$regex': query, '$options': 'i'}}
        ]
    if cuisine:
        search_query['cuisine_type'] = cuisine

    try:
        # Sort by creation date in descending order (newest first)
        recipes = list(db.recipes.find(search_query).sort('created_at', -1))
        
        # Filter out empty or invalid recipes
        valid_recipes = []
        for recipe in recipes:
            if recipe.get('title') and recipe.get('description'):  # Only include recipes with at least title and description
                recipe['_id'] = str(recipe['_id'])
                if 'user_id' in recipe:
                    recipe['user_id'] = str(recipe['user_id'])
                valid_recipes.append(recipe)
        
        return jsonify(valid_recipes)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=PORT)
