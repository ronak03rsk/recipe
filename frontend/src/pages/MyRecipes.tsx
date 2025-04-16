import { Box, Heading, SimpleGrid, Text, HStack, IconButton, useToast } from '@chakra-ui/react';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import RecipeCard from '../components/RecipeCard';
import { API_BASE_URL } from '../config';

const MyRecipes = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [isDeleting, setIsDeleting] = useState(false);
  const toast = useToast();
  const queryClient = useQueryClient();

  const { data: recipes = [], isLoading } = useQuery({
    queryKey: ['my-recipes'],
    queryFn: async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/recipes/user/${user?._id}`, {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true
        });
        return response.data;
      } catch (err) {
        console.error('Error fetching my recipes:', err);
        toast({
          title: 'Error',
          description: 'Failed to fetch your recipes. Please make sure you are logged in.',
          status: 'error',
          duration: 3000,
        });
        return [];
      }
    },
    enabled: !!user && !!token,
  });

  if (!user) {
    return (
      <Box textAlign="center" py={10}>
        <Heading size="lg">Please login to view your recipes</Heading>
      </Box>
    );
  }

  if (isLoading) {
    return (
      <Box textAlign="center" py={20}>
        <Text color="teal.400" fontSize="xl">Loading your recipes...</Text>
      </Box>
    );
  }

  if (recipes.length === 0) {
    return (
      <Box textAlign="center" py={20}>
        <Heading size="lg" color="teal.500" mb={2}>You haven't created any recipes yet</Heading>
        <Text color="gray.500">Share your first recipe with the community!</Text>
      </Box>
    );
  }

  const handleDelete = async (recipeId: string) => {
    if (!window.confirm('Are you sure you want to delete this recipe?')) return;
    
    setIsDeleting(true);
    try {
      await axios.delete(`${API_BASE_URL}/recipes/${recipeId}`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      });
      
      queryClient.invalidateQueries({ queryKey: ['my-recipes'] });
      toast({
        title: 'Recipe deleted',
        status: 'success',
        duration: 3000,
      });
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
    <Box minH="100vh" bgGradient="linear(to-br, orange.50, teal.50, white)" px={{ base: 2, md: 8 }} py={8}>
      <Heading mb={8} textAlign="center" color="teal.600" fontWeight="extrabold" letterSpacing="tight" fontSize={{ base: '2xl', md: '3xl' }}>
        My Recipes
      </Heading>
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={8}>
        {recipes.map((recipe: any) => (
          <Box key={recipe._id} position="relative">
            <RecipeCard recipe={recipe} />
            <HStack position="absolute" top={3} right={3} spacing={2}>
              <IconButton
                aria-label="Edit recipe"
                icon={<FaEdit />}
                colorScheme="orange"
                variant="outline"
                size="sm"
                onClick={() => navigate(`/edit-recipe/${recipe._id}`)}
                _hover={{ bg: 'orange.50', color: 'orange.500' }}
              />
              <IconButton
                aria-label="Delete recipe"
                icon={<FaTrash />}
                colorScheme="red"
                variant="outline"
                size="sm"
                isLoading={isDeleting}
                onClick={() => handleDelete(recipe._id)}
                _hover={{ bg: 'red.50', color: 'red.400' }}
              />
            </HStack>
          </Box>
        ))}
      </SimpleGrid>
    </Box>
  );
};

export default MyRecipes;
