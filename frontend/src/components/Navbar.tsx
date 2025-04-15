import { Box, Flex, Button, Link as ChakraLink, Text } from '@chakra-ui/react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Box bg="teal.500" px={4} position="sticky" top={0} zIndex={1}>
      <Flex h={16} alignItems="center" justifyContent="space-between" maxW="1200px" mx="auto">
        <Flex alignItems="center">
          <ChakraLink as={RouterLink} to="/">
            <Text fontSize="xl" fontWeight="bold" color="white">
              RecipeShare
            </Text>
          </ChakraLink>
        </Flex>

        <Flex alignItems="center" gap={4}>
          <ChakraLink as={RouterLink} to="/" color="white">
            Home
          </ChakraLink>
          
          {user ? (
            <>
              <ChakraLink as={RouterLink} to="/add-recipe" color="white">
                Add Recipe
              </ChakraLink>
              <Button
                onClick={handleLogout}
                colorScheme="teal"
                variant="outline"
                color="white"
                _hover={{ bg: 'teal.600' }}
              >
                Logout
              </Button>
              <Text color="white" fontWeight="medium">
                Hi, {user.name}
              </Text>
            </>
          ) : (
            <>
              <ChakraLink as={RouterLink} to="/login">
                <Button colorScheme="teal" variant="outline" color="white" _hover={{ bg: 'teal.600' }}>
                  Login
                </Button>
              </ChakraLink>
              <ChakraLink as={RouterLink} to="/register">
                <Button colorScheme="teal" variant="solid" bg="white" color="teal.500">
                  Register
                </Button>
              </ChakraLink>
            </>
          )}
        </Flex>
      </Flex>
    </Box>
  );
};

export default Navbar;
