import {
  Box,
  Image,
  Heading,
  Text,
  Badge,
  VStack,
  HStack,
  useColorModeValue,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';

interface Recipe {
  _id: string;
  title: string;
  description: string;
  image_url: string;
  cuisine_type: string;
  cooking_time: string;
  difficulty: string;
}

interface RecipeCardProps {
  recipe: Recipe;
}

const RecipeCard: React.FC<RecipeCardProps> = ({ recipe }) => {
  const navigate = useNavigate();
  const bgColor = useColorModeValue('white', 'gray.700');
  const textColor = useColorModeValue('gray.600', 'gray.200');

  return (
    <Box
      borderRadius="xl"
      overflow="hidden"
      bg={bgColor}
      boxShadow="lg"
      transition="all 0.3s"
      _hover={{
        transform: 'translateY(-4px)',
        boxShadow: 'xl',
      }}
      onClick={() => navigate(`/recipe/${recipe._id}`)}
      cursor="pointer"
      height="100%"
      display="flex"
      flexDirection="column"
    >
      <Image
        src={recipe.image_url || 'https://via.placeholder.com/400x300?text=No+Image'}
        alt={recipe.title}
        objectFit="cover"
        height="200px"
        width="100%"
      />
      <VStack p={5} spacing={3} align="stretch" flex={1}>
        <Heading 
          size="md"
          isTruncated
          title={recipe.title}
        >
          {recipe.title}
        </Heading>
        <Text 
          color={textColor}
          noOfLines={2}
          flex={1}
        >
          {recipe.description}
        </Text>
        <HStack spacing={2} flexWrap="wrap">
          <Badge colorScheme="teal" fontSize="sm" px={2} py={1}>
            {recipe.cuisine_type}
          </Badge>
          <Badge colorScheme="purple" fontSize="sm" px={2} py={1}>
            {recipe.cooking_time}
          </Badge>
          <Badge
            colorScheme={
              recipe.difficulty === 'Easy'
                ? 'green'
                : recipe.difficulty === 'Medium'
                ? 'yellow'
                : 'red'
            }
            fontSize="sm"
            px={2}
            py={1}
          >
            {recipe.difficulty}
          </Badge>
        </HStack>
      </VStack>
    </Box>
  );
};

export default RecipeCard;
