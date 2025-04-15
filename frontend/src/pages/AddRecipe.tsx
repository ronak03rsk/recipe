import { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  VStack,
  Heading,
  useToast,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const AddRecipe = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    ingredients: '',
    instructions: '',
    image_url: '',
    cuisine_type: '',
    cooking_time: '',
    difficulty: '',
  });

  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({
        title: 'Error',
        description: 'You must be logged in to add a recipe',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        'http://localhost:5000/api/recipes',
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast({
        title: 'Success',
        description: 'Recipe added successfully',
        status: 'success',
        duration: 3000,
      });
      navigate('/');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add recipe',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <Box maxW="2xl" mx="auto">
      <VStack spacing={8} align="stretch" bg="white" p={8} borderRadius="lg" boxShadow="lg">
        <Heading textAlign="center">Add New Recipe</Heading>
        <form onSubmit={handleSubmit}>
          <VStack spacing={4}>
            <FormControl isRequired>
              <FormLabel>Title</FormLabel>
              <Input
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Recipe title"
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Description</FormLabel>
              <Textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Brief description of your recipe"
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Ingredients</FormLabel>
              <Textarea
                name="ingredients"
                value={formData.ingredients}
                onChange={handleChange}
                placeholder="List your ingredients (one per line)"
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Instructions</FormLabel>
              <Textarea
                name="instructions"
                value={formData.instructions}
                onChange={handleChange}
                placeholder="Step by step instructions"
                minH="200px"
              />
            </FormControl>

            <FormControl>
              <FormLabel>Image URL</FormLabel>
              <Input
                name="image_url"
                value={formData.image_url}
                onChange={handleChange}
                placeholder="URL of the recipe image"
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Cuisine Type</FormLabel>
              <Select
                name="cuisine_type"
                value={formData.cuisine_type}
                onChange={handleChange}
                placeholder="Select cuisine type"
              >
                <option value="Italian">Italian</option>
                <option value="Indian">Indian</option>
                <option value="Chinese">Chinese</option>
                <option value="Mexican">Mexican</option>
                <option value="Japanese">Japanese</option>
              </Select>
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Cooking Time</FormLabel>
              <Select
                name="cooking_time"
                value={formData.cooking_time}
                onChange={handleChange}
                placeholder="Select cooking time"
              >
                <option value="15 mins">15 mins</option>
                <option value="30 mins">30 mins</option>
                <option value="45 mins">45 mins</option>
                <option value="1 hour">1 hour</option>
                <option value="1.5 hours">1.5 hours</option>
                <option value="2+ hours">2+ hours</option>
              </Select>
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Difficulty</FormLabel>
              <Select
                name="difficulty"
                value={formData.difficulty}
                onChange={handleChange}
                placeholder="Select difficulty level"
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </Select>
            </FormControl>

            <Button
              type="submit"
              colorScheme="teal"
              size="lg"
              width="full"
              isLoading={isLoading}
            >
              Add Recipe
            </Button>
          </VStack>
        </form>
      </VStack>
    </Box>
  );
};

export default AddRecipe;
