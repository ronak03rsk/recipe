import { Box, Heading, SimpleGrid, Text, useToast } from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import RecipeCard from '../components/RecipeCard';
import { API_BASE_URL } from '../config';

const Favorites = () => {
  const { user, token } = useAuth();
  const toast = useToast();

  const { data: recipes = [], isLoading } = useQuery({
    queryKey: ['favorites'],
    queryFn: async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/recipes/favorites`, {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true
        });
        return response.data;
      } catch (err) {
        console.error('Error fetching favorites:', err);
        toast({
          title: 'Error',
          description: 'Failed to fetch your favorite recipes. Please make sure you are logged in.',
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
        <Heading size="lg">Please login to view your favorites</Heading>
      </Box>
    );
  }

  if (isLoading) {
    return (
      <Box textAlign="center" py={20}>
        <Text color="orange.400" fontSize="xl">Loading your favorites...</Text>
      </Box>
    );
  }

  if (recipes.length === 0) {
    return (
      <Box textAlign="center" py={20}>
        <Heading size="lg" color="orange.400" mb={2}>You haven't liked any recipes yet</Heading>
        <Text color="gray.500">Start exploring and like your favorite recipes!</Text>
      </Box>
    );
  }

  return (
    <Box minH="100vh" bgGradient="linear(to-br, orange.50, teal.50, white)" px={{ base: 2, md: 8 }} py={8}>
      <Heading mb={8} textAlign="center" color="orange.500" fontWeight="extrabold" letterSpacing="tight" fontSize={{ base: '2xl', md: '3xl' }}>
        My Favorite Recipes
      </Heading>
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={8}>
        {recipes.map((recipe: any) => (
          <RecipeCard key={recipe._id} recipe={recipe} />
        ))}
      </SimpleGrid>
    </Box>
  );
};

export default Favorites;
