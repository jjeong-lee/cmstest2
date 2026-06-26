import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AdminLayout } from '../components/layout/AdminLayout';
import { PortalLayout } from '../components/layout/PortalLayout';
import { AdminDashboardPage } from '../pages/admin/AdminDashboardPage';
import { AdminDocumentsPage } from '../pages/admin/AdminDocumentsPage';
import { AdminUsersPage } from '../pages/admin/AdminUsersPage';
import { PortalHomePage } from '../pages/public/PortalHomePage';
import { PortalDocumentPage } from '../pages/public/PortalDocumentPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <PortalLayout />,
    children: [
      { index: true, element: <PortalHomePage /> },
      { path: 'documents/:documentId', element: <PortalDocumentPage /> },
    ],
  },
  {
    path: '/admin',
    element: <AdminLayout />,
    children: [
      { index: true, element: <AdminDashboardPage /> },
      { path: 'documents', element: <AdminDocumentsPage /> },
      { path: 'users', element: <AdminUsersPage /> },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);
