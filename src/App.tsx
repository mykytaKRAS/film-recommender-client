import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { Navbar } from './components/Navbar';
import { ProtectedRoute } from './components/ProtectedRoute';
import { MoviesPage }     from './pages/MoviesPage';
import { MovieDetailPage } from './pages/MovieDetailPage';
import { ProfilePage }    from './pages/ProfilePage';
import { LoginPage, RegisterPage } from './pages/AuthPages';
import { SurveyPage }    from './pages/SurveyPage';
import { RecommendationsPage } from './pages/RecommendationsPage';
import { ExplainerPage } from './pages/ExplainerPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div className="min-h-screen bg-gray-950 text-white">
          <Navbar />
          <Routes>
            <Route path="/"           element={<MoviesPage />} />
            <Route path="/movies/:id" element={<MovieDetailPage />} />
            <Route path="/login"      element={<LoginPage />} />
            <Route path="/register"   element={<RegisterPage />} />
            <Route path="/profile"    element={
              <ProtectedRoute><ProfilePage /></ProtectedRoute>
            } />
            <Route path="/survey"     element={
              <ProtectedRoute><SurveyPage /></ProtectedRoute>
            } />
            <Route path="/recommendations" element={
              <ProtectedRoute><RecommendationsPage /></ProtectedRoute>} />
              <Route path="/explainer" element={
              <ProtectedRoute><ExplainerPage /></ProtectedRoute>} />
          </Routes>
        </div>
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#1f2937',
              color: '#f9fafb',
              border: '1px solid #374151',
            },
          }}
        />
      </BrowserRouter>
    </QueryClientProvider>
  );
}