import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  VStack,
  Select,
  useToast,
  Heading,
} from '@chakra-ui/react';
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { API_BASE_URL } from '../config';

const EditRecipe = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: recipe, isLoading } = useQuery({
    queryKey: ['recipe', id],
    queryFn: async () => {
      const response = await axios.get(`${API_BASE_URL}/recipes/${id}`, {
        withCredentials: true
      });
      return response.data;
    }
  });

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    ingredients: '',
    instructions: '',
    cuisine_type: '',
    cooking_time: '',
    difficulty: '',
    image_url: ''
  });

  // Update form data when recipe is loaded
  React.useEffect(() => {
    if (recipe) {
      setFormData({
        title: recipe.title,
        description: recipe.description,
        ingredients: recipe.ingredients,
        instructions: recipe.instructions,
        cuisine_type: recipe.cuisine_type,
        cooking_time: recipe.cooking_time,
        difficulty: recipe.difficulty,
        image_url: recipe.image_url
      });
    }
  }, [recipe]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await axios.put(`${API_BASE_URL}/recipes/${id}`, formData, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      });

      queryClient.invalidateQueries({ queryKey: ['recipe', id] });
      queryClient.invalidateQueries({ queryKey: ['my-recipes'] });

      toast({
        title: 'Recipe updated successfully',
        status: 'success',
        duration: 3000,
      });

      navigate(`/recipe/${id}`);
    } catch (error) {
      toast({
        title: 'Error updating recipe',
        description: 'Please try again',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (isLoading) {
    return <Box>Loading...</Box>;
  }

  return (
    <Box maxW="2xl" mx="auto" py={8}>
      <Heading mb={6}>Edit Recipe</Heading>
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
              placeholder="List of ingredients"
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Instructions</FormLabel>
            <Textarea
              name="instructions"
              value={formData.instructions}
              onChange={handleChange}
              placeholder="Step by step instructions"
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Cuisine Type</FormLabel>
            <Input
              name="cuisine_type"
              value={formData.cuisine_type}
              onChange={handleChange}
              placeholder="e.g., Italian, Indian, Mexican"
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Cooking Time</FormLabel>
            <Input
              name="cooking_time"
              value={formData.cooking_time}
              onChange={handleChange}
              placeholder="e.g., 30 minutes"
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Difficulty</FormLabel>
            <Select
              name="difficulty"
              value={formData.difficulty}
              onChange={handleChange}
            >
              <option value="">Select difficulty</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </Select>
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

          <Button
            type="submit"
            colorScheme="teal"
            size="lg"
            width="full"
            isLoading={isSubmitting}
          >
            Update Recipe
          </Button>
        </VStack>
      </form>
    </Box>
  );
};

export default EditRecipe;
