import { useState } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import {
  AppBar, Box, CssBaseline, Drawer, IconButton, List, ListItem,
  ListItemButton, ListItemIcon, ListItemText, Toolbar, Typography,
  Avatar, Menu, MenuItem, Divider, Chip, useMediaQuery, useTheme,
} from '@mui/material';
import {
  Menu as MenuIcon, Dashboard as DashboardIcon, People as PeopleIcon,
  Groups as GroupsIcon, EmojiEvents as TrophyIcon, Logout as LogoutIcon,
  AdminPanelSettings as AdminIcon,
} from '@mui/icons-material';
import authService from '../services/authService';

const DRAWER_WIDTH = 260;

const navItems = [
  { text: 'Overview', icon: <DashboardIcon />, path: '/' },
  { text: 'Members', icon: <PeopleIcon />, path: '/individuals' },
  { text: 'Squads', icon: <GroupsIcon />, path: '/teams' },
  { text: 'Team Wins', icon: <TrophyIcon />, path: '/achievements' },
];

export default function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const user = authService.getUser();

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);
  const handleMenuOpen = (e) => setAnchorEl(e.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const roleColors = {
    admin: '#0F766E',
    manager: '#6366F1',
    contributor: '#0EA5E9',
    viewer: '#6B7280',
  };

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Logo */}
      <Box sx={{
        p: 3,
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        background: '#0F766E',
      }}>
        <GroupsIcon sx={{ color: '#fff', fontSize: 30 }} />
        <Box>
          <Typography sx={{ color: '#fff', fontWeight: 800, fontSize: '0.95rem' }}>
            TeamHub
          </Typography>
          <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.7rem' }}>
            Squad Management
          </Typography>
        </Box>
      </Box>

      {/* Navigation */}
      <List sx={{ flex: 1, px: 1.5, pt: 2 }}>
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;

          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => {
                  navigate(item.path);
                  if (isMobile) setMobileOpen(false);
                }}
                sx={{
                  borderRadius: 2.5,
                  px: 2,
                  py: 1.2,
                  transition: 'all 0.2s ease',
                  bgcolor: isActive ? '#F0FDFA' : 'transparent',
                  color: isActive ? '#0F766E' : '#64748B',

                  '&:hover': {
                    bgcolor: isActive ? '#CCFBF1' : '#F0FDFA',
                    transform: 'translateX(4px)',
                  },
                }}
              >
                <ListItemIcon sx={{ color: 'inherit', minWidth: 36 }}>
                  {item.icon}
                </ListItemIcon>

                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    fontWeight: isActive ? 600 : 500,
                    fontSize: '0.9rem',
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}

        {/* Admin Section */}
        {authService.isAdmin() && (
          <>
            <Divider sx={{ my: 2 }} />
            <ListItem disablePadding>
              <ListItemButton
                onClick={() => {
                  navigate('/users');
                  if (isMobile) setMobileOpen(false);
                }}
                sx={{
                  borderRadius: 2.5,
                  px: 2,
                  py: 1.2,
                  transition: 'all 0.2s ease',
                  bgcolor: location.pathname === '/users' ? '#F0FDFA' : 'transparent',
                  color: location.pathname === '/users' ? '#0F766E' : '#64748B',

                  '&:hover': {
                    bgcolor: '#F0FDFA',
                    transform: 'translateX(4px)',
                  },
                }}
              >
                <ListItemIcon sx={{ color: 'inherit', minWidth: 36 }}>
                  <AdminIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Accounts"
                  primaryTypographyProps={{ fontWeight: 600 }}
                />
              </ListItemButton>
            </ListItem>
          </>
        )}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#F8F7F4' }}>
      <CssBaseline />

      {/* Top Bar */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { md: `${DRAWER_WIDTH}px` },
          bgcolor: 'rgba(255,255,255,0.85)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid #E8E8E3',
        }}
      >
        <Toolbar sx={{ minHeight: '64px !important' }}>
          <IconButton
            edge="start"
            onClick={handleDrawerToggle}
            sx={{
              mr: 2,
              display: { md: 'none' },
              color: 'text.primary',
            }}
          >
            <MenuIcon />
          </IconButton>

          <Box sx={{ flex: 1 }} />

          {/* Role */}
          <Chip
            label={user?.role?.toUpperCase()}
            size="small"
            sx={{
              mr: 2,
              fontWeight: 700,
              fontSize: '0.65rem',
              letterSpacing: 1,
              bgcolor: `${roleColors[user?.role] || '#6B7280'}18`,
              color: roleColors[user?.role] || '#6B7280',
              border: `1px solid ${roleColors[user?.role] || '#6B7280'}30`,
            }}
          />

          {/* Avatar */}
          <IconButton onClick={handleMenuOpen} sx={{ p: 0 }}>
            <Avatar
              sx={{
                width: 36,
                height: 36,
                fontSize: '0.85rem',
                fontWeight: 700,
                background: '#0F766E',
              }}
            >
              {user?.username?.charAt(0)?.toUpperCase() || 'U'}
            </Avatar>
          </IconButton>

          {/* Menu */}
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            PaperProps={{
              sx: {
                mt: 1,
                borderRadius: 2.5,
                minWidth: 200,
                boxShadow: '0 12px 32px rgba(15,23,42,0.15)',
              },
            }}
          >
            <Box sx={{ px: 2, py: 1.5 }}>
              <Typography fontWeight={700}>
                {user?.username}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {user?.email}
              </Typography>
            </Box>

            <Divider />

            <MenuItem
              onClick={handleLogout}
              sx={{ color: 'error.main' }}
            >
              <ListItemIcon>
                <LogoutIcon fontSize="small" sx={{ color: 'error.main' }} />
              </ListItemIcon>
              Sign Out
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Drawer */}
      <Box component="nav" sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              width: DRAWER_WIDTH,
              border: 'none',
            },
          }}
        >
          {drawer}
        </Drawer>

        <Drawer
          variant="permanent"
          open
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': {
              width: DRAWER_WIDTH,
              border: 'none',
              boxShadow: '1px 0 0 rgba(0,0,0,0.05)',
            },
          }}
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, md: 3 },
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          mt: '64px',
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}