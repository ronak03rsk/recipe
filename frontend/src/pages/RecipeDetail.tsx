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
} from '@chakra-ui/react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { CheckCircleIcon } from '@chakra-ui/icons';

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
}

const RecipeDetail = () => {
  const { id } = useParams<{ id: string }>();

  const { data: recipe, isLoading } = useQuery<Recipe>(
    ['recipe', id],
    async () => {
      const response = await axios.get(`http://localhost:5000/api/recipes/${id}`);
      return response.data;
    }
  );

  if (isLoading) {
    return (
      <Container maxW="4xl" py={8}>
        <VStack spacing={6} align="stretch">
          <Skeleton height="300px" />
          <Skeleton height="40px" />
          <Skeleton height="20px" count={3} />
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

  return (
    <Container maxW="4xl" py={8}>
      <VStack spacing={6} align="stretch">
        <Image
          src={recipe.image_url || 'https://via.placeholder.com/800x400?text=No+Image'}
          alt={recipe.title}
          borderRadius="lg"
          objectFit="cover"
          maxH="400px"
          w="100%"
        />

        <Box>
          <Heading size="xl" mb={2}>
            {recipe.title}
          </Heading>
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
            {ingredients.map((ingredient, index) => (
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
            {instructions.map((instruction, index) => (
              <ListItem key={index} ml={4}>
                <Text>{instruction.trim()}</Text>
              </ListItem>
            ))}
          </OrderedList>
        </Box>
      </VStack>
    </Container>
  );
};

export default RecipeDetail;
