import {
  Box,
  Container,
  Heading,
  Text,
  Image,
  VStack,
  HStack,
  Badge,
  List,
  ListItem,
  ListIcon,
  OrderedList,
  Divider,
  Skeleton,
  IconButton,
  Button,
  Textarea,
  Avatar,
  useToast,
  Tooltip,
} from '@chakra-ui/react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { CheckCircleIcon } from '@chakra-ui/icons';
import { API_BASE_URL } from '../config';
import { FaHeart, FaRegHeart, FaEdit, FaTrash } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import { useState } from 'react';

interface Recipe {
  _id: string;
  title: string;
  description: string;
  ingredients: string;
  instructions: string;
  image_url: string;
  cuisine_type: string;
  cooking_time: string;
  difficulty: string;
  user_id: string;
  user_name: string;
  likes: string[];
  comments: Array<{
    content: string;
    user_id: string;
    user_name: string;
    created_at: string;
  }>;
}

const RecipeDetail = () => {
  const { id } = useParams<{ id: string }>();
  const auth = useAuth();
  const user = auth.user;
  const token = auth.token;
  const navigate = useNavigate();
  const toast = useToast();
  const queryClient = useQueryClient();
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const { data: recipe, isLoading } = useQuery<Recipe, Error>({
    enabled: !!id,
    queryKey: ['recipe', id],
    queryFn: async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/recipes/${id}`, {
          withCredentials: true
        });
        return response.data;
      } catch (err) {
        toast({
          title: 'Error',
          description: 'Failed to fetch recipe. Please make sure the backend server is running.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        throw err;
      }
    }
  }
  );

  if (isLoading) {
    return (
      <Container maxW="4xl" py={8}>
        <VStack spacing={6} align="stretch">
          <Skeleton height="300px" />
          <Skeleton height="40px" />
          <VStack spacing={2}>
            <Skeleton height="20px" />
            <Skeleton height="20px" />
            <Skeleton height="20px" />
          </VStack>
        </VStack>
      </Container>
    );
  }

  if (!recipe) {
    return (
      <Container maxW="4xl" py={8}>
        <Text>Recipe not found</Text>
      </Container>
    );
  }

  const ingredients = recipe.ingredients.split('\n').filter(Boolean);
  const instructions = recipe.instructions.split('\n').filter(Boolean);

  const handleLike = async () => {
    if (!user) {
      toast({
        title: 'Please login',
        description: 'You need to be logged in to like recipes',
        status: 'warning',
        duration: 3000,
      });
      return;
    }

    if (isLiking) return;

    setIsLiking(true);
    try {
      await axios.post(
        `${API_BASE_URL}/recipes/${id}/like`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      queryClient.invalidateQueries({ queryKey: ['recipe', id] });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update like',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setIsLiking(false);
    }
  };

  const handleComment = async () => {
    if (!user) {
      toast({
        title: 'Please login',
        description: 'You need to be logged in to comment',
        status: 'warning',
        duration: 3000,
      });
      return;
    }

    if (!comment.trim()) {
      toast({
        title: 'Empty comment',
        description: 'Please write something before submitting',
        status: 'warning',
        duration: 3000,
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await axios.post(`${API_BASE_URL}/recipes/${recipe._id}/comments`, { content: comment }, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      setComment('');
      queryClient.invalidateQueries({ queryKey: ['recipe', id] });
      toast({
        title: 'Success',
        description: 'Comment added successfully',
        status: 'success',
        duration: 2000,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add comment',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (isDeleting) return;

    const confirmed = window.confirm('Are you sure you want to delete this recipe?');
    if (!confirmed) return;

    setIsDeleting(true);
    try {
      await axios.delete(`${API_BASE_URL}/recipes/${recipe._id}`, {
        withCredentials: true,
        headers: { Authorization: `Bearer ${token}` },
      });
      toast({
        title: 'Success',
        description: 'Recipe deleted successfully',
        status: 'success',
        duration: 2000,
      });
      navigate('/');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete recipe',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Container maxW="4xl" py={8}>
      <VStack spacing={6} align="stretch">
        <Box position="relative">
          <Image
            src={recipe.image_url || 'https://via.placeholder.com/800x400?text=No+Image'}
            alt={recipe.title}
            borderRadius="lg"
            objectFit="cover"
            maxH="400px"
            w="100%"
          />
          {user && user._id === recipe.user_id && (
            <HStack position="absolute" top={4} right={4} spacing={2}>
              <IconButton
                aria-label="Edit recipe"
                icon={<FaEdit />}
                colorScheme="blue"
                onClick={() => navigate(`/edit-recipe/${id}`)}
              />
              <IconButton
                aria-label="Delete recipe"
                icon={<FaTrash />}
                colorScheme="red"
                isLoading={isDeleting}
                onClick={handleDelete}
              />
            </HStack>
          )}
        </Box>

        <Box>
          <HStack justify="space-between" align="start" mb={2}>
            <Heading size="xl">{recipe.title}</Heading>
            <HStack spacing={2}>
              <Tooltip label={user ? (recipe.likes.includes(user._id) ? 'Unlike' : 'Like') : 'Login to like'}>
                <IconButton
                  aria-label="Like recipe"
                  icon={user && recipe.likes.includes(user._id) ? <FaHeart /> : <FaRegHeart />}
                  colorScheme={user && recipe.likes.includes(user._id) ? 'red' : 'gray'}
                  variant="ghost"
                  isLoading={isLiking}
                  onClick={handleLike}
                />
              </Tooltip>
              <Text>{recipe.likes.length}</Text>
            </HStack>
          </HStack>
          <Text fontSize="md" color="gray.600" mb={4}>
            By {recipe.user_name}
          </Text>
          <HStack spacing={2} mb={4}>
            <Badge colorScheme="teal">{recipe.cuisine_type}</Badge>
            <Badge colorScheme="purple">{recipe.cooking_time}</Badge>
            <Badge
              colorScheme={
                recipe.difficulty === 'Easy'
                  ? 'green'
                  : recipe.difficulty === 'Medium'
                  ? 'yellow'
                  : 'red'
              }
            >
              {recipe.difficulty}
            </Badge>
          </HStack>
          <Text fontSize="lg" color="gray.600">
            {recipe.description}
          </Text>
        </Box>

        <Divider />

        <Box>
          <Heading size="lg" mb={4}>
            Ingredients
          </Heading>
          <List spacing={2}>
            {ingredients.map((ingredient: string, index: number) => (
              <ListItem key={index} display="flex" alignItems="start">
                <ListIcon as={CheckCircleIcon} color="teal.500" mt={1} />
                <Text>{ingredient.trim()}</Text>
              </ListItem>
            ))}
          </List>
        </Box>

        <Divider />

        <Box>
          <Heading size="lg" mb={4}>
            Instructions
          </Heading>
          <OrderedList spacing={4}>
            {instructions.map((instruction: string, index: number) => (
              <ListItem key={index} ml={4}>
                <Text>{instruction.trim()}</Text>
              </ListItem>
            ))}
          </OrderedList>
        </Box>

        <Divider />

        <Box id="comments">
          <Heading size="lg" mb={4}>
            Comments ({recipe.comments.length})
          </Heading>
          
          {user && (
            <VStack spacing={4} mb={6} align="stretch">
              <Textarea
                placeholder="Write a comment..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                resize="vertical"
                minH="100px"
              />
              <Button
                colorScheme="teal"
                isLoading={isSubmitting}
                onClick={handleComment}
                alignSelf="flex-end"
              >
                Post Comment
              </Button>
            </VStack>
          )}

          <VStack spacing={4} align="stretch">
            {recipe.comments.map((comment: { content: string; user_name: string; created_at: string }, index: number) => (
              <Box
                key={index}
                p={4}
                bg="gray.50"
                borderRadius="md"
                borderWidth="1px"
                borderColor="gray.200"
              >
                <HStack spacing={3} mb={2}>
                  <Avatar size="sm" name={comment.user_name} />
                  <VStack spacing={0} align="start">
                    <Text fontWeight="bold">{comment.user_name}</Text>
                    <Text fontSize="sm" color="gray.500">
                      {new Date(comment.created_at).toLocaleDateString()}
                    </Text>
                  </VStack>
                </HStack>
                <Text>{comment.content}</Text>
              </Box>
            ))}
          </VStack>
        </Box>
      </VStack>
    </Container>
  );
};

export default RecipeDetail;
