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
    <Box width="100vw" minH="100vh" bg="gray.50" overflowX="hidden">
      <Container maxW="8xl" py={8} px={{ base: 4, md: 8 }}>
        <VStack spacing={8} align="stretch" width="100%">
          <Box width="100%">
            <Heading mb={6} textAlign={{ base: "center", md: "left" }}>
              Discover Delicious Recipes
            </Heading>
            <Grid
              templateColumns={{ base: "1fr", md: "3fr 1fr" }}
              gap={6}
              width="100%"
            >
              <InputGroup size="lg">
                <InputAddon>
                  <Box p={2}>
                    <SearchIcon color="gray.500" />
                  </Box>
                </InputAddon>
                <Input
                  placeholder="Search recipes by name, ingredients, or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  bg="white"
                  size="lg"
                  _focus={{ boxShadow: "outline" }}
                />
              </InputGroup>
              <Select
                placeholder="All Cuisines"
                value={cuisineType}
                onChange={(e) => setCuisineType(e.target.value)}
                bg="white"
                size="lg"
                _focus={{ boxShadow: "outline" }}
              >
                {cuisineOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </Grid>
          </Box>

          {isLoading ? (
            <Center py={10}>
              <Spinner size="xl" color="teal.500" />
            </Center>
          ) : isError ? (
            <Text textAlign="center" fontSize="lg" color="red.500">
              Error loading recipes
            </Text>
          ) : recipes.length === 0 ? (
            <Text textAlign="center" fontSize="lg">
              No recipes found. Try a different search term or cuisine type.
            </Text>
          ) : (
            <SimpleGrid
              columns={{ base: 1, sm: 2, lg: 3, xl: 4 }}
              spacing={6}
              width="100%"
            >
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
