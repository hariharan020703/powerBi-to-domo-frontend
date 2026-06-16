import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import Landing from './pages/Landing';
import Projects from './pages/Projects';
import ProjectsEmpty from './pages/ProjectsEmpty';
import DashboardInventory from './pages/DashboardInventory';
import MigrationProgress from './pages/MigrationProgress';
import Connections from './pages/Connections';
import Documents from './pages/Documents';
import Settings from './pages/Settings';

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/app" element={<Projects />} />
          <Route path="/app/empty" element={<ProjectsEmpty />} />
          <Route path="/app/project/acme" element={<DashboardInventory />} />
          <Route path="/app/project/:id" element={<DashboardInventory />} />
          <Route path="/app/migration" element={<MigrationProgress />} />
          <Route path="/app/connections" element={<Connections />} />
          <Route path="/app/dashboards" element={<DashboardInventory />} />
          <Route path="/app/documents" element={<Documents />} />
          <Route path="/app/settings" element={<Settings />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}
