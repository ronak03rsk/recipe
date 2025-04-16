import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,

  FormControl,
  FormLabel,
  Heading,
  Input,
  Link,
  Text,
  useToast,
  VStack,
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await register(email, password, name);
      toast({
        title: 'Registration successful',
        status: 'success',
        duration: 3000,
      });
      navigate('/');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Registration failed',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      minH="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      bgGradient="linear(to-br, teal.50, teal.100, white)"
      p={2}
    >
      <Box
        p={{ base: 4, md: 8 }}
        borderWidth={1}
        borderRadius="2xl"
        boxShadow="2xl"
        bg="whiteAlpha.900"
        w="full"
        maxW={{ base: '95vw', md: 'md' }}
      >

        <VStack spacing={6} align="stretch">
          <Heading textAlign="center" size="xl" color="teal.600" letterSpacing="tight">
            Create Account
          </Heading>
          <form onSubmit={handleSubmit}>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Name</FormLabel>
                <Input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  size="lg"
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Email</FormLabel>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  size="lg"
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Password</FormLabel>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  size="lg"
                />
              </FormControl>
              <Button
                type="submit"
                colorScheme="teal"
                size="lg"
                width="100%"
                borderRadius="full"
                fontWeight="bold"
                shadow="sm"
                isLoading={isLoading}
                loadingText="Registering..."
              >
                Register
              </Button>
            </VStack>
          </form>
          <Text fontSize="sm" color="gray.600" textAlign="center">
            Already have an account?{' '}
            <Link as={RouterLink} to="/login" color="teal.500" fontWeight="bold" _hover={{ textDecoration: 'underline' }}>
              Login here
            </Link>
          </Text>
        </VStack>
      </Box>
    </Box>
  );
};

export default Register;
