import {
  Box,
  Image,
  Heading,
  Text,
  Badge,
  VStack,
  HStack,
  IconButton,
  useColorModeValue,
  Tooltip,
  useToast,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { FaHeart, FaRegHeart, FaComment } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import { useState } from 'react';

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

interface RecipeCardProps {
  recipe: Recipe;
  onLike?: (recipeId: string) => Promise<void>;
}

const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, onLike }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();
  const [isLiking, setIsLiking] = useState(false);
  
  const bgColor = useColorModeValue('white', 'gray.700');
  const textColor = useColorModeValue('gray.600', 'gray.200');
  const isLiked = user ? (recipe.likes ?? []).includes(user._id) : false;
  const likeCount = (recipe.likes ?? []).length;
  const commentCount = (recipe.comments ?? []).length;

  const handleLikeClick = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent navigation
    
    if (!user) {
      toast({
        title: 'Please login',
        description: 'You need to be logged in to like recipes',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (isLiking) return;

    if (!onLike) {
      toast({
        title: 'Error',
        description: 'Like functionality is not available',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsLiking(true);
    try {
      await onLike(recipe._id);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update like',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLiking(false);
    }
  };

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
      height="100%"
      display="flex"
      flexDirection="column"
      position="relative"
    >
      <Box onClick={() => navigate(`/recipe/${recipe._id}`)} cursor="pointer">
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
          <Text fontSize="sm" color={textColor}>
            By {recipe.user_name}
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
      <HStack 
        position="absolute" 
        bottom={2} 
        right={2} 
        spacing={2}
        onClick={(e) => e.stopPropagation()}
      >
        <Tooltip label={isLiked ? 'Unlike' : 'Like'} placement="top">
          <IconButton
            aria-label="Like recipe"
            icon={isLiked ? <FaHeart /> : <FaRegHeart />}
            colorScheme={isLiked ? 'red' : 'gray'}
            variant="ghost"
            size="sm"
            isLoading={isLiking}
            onClick={handleLikeClick}
          />
        </Tooltip>
        <Text fontSize="sm" color={textColor}>{likeCount}</Text>
        <Tooltip label="Comments" placement="top">
          <IconButton
            aria-label="View comments"
            icon={<FaComment />}
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/recipe/${recipe._id}#comments`);
            }}
          />
        </Tooltip>
        <Text fontSize="sm" color={textColor}>{commentCount}</Text>
      </HStack>
    </Box>
  );
};

export default RecipeCard;
