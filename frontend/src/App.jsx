import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Layout & Routing
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import IndividualsPage from './pages/IndividualsPage';
import TeamsPage from './pages/TeamsPage';
import AchievementsPage from './pages/AchievementsPage';
import UsersPage from './pages/UsersPage';

// 🎨 THEME — Teal + Indigo identity, Plus Jakarta Sans
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#0F766E' },
    secondary: { main: '#6366F1' },
    success: { main: '#0D9488' },
    warning: { main: '#D97706' },
    error: { main: '#BE123C' },
    background: {
      default: '#F8F7F4',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#1E293B',
      secondary: '#64748B',
    },
    divider: '#E2E8F0',
  },

  typography: {
    fontFamily: '"Plus Jakarta Sans", "Roboto", "Helvetica", "Arial", sans-serif',
    h3: { fontWeight: 800, letterSpacing: '-0.03em' },
    h4: { fontWeight: 800, letterSpacing: '-0.03em' },
    h5: { fontWeight: 700, letterSpacing: '-0.02em' },
    h6: { fontWeight: 700, letterSpacing: '-0.01em' },
    subtitle1: { fontWeight: 600, color: '#475569' },
    subtitle2: { fontWeight: 500, color: '#64748B' },
    body1: { lineHeight: 1.7 },
    body2: { lineHeight: 1.6 },
    button: { fontWeight: 700, textTransform: 'none', letterSpacing: '0.01em' },
  },

  shape: {
    borderRadius: 14,
  },

  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          padding: '10px 24px',
          transition: 'all 0.2s ease',
        },
        containedPrimary: {
          background: '#0F766E',
          boxShadow: 'none',
          '&:hover': {
            background: '#0D6D66',
            boxShadow: '2px 2px 0px 0px #134E4A',
            transform: 'translate(-1px, -1px)',
          },
        },
        outlinedPrimary: {
          borderWidth: '2px',
          borderColor: '#0F766E',
          color: '#0F766E',
          '&:hover': {
            borderWidth: '2px',
            backgroundColor: 'rgba(15, 118, 110, 0.06)',
          },
        },
      },
    },

    MuiPaper: {
      styleOverrides: {
        root: {
          border: '1px solid #E8E8E3',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
        },
      },
    },

    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          border: '1px solid #E8E8E3',
          transition: 'all 0.25s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 24px rgba(15, 118, 110, 0.08)',
          },
        },
      },
    },

    MuiTableCell: {
      styleOverrides: {
        root: {
          padding: '14px 20px',
          borderColor: '#F0EEEA',
        },
        head: {
          fontWeight: 700,
          fontSize: '0.72rem',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          backgroundColor: '#F0FDFA',
          color: '#0F766E',
          borderBottom: '2px solid #CCFBF1',
        },
      },
    },

    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 10,
            transition: 'all 0.2s ease',
            '& fieldset': {
              borderColor: '#E2E8F0',
              borderWidth: '1.5px',
            },
            '&:hover fieldset': {
              borderColor: '#99F6E4',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#0F766E',
              borderWidth: '2px',
              boxShadow: '0 0 0 3px rgba(15, 118, 110, 0.1)',
            },
          },
        },
      },
    },

    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(14px)',
          borderBottom: '1px solid #E8E8E3',
          boxShadow: 'none',
          color: '#1E293B',
        },
      },
    },

    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRight: '1px solid #E8E8E3',
          backgroundColor: '#FAFAF8',
        },
      },
    },

    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          margin: '3px 8px',
          padding: '10px 16px',
          transition: 'all 0.2s ease',
          '&.Mui-selected': {
            backgroundColor: '#F0FDFA',
            color: '#0F766E',
            fontWeight: 700,
          },
          '&:hover': {
            backgroundColor: '#F0FDFA',
          },
          '&.Mui-selected:hover': {
            backgroundColor: '#CCFBF1',
          },
        },
      },
    },

    MuiAvatar: {
      styleOverrides: {
        root: {
          background: '#0F766E',
          fontWeight: 700,
          boxShadow: '0 2px 8px rgba(15, 118, 110, 0.25)',
        },
      },
    },

    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 18,
          padding: 0,
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.18)',
        },
      },
    },

    MuiDialogTitle: {
      styleOverrides: {
        root: {
          backgroundColor: '#0F766E',
          color: '#FFFFFF',
          fontWeight: 700,
          padding: '16px 24px',
        },
      },
    },

    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          height: 3,
          backgroundColor: '#CCFBF1',
        },
        bar: {
          backgroundColor: '#0F766E',
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      <Routes>

        {/* PUBLIC */}
        <Route path="/login" element={<LoginPage />} />

        {/* PROTECTED */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          {/* DEFAULT */}
          <Route index element={<DashboardPage />} />

          {/* MAIN PAGES */}
          <Route path="individuals" element={<IndividualsPage />} />
          <Route path="teams" element={<TeamsPage />} />
          <Route path="achievements" element={<AchievementsPage />} />

          {/* ADMIN */}
          <Route
            path="users"
            element={
              <ProtectedRoute requiredRoles={['admin']}>
                <UsersPage />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* FALLBACK */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </ThemeProvider>
  );
}

export default App;
