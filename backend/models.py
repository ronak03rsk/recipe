from datetime import datetime
from bson import ObjectId

class User:
    def __init__(self, email, password, name):
        self.email = email
        self.password = password
        self.name = name
        self.created_at = datetime.utcnow()

    def to_dict(self):
        return {
            "email": self.email,
            "password": self.password,
            "name": self.name,
            "created_at": self.created_at
        }

class Recipe:
    def __init__(self, title, description, ingredients, instructions, image_url, 
                 cuisine_type, cooking_time, difficulty, user_id):
        self.title = title
        self.description = description
        self.ingredients = ingredients
        self.instructions = instructions
        self.image_url = image_url
        self.cuisine_type = cuisine_type
        self.cooking_time = cooking_time
        self.difficulty = difficulty
        self.user_id = ObjectId(user_id)
        self.created_at = datetime.utcnow()

    def to_dict(self):
        return {
            "title": self.title,
            "description": self.description,
            "ingredients": self.ingredients,
            "instructions": self.instructions,
            "image_url": self.image_url,
            "cuisine_type": self.cuisine_type,
            "cooking_time": self.cooking_time,
            "difficulty": self.difficulty,
            "user_id": self.user_id,
            "created_at": self.created_at
        }

    @staticmethod
    def from_dict(data):
        return Recipe(
            title=data.get('title'),
            description=data.get('description'),
            ingredients=data.get('ingredients'),
            instructions=data.get('instructions'),
            image_url=data.get('image_url'),
            cuisine_type=data.get('cuisine_type'),
            cooking_time=data.get('cooking_time'),
            difficulty=data.get('difficulty'),
            user_id=data.get('user_id')
        )
