import { Box, Heading, Text, HStack, IconButton, VStack, Image, Avatar, Button, Container, Textarea, useToast } from '@chakra-ui/react';
import { FaEdit, FaTrash, FaHeart, FaRegHeart } from 'react-icons/fa';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Skeleton } from '@chakra-ui/react';
import { API_BASE_URL } from '../config';

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
          <Skeleton height="350px" borderRadius="2xl" />
          <Skeleton height="40px" borderRadius="lg" />
          <VStack spacing={2}>
            <Skeleton height="20px" borderRadius="md" />
            <Skeleton height="20px" borderRadius="md" />
            <Skeleton height="20px" borderRadius="md" />
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
      await axios.post(`${API_BASE_URL}/recipes/${recipe?._id}/comments`, 
        { content: comment }, 
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );
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
    <Box minH="100vh" bgGradient="linear(to-br, orange.50, teal.50, white)" py={8}>
      <Container maxW="4xl" py={4}>
        <VStack spacing={8} align="stretch">
          <Box>
            <Image
              src={recipe?.image_url || 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80'}
              alt={recipe?.title}
              borderRadius="2xl"
              w="full"
              maxH="350px"
              objectFit="cover"
              mb={4}
              fallbackSrc="https://via.placeholder.com/600x350?text=No+Image"
            />
            <Heading size="2xl" color="teal.700" fontWeight="extrabold" mb={2} letterSpacing="tight">
              {recipe?.title}
            </Heading>
            <HStack spacing={4} mb={4} color="gray.600">
              <Text fontWeight="bold">By {recipe?.user_name || ''}</Text>
              <Text>• {recipe?.cuisine_type || ''}</Text>
              <Text>• {recipe?.cooking_time || ''}</Text>
              <Text>• {recipe?.difficulty || ''}</Text>
            </HStack>
            <HStack mb={4} spacing={3}>
              <Button
                leftIcon={(recipe?.likes || []).includes(user?._id ?? '') ? <FaHeart /> : <FaRegHeart />}
                colorScheme={(recipe?.likes || []).includes(user?._id ?? '') ? 'orange' : 'gray'}
                variant={(recipe?.likes || []).includes(user?._id ?? '') ? 'solid' : 'outline'}
                size="md"
                fontWeight="bold"
                onClick={handleLike}
                isLoading={isLiking}
                borderRadius="full"
              >
                {(recipe?.likes || []).length || 0} Like{(recipe?.likes || []).length === 1 ? '' : 's'}
              </Button>
              {user && user._id === recipe?.user_id && (
                <HStack spacing={2}>
                  <IconButton
                    aria-label="Edit recipe"
                    icon={<FaEdit />}
                    colorScheme="orange"
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/edit-recipe/${recipe?._id}`)}
                    _hover={{ bg: 'orange.50', color: 'orange.500' }}
                  />
                  <IconButton
                    aria-label="Delete recipe"
                    icon={<FaTrash />}
                    colorScheme="red"
                    variant="outline"
                    size="sm"
                    isLoading={isDeleting}
                    onClick={handleDelete}
                    _hover={{ bg: 'red.50', color: 'red.400' }}
                  />
                </HStack>
              )}
            </HStack>
          </Box>
          <Box bg="orange.50" borderRadius="xl" p={6} shadow="sm" mb={4}>
            <Heading size="md" color="orange.600" mb={2} letterSpacing="tight">Ingredients</Heading>
            <Text whiteSpace="pre-line" color="gray.700">{recipe?.ingredients}</Text>
          </Box>
          <Box bg="teal.50" borderRadius="xl" p={6} shadow="sm" mb={4}>
            <Heading size="md" color="teal.600" mb={2} letterSpacing="tight">Instructions</Heading>
            <Text whiteSpace="pre-line" color="gray.700">{recipe?.instructions}</Text>
          </Box>
          <Box bg="whiteAlpha.900" borderRadius="xl" p={6} shadow="sm">
            <Heading size="md" color="teal.700" mb={4} letterSpacing="tight">Comments</Heading>
            {recipe?.comments?.length === 0 && (
              <Text color="gray.400" mb={4}>No comments yet. Be the first to comment!</Text>
            )}
            <VStack spacing={4} align="stretch">
              {(recipe?.comments || []).map((comment: { user_name: string; created_at: string; content: string }, idx: number) => (
                <Box key={idx} bg="gray.50" p={4} borderRadius="lg" shadow="xs">
                  <HStack>
                    <Avatar size="sm" name={comment.user_name} bg="teal.200" color="teal.700" />
                    <Text fontWeight="bold" color="teal.700">{comment.user_name}</Text>
                    <Text color="gray.400" fontSize="xs">{new Date(comment.created_at).toLocaleString()}</Text>
                  </HStack>
                  <Text mt={2} color="gray.700">{comment.content}</Text>
                </Box>
              ))}
            </VStack>
            {user && (
              <form onSubmit={(e) => { e.preventDefault(); handleComment(); }} style={{ marginTop: 24 }}>
                <VStack spacing={2} align="stretch">
                  <Textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Add a comment..."
                    bg="gray.50"
                    borderRadius="lg"
                    size="md"
                    minH="60px"
                  />
                  <Button
                    type="submit"
                    colorScheme="teal"
                    borderRadius="full"
                    fontWeight="bold"
                    isLoading={isSubmitting}
                    alignSelf="flex-end"
                    px={8}
                  >
                    Post
                  </Button>
                </VStack>
              </form>
            )}
          </Box>
        </VStack>
      </Container>
    </Box>
  );
};

export default RecipeDetail;
