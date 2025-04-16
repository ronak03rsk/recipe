from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime, timedelta
import jwt
import bcrypt
from config import db, JWT_SECRET, PORT
from bson import ObjectId
import json
from models import User, Recipe, Comment

def serialize_object(obj):
    if isinstance(obj, ObjectId):
        return str(obj)
    if isinstance(obj, datetime):
        return obj.isoformat()
    raise TypeError(f'Type {type(obj)} not serializable')

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*", "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"], "allow_headers": ["Content-Type", "Authorization"], "supports_credentials": True}})



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
@app.route('/api/recipes/favorites', methods=['GET'])
@jwt_required
def get_favorite_recipes():
    user_id = get_current_user_id()
    recipes = list(db.recipes.find({'likes': ObjectId(user_id)}))
    result = []
    for recipe in recipes:
        recipe['_id'] = str(recipe['_id'])
        recipe['user_id'] = str(recipe['user_id'])
        recipe['likes'] = [str(like) for like in recipe.get('likes', [])]
        recipe['comments'] = recipe.get('comments', [])
        result.append(recipe)
    return jsonify(result), 200

@app.route('/api/recipes/user/<user_id>', methods=['GET'])
@jwt_required
def get_user_recipes(user_id):
    try:
        recipes = list(db.recipes.find({'user_id': ObjectId(user_id)}).sort('created_at', -1))
        result = []
        for recipe in recipes:
            recipe['_id'] = str(recipe['_id'])
            recipe['user_id'] = str(recipe['user_id'])
            recipe['likes'] = [str(like) for like in recipe.get('likes', [])]
            recipe['comments'] = recipe.get('comments', [])
            result.append(recipe)
        return jsonify(result), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

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
            if recipe.get('title') and recipe.get('description'):
                recipe['_id'] = str(recipe['_id'])
                if 'user_id' in recipe:
                    recipe['user_id'] = str(recipe['user_id'])
                recipe['likes'] = [str(like) for like in recipe.get('likes', [])]
                valid_recipes.append(recipe)
        
        return jsonify(valid_recipes)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/recipes/<recipe_id>/like', methods=['POST'])
@jwt_required
def like_recipe(recipe_id):
    user_id = get_current_user_id()
    try:
        recipe = db.recipes.find_one({'_id': ObjectId(recipe_id)})
        if not recipe:
            return jsonify({'error': 'Recipe not found'}), 404
        likes = recipe.get('likes', [])
        user_id_obj = ObjectId(user_id)
        liked = False
        if str(user_id_obj) in [str(like) for like in likes]:
            db.recipes.update_one({'_id': ObjectId(recipe_id)}, {'$pull': {'likes': user_id_obj}})
            liked = False
        else:
            db.recipes.update_one({'_id': ObjectId(recipe_id)}, {'$addToSet': {'likes': user_id_obj}})
            liked = True
        updated = db.recipes.find_one({'_id': ObjectId(recipe_id)})
        return jsonify({'liked': liked, 'likeCount': len(updated.get('likes', []))}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/recipes/<recipe_id>/comments', methods=['POST'])
@jwt_required
def add_comment(recipe_id):
    data = request.json
    user_id = get_current_user_id()
    user = db.users.find_one({'_id': ObjectId(user_id)})
    if not data.get('content'):
        return jsonify({'error': 'Comment content is required'}), 400
    try:
        comment = Comment(
            content=data['content'],
            user_id=ObjectId(user_id),
            user_name=user['name']
        )
        db.recipes.update_one({'_id': ObjectId(recipe_id)}, {'$push': {'comments': comment.to_dict()}})
        updated = db.recipes.find_one({'_id': ObjectId(recipe_id)})
        return jsonify({'message': 'Comment added successfully', 'commentsCount': len(updated.get('comments', [])), 'comments': updated.get('comments', [])}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/recipes/<recipe_id>/comments', methods=['GET'])
def get_comments(recipe_id):
    try:
        recipe = db.recipes.find_one({'_id': ObjectId(recipe_id)})
        if not recipe:
            return jsonify({'error': 'Recipe not found'}), 404

        comments = recipe.get('comments', [])
        return jsonify(comments), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/recipes/<recipe_id>', methods=['PUT', 'DELETE'])
@jwt_required
def manage_recipe(recipe_id):
    user_id = get_current_user_id()
    recipe = db.recipes.find_one({'_id': ObjectId(recipe_id)})
    
    if not recipe:
        return jsonify({'error': 'Recipe not found'}), 404
        
    if str(recipe['user_id']) != user_id:
        return jsonify({'error': 'Unauthorized'}), 403

    if request.method == 'DELETE':
        try:
            db.recipes.delete_one({'_id': ObjectId(recipe_id)})
            return jsonify({'message': 'Recipe deleted successfully'}), 200
        except Exception as e:
            return jsonify({'error': str(e)}), 500

    if request.method == 'PUT':
        data = request.json
        
        if not all(key in data for key in ['title', 'description', 'ingredients', 'instructions']):
            return jsonify({'error': 'Missing required fields'}), 400

        try:
            update_data = {
                'title': data['title'],
                'description': data['description'],
                'ingredients': data['ingredients'],
                'instructions': data['instructions'],
                'image_url': data.get('image_url', recipe.get('image_url', ''))
            }
            
            db.recipes.update_one(
                {'_id': ObjectId(recipe_id)},
                {'$set': update_data}
            )
            return jsonify({'message': 'Recipe updated successfully'}), 200
        except Exception as e:
            return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=PORT)
