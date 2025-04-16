from datetime import datetime
from bson import ObjectId

class User:
    def __init__(self, name, email, password):
        self.name = name
        self.email = email
        self.password = password
        self.created_at = datetime.utcnow()

    def to_dict(self):
        return {
            'name': self.name,
            'email': self.email,
            'password': self.password,
            'created_at': self.created_at
        }

class Comment:
    def __init__(self, content, user_id, user_name, created_at=None):
        self.content = content
        self.user_id = ObjectId(user_id)
        self.user_name = user_name
        self.created_at = created_at or datetime.utcnow()

    def to_dict(self):
        return {
            'content': self.content,
            'user_id': str(self.user_id),
            'user_name': self.user_name,
            'created_at': self.created_at
        }

    @staticmethod
    def from_dict(data):
        return Comment(
            content=data['content'],
            user_id=data['user_id'],
            user_name=data['user_name'],
            created_at=data.get('created_at')
        )

class Recipe:
    def __init__(self, title, description, ingredients, instructions, image_url, cuisine_type, cooking_time, difficulty, user_id, user_name, likes=None, comments=None, created_at=None):
        self.title = title
        self.description = description
        self.ingredients = ingredients
        self.instructions = instructions
        self.image_url = image_url
        self.cuisine_type = cuisine_type
        self.cooking_time = cooking_time
        self.difficulty = difficulty
        self.user_id = ObjectId(user_id)
        self.user_name = user_name
        self.likes = likes or []
        self.comments = comments or []
        self.created_at = created_at or datetime.utcnow()

    def to_dict(self):
        return {
            'title': self.title,
            'description': self.description,
            'ingredients': self.ingredients,
            'instructions': self.instructions,
            'image_url': self.image_url,
            'cuisine_type': self.cuisine_type,
            'cooking_time': self.cooking_time,
            'difficulty': self.difficulty,
            'user_id': str(self.user_id),
            'user_name': self.user_name,
            'likes': [str(like) for like in self.likes],
            'comments': [comment.to_dict() for comment in self.comments],
            'created_at': self.created_at
        }

    @staticmethod
    def from_dict(data):
        comments = [Comment.from_dict(comment) for comment in data.get('comments', [])]
        return Recipe(
            title=data.get('title'),
            description=data.get('description'),
            ingredients=data.get('ingredients', []),
            instructions=data.get('instructions', []),
            image_url=data.get('image_url'),
            cuisine_type=data.get('cuisine_type'),
            cooking_time=data.get('cooking_time'),
            difficulty=data.get('difficulty'),
            user_id=data.get('user_id'),
            user_name=data.get('user_name'),
            created_at=data.get('created_at'),
            likes=[ObjectId(like) for like in data.get('likes', [])],
            comments=comments
        )
