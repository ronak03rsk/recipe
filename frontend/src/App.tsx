import { ChakraProvider, Box } from '@chakra-ui/react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from './contexts/AuthContext'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import AddRecipe from './pages/AddRecipe'
import RecipeDetail from './pages/RecipeDetail'
import MyRecipes from './pages/MyRecipes'
import Favorites from './pages/Favorites'
import EditRecipe from './pages/EditRecipe'

const queryClient = new QueryClient()

function App() {
  return (
    <ChakraProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Router>
            <Box minH="100vh" bg="gray.50">
              <Navbar />
              <Box maxW="1200px" mx="auto" px={4} py={8}>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/add-recipe" element={<AddRecipe />} />
                  <Route path="/recipe/:id" element={<RecipeDetail />} />
                  <Route path="/my-recipes" element={<MyRecipes />} />
                  <Route path="/favorites" element={<Favorites />} />
                  <Route path="/edit-recipe/:id" element={<EditRecipe />} />
                </Routes>
              </Box>
            </Box>
          </Router>
        </AuthProvider>
      </QueryClientProvider>
    </ChakraProvider>
  )
}

export default App
