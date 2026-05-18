import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './services/auth';
import { LoginPage } from './pages/Login';

// Family
import { FamilyLayout } from './layouts/FamilyLayout';
import { FamilyDashboard } from './pages/family/Dashboard';
import { FamilyList } from './pages/family/List';
import { FamilyNew } from './pages/family/New';
import { FamilyDetail } from './pages/family/Detail';
import { FamilyConfirm } from './pages/family/Confirm';

// Internal (preceptor, secretary, admin)
import { InternalLayout } from './layouts/InternalLayout';
import { InternalDashboard } from './pages/internal/Dashboard';
import { InternalTable } from './pages/internal/Table';
import { InternalAuthDetail } from './pages/internal/AuthDetail';
import { InternalStudent } from './pages/internal/Student';

// Gate
import { GateLayout } from './layouts/GateLayout';
import { GateSearch } from './pages/gate/Search';

export function App() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={user ? <RoleHome /> : <LoginPage />} />

      {/* Family routes */}
      <Route path="/familia" element={<RequireRole roles={['family']}><FamilyLayout /></RequireRole>}>
        <Route index element={<FamilyDashboard />} />
        <Route path="autorizaciones" element={<FamilyList />} />
        <Route path="autorizaciones/nueva" element={<FamilyNew />} />
        <Route path="autorizaciones/confirmada/:id" element={<FamilyConfirm />} />
        <Route path="autorizaciones/:id" element={<FamilyDetail />} />
      </Route>

      {/* Internal staff routes */}
      <Route path="/cole" element={<RequireRole roles={['preceptor', 'secretary', 'admin']}><InternalLayout /></RequireRole>}>
        <Route index element={<InternalDashboard />} />
        <Route path="autorizaciones" element={<InternalTable />} />
        <Route path="autorizaciones/:id" element={<InternalAuthDetail />} />
        <Route path="alumnos/:id" element={<InternalStudent />} />
      </Route>

      {/* Gate */}
      <Route path="/porteria" element={<RequireRole roles={['gate', 'admin']}><GateLayout /></RequireRole>}>
        <Route index element={<GateSearch />} />
      </Route>

      <Route path="/" element={<RoleHome />} />
      <Route path="*" element={<RoleHome />} />
    </Routes>
  );
}

function RoleHome() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'family') return <Navigate to="/familia" replace />;
  if (user.role === 'gate') return <Navigate to="/porteria" replace />;
  return <Navigate to="/cole" replace />;
}

function RequireRole({ roles, children }: { roles: string[]; children: React.ReactElement }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (!roles.includes(user.role)) return <RoleHome />;
  return children;
}
