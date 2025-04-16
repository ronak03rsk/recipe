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
      bg="whiteAlpha.900"
      boxShadow="md"
      position="sticky"
      top={0}
      zIndex={1000}
      borderBottom="2px"
      borderColor="teal.100"
      transition="box-shadow 0.2s"
    >
      <Container maxW="container.xl" py={3}>
        <Flex justify="space-between" align="center">
          <ChakraLink
            as={RouterLink}
            to="/"
            _hover={{ textDecoration: 'none' }}
          >
            <Text
              fontSize={{ base: 'xl', md: '2xl' }}
              fontWeight="bold"
              bgGradient="linear(to-r, teal.500, teal.300)"
              bgClip="text"
              letterSpacing="tight"
            >
              RecipeShare
            </Text>
          </ChakraLink>

          <HStack spacing={{ base: 2, md: 8 }}>
            <ChakraLink
              as={RouterLink}
              to="/"
              color="gray.600"
              fontWeight="semibold"
              px={2}
              py={1}
              borderRadius="md"
              _hover={{ color: 'teal.600', bg: 'teal.50', textDecoration: 'none' }}
              _activeLink={{ color: 'teal.700', fontWeight: 'bold' }}
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
