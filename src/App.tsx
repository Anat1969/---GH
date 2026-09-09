import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { WorkspaceProvider } from '@/contexts/WorkspaceContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ChallengeDetail from './pages/ChallengeDetail';
import ChallengeLibrary from './pages/ChallengeLibrary';
import Landing from './pages/Landing';
import NotFound from './pages/NotFound';
import Workspace from './pages/Workspace';

// On GitHub Pages the app is served from /<repo>/, which Vite exposes as BASE_URL.
// The router needs the same prefix or every link would resolve to the domain root.
const basename = import.meta.env.BASE_URL.replace(/\/$/, '');

const App = () => (
  <ThemeProvider>
    <TooltipProvider>
      <Toaster />
      <BrowserRouter basename={basename}>
        <WorkspaceProvider>
          <Routes>
            <Route element={<DashboardLayout />}>
              <Route path="/" element={<Landing />} />
              <Route path="/challenges" element={<ChallengeLibrary />} />
              <Route path="/challenges/:id" element={<ChallengeDetail />} />
              <Route path="/workspace" element={<Workspace />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </WorkspaceProvider>
      </BrowserRouter>
    </TooltipProvider>
  </ThemeProvider>
);

export default App;
