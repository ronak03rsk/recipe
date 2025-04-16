import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Input,
  InputGroup,
  InputAddon,
  Select,
  SimpleGrid,
  Text,
  VStack,
  Heading,
  useToast,
  Spinner,
  Center,
} from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import RecipeCard from '../components/RecipeCard';
import { debounce } from 'lodash';
import { API_BASE_URL } from '../config';
import { useAuth } from '../contexts/AuthContext';

interface Recipe {
  _id: string;
  title: string;
  description: string;
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

const cuisineOptions = [
  { value: '', label: 'All Cuisines' },
  { value: 'Italian', label: 'Italian' },
  { value: 'Indian', label: 'Indian' },
  { value: 'Chinese', label: 'Chinese' },
  { value: 'Mexican', label: 'Mexican' },
  { value: 'Japanese', label: 'Japanese' },
];

const Home = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [cuisineType, setCuisineType] = useState('');
  const toast = useToast();
  const auth = useAuth();
  const queryClient = useQueryClient();

  // Debounce search query
  useEffect(() => {
    const handler = debounce(() => {
      setDebouncedQuery(searchQuery);
    }, 300);

    handler();
    return () => {
      handler.cancel();
    };
  }, [searchQuery]);

  const { data: recipes = [], isLoading, isError } = useQuery<Recipe[], Error>({
    queryKey: ['recipes', debouncedQuery, cuisineType],
    queryFn: async () => {
      try {
        const params = new URLSearchParams();
        if (debouncedQuery) params.append('q', debouncedQuery);
        if (cuisineType) params.append('cuisine', cuisineType);
        
        const response = await axios.get<Recipe[]>(`${API_BASE_URL}/recipes/search?${params}`, {
          withCredentials: true
        });
        return response.data;
      } catch (err: any) {
        toast({
          title: 'Error',
          description: 'Failed to fetch recipes. Please make sure the backend server is running.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        return [];
      }
    },
    staleTime: 1000 * 60, // Cache for 1 minute
  });

  return (
    <Box width="100vw" minH="100vh" bgGradient="linear(to-br, teal.50, teal.100, white)" overflowX="hidden" pb={8}>
      <Container maxW="8xl" py={8} px={{ base: 4, md: 8 }}>
        <VStack spacing={8} align="stretch" width="100%">
            <Grid templateColumns={{ base: '1fr', md: '2fr 1fr' }} gap={4} alignItems="center">
              <InputGroup>
                <InputAddon>
                  <SearchIcon color="teal.400" />
                </InputAddon>
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for recipes, ingredients, or cuisine..."
                  bg="transparent"
                  borderRadius="full"
                  border="none"
                  _focus={{ bg: 'teal.50', borderColor: 'teal.300' }}
                />
              </InputGroup>
              <Select
                value={cuisineType}
                onChange={(e) => setCuisineType(e.target.value)}
                size="lg"
                bg="white"
                borderRadius="full"
                shadow="sm"
                maxW={{ base: '100%', md: '250px' }}
                _focus={{ bg: 'teal.50', borderColor: 'teal.300' }}
              >
                {cuisineOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </Grid>

          {isLoading ? (
            <Center py={20}>
              <Spinner size="xl" color="teal.400" thickness="5px" speed="0.6s" />
            </Center>
          ) : isError ? (
            <Center py={20}>
              <Text color="red.500" fontSize="lg" fontWeight="semibold">
                Failed to load recipes. Please check your connection or try again later.
              </Text>
            </Center>
          ) : recipes.length === 0 ? (
            <Center py={20}>
              <Text color="gray.500" fontSize="xl" fontWeight="semibold">
                No recipes found. Try a different search or add your own!
              </Text>
            </Center>
          ) : (
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={8}>
              {recipes.map((recipe) => (
                <RecipeCard 
                  key={recipe._id} 
                  recipe={recipe}
                  onLike={async (recipeId) => {
                    try {
                      await axios.post(
                        `${API_BASE_URL}/recipes/${recipeId}/like`,
                        {},
                        {
                          headers: {
                            Authorization: `Bearer ${auth.token}`,
                          },
                        }
                      );
                      // Invalidate and refetch recipes
                      queryClient.invalidateQueries({ queryKey: ['recipes'] });
                    } catch (err: any) {
                      throw err;
                    }
                  }}
                />
              ))}
            </SimpleGrid>
          )}
        </VStack>
      </Container>
    </Box>
  );
};

export default Home;
