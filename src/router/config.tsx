import { RouteObject } from 'react-router-dom';
import { lazy } from 'react';

const HomePage = lazy(() => import('../pages/home/page'));
const SpacePage = lazy(() => import('../pages/space/page'));
const ReviewPage = lazy(() => import('../pages/review/page'));
const MyPage = lazy(() => import('../pages/mypage/page'));
const LayoutEditorPage = lazy(() => import('../pages/layout-editor/page'));
const SpaceRegisterPage = lazy(() => import('../pages/space-register/page'));
const AdminPage = lazy(() => import('../pages/admin/page'));
const OwnerDashboardPage = lazy(() => import('../pages/owner-dashboard/page'));
const NotFound = lazy(() => import('../pages/NotFound'));

function SpaceRedirect() {
  const { id } = useParams<{ id: string }>();
  return <Navigate to={`/space/${id}`} replace />;
}

const routes: RouteObject[] = [
  {
    path: '/',
    element: <HomePage />
  },
  {
    path: '/space/:id',
    element: <SpacePage />
  },
  {
    path: '/venue/:id',
    element: <SpaceRedirect />
  },
  {
    path: '/review',
    element: <ReviewPage />
  },
  {
    path: '/mypage',
    element: <MyPage />
  },
  {
    path: '/layout-editor',
    element: <LayoutEditorPage />
  },
  {
    path: '/space-register',
    element: <SpaceRegisterPage />
  },
  {
    path: '/venue-register',
    element: <Navigate to="/space-register" replace />
  },
  {
    path: '/admin',
    element: <AdminPage />
  },
  {
    path: '/owner-dashboard',
    element: <OwnerDashboardPage />
  },
  {
    path: '*',
    element: <NotFound />
  }
];

export default routes;
