import os
from dotenv import load_dotenv
from pymongo import MongoClient
from pymongo.server_api import ServerApi

# Load environment variables
load_dotenv()

# MongoDB Configuration
MONGODB_URI = os.getenv('MONGODB_URI')
JWT_SECRET = os.getenv('JWT_SECRET', 'your-super-secret-key-change-this-in-production')
PORT = int(os.getenv('PORT', 5000))

# Initialize MongoDB client with MongoDB Atlas configuration
client = MongoClient(
    MONGODB_URI,
    server_api=ServerApi('1'),
    serverSelectionTimeoutMS=5000
)

try:
    # Send a ping to confirm a successful connection
    client.admin.command('ping')
    print("Successfully connected to MongoDB Atlas!")
    db = client.recipe_db
except Exception as e:
    print(f"Error connecting to MongoDB Atlas: {e}")
    raise

# Collections
users = db.users
recipes = db.recipes

# Create indexes
users.create_index('email', unique=True)
recipes.create_index([('title', 'text'), ('ingredients', 'text'), ('description', 'text')])
