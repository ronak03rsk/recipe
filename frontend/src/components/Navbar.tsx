import { Box, Flex, Button, Link as ChakraLink, Text, Container, HStack, Avatar, Menu, MenuButton, MenuList, MenuItem, Icon } from '@chakra-ui/react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FiPlusCircle, FiHeart, FiUser, FiLogOut } from 'react-icons/fi';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Box 
      bg="white" 
      boxShadow="sm" 
      position="sticky" 
      top={0} 
      zIndex={1000}
      borderBottom="1px"
      borderColor="gray.100"
    >
      <Container maxW="container.xl" py={3}>
        <Flex justify="space-between" align="center">
          <ChakraLink 
            as={RouterLink} 
            to="/"
            _hover={{ textDecoration: 'none' }}
          >
            <Text 
              fontSize="2xl" 
              fontWeight="bold" 
              bgGradient="linear(to-r, teal.500, teal.300)"
              bgClip="text"
            >
              RecipeShare
            </Text>
          </ChakraLink>

          <HStack spacing={8}>
            <ChakraLink 
              as={RouterLink} 
              to="/" 
              color="gray.600"
              fontWeight="medium"
              _hover={{ color: 'teal.500', textDecoration: 'none' }}
            >
              Discover
            </ChakraLink>
            
            {user ? (
              <>
                <Button
                  as={RouterLink}
                  to="/add-recipe"
                  colorScheme="teal"
                  leftIcon={<Icon as={FiPlusCircle} />}
                  size="md"
                >
                  Add Recipe
                </Button>
                <Menu>
                  <MenuButton>
                    <Avatar size="sm" name={user.name} bg="teal.500" />
                  </MenuButton>
                  <MenuList>
                    <MenuItem 
                      as={RouterLink} 
                      to="/my-recipes"
                      icon={<Icon as={FiUser} />}
                    >
                      My Recipes
                    </MenuItem>
                    <MenuItem 
                      as={RouterLink} 
                      to="/favorites"
                      icon={<Icon as={FiHeart} />}
                    >
                      Favorites
                    </MenuItem>
                    <MenuItem 
                      onClick={handleLogout}
                      icon={<Icon as={FiLogOut} />}
                      color="red.500"
                    >
                      Logout
                    </MenuItem>
                  </MenuList>
                </Menu>
              </>
            ) : (
              <HStack spacing={4}>
                <Button
                  as={RouterLink}
                  to="/login"
                  variant="ghost"
                  colorScheme="teal"
                >
                  Login
                </Button>
                <Button
                  as={RouterLink}
                  to="/register"
                  colorScheme="teal"
                >
                  Sign Up
                </Button>
              </HStack>
            )}
          </HStack>
        </Flex>
      </Container>
    </Box>
  );
};

export default Navbar;
