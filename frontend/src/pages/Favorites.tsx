import { Box, Heading, SimpleGrid, Text } from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import RecipeCard from '../components/RecipeCard';
import { API_BASE_URL } from '../config';

const Favorites = () => {
  const { user } = useAuth();

  const { data: recipes = [], isLoading } = useQuery({
    queryKey: ['favorites'],
    queryFn: async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/recipes/favorites`, {
          withCredentials: true
        });
        return response.data;
      } catch (err) {
        console.error('Error fetching favorites:', err);
        return [];
      }
    },
    enabled: !!user,
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
      <Box textAlign="center" py={10}>
        <Text>Loading your favorites...</Text>
      </Box>
    );
  }

  if (recipes.length === 0) {
    return (
      <Box textAlign="center" py={10}>
        <Heading size="lg">You haven't liked any recipes yet</Heading>
      </Box>
    );
  }

  return (
    <Box>
      <Heading mb={6}>My Favorites</Heading>
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
        {recipes.map((recipe: any) => (
          <RecipeCard key={recipe._id} recipe={recipe} />
        ))}
      </SimpleGrid>
    </Box>
  );
};

export default Favorites;
