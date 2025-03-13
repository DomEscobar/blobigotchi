
import React from 'react';
import { 
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate
} from 'react-router-dom';
import Index from './pages/Index';
import FashionStudio from './pages/FashionStudio';
import NotFound from './pages/NotFound';
import { Toaster } from './components/ui/sonner';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/fashion" element={<FashionStudio />} />
        <Route path="/404" element={<NotFound />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
      <Toaster position="top-center" />
    </Router>
  );
}

export default App;
