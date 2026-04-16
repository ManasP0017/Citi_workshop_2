import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, TextField, Button, Typography, Alert,
  InputAdornment, IconButton, CircularProgress,
} from '@mui/material';
import {
  Visibility, VisibilityOff,
  Email as EmailIcon,
  Lock as LockIcon,
  Person as PersonIcon,
  Bolt as BoltIcon,
  Groups as GroupsIcon,
} from '@mui/icons-material';
import authService from '../services/authService';

export default function LoginPage() {
  const [mode, setMode] = useState('login'); // login | register
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (mode === 'login') {
        await authService.login(form.username, form.password);
      } else {
        if (!form.email) {
          setError('Email is required');
          setLoading(false);
          return;
        }
        await authService.register(form.username, form.email, form.password);
      }
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#F8F7F4' }}>

      {/* LEFT SIDE */}
      <Box sx={{
        flex: 1,
        display: { xs: 'none', md: 'flex' },
        flexDirection: 'column',
        justifyContent: 'center',
        px: 8,
        background: 'linear-gradient(135deg, #F0FDFA 0%, #CCFBF1 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Decorative elements */}
        <Box sx={{
          position: 'absolute', top: -100, right: -100,
          width: 400, height: 400, borderRadius: '50%',
          background: 'linear-gradient(135deg, rgba(15,118,110,0.15) 0%, rgba(20,184,166,0.15) 100%)',
          filter: 'blur(60px)',
        }} />
        <Box sx={{
          position: 'absolute', bottom: -100, left: -100,
          width: 400, height: 400, borderRadius: '50%',
          background: 'linear-gradient(135deg, rgba(99,102,241,0.12) 0%, rgba(15,118,110,0.12) 100%)',
          filter: 'blur(60px)',
        }} />

        <Box sx={{ maxWidth: 500, position: 'relative', zIndex: 1 }}>
          <Box sx={{
            width: 64, height: 64, borderRadius: 4,
            mb: 4,
            background: mode === 'login'
              ? '#0F766E'
              : '#6366F1',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 10px 25px rgba(15,118,110,0.3)',
          }}>
            {mode === 'login'
              ? <BoltIcon sx={{ color: '#fff', fontSize: 32 }} />
              : <GroupsIcon sx={{ color: '#fff', fontSize: 32 }} />}
          </Box>

          <Typography variant="h3" sx={{ fontWeight: 800, color: '#0F172A', mb: 2, letterSpacing: '-0.5px' }}>
            {mode === 'login' ? 'TeamHub' : 'Join TeamHub'}
          </Typography>

          <Typography sx={{ color: '#475569', mb: 5, fontSize: '1.1rem', lineHeight: 1.6 }}>
            {mode === 'login'
              ? 'Unlock deep organizational insights and streamline your squad performance.'
              : 'Empower your squad with collaboration and structured management.'}
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {(mode === 'login'
            ? ['Secure Authentication', 'Real-time Business Intelligence', 'Global Synchronization']
            : ['Real-time telemetry', 'Leadership tools', 'Enterprise security']
          ).map((item) => (
            <Box key={item} sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              px: 3,
              py: 2,
              borderRadius: 3,
              bgcolor: 'rgba(255,255,255,0.6)',
              border: '1px solid rgba(255,255,255,0.8)',
              backdropFilter: 'blur(10px)',
            }}>
              <Box sx={{
                width: 8, height: 8, borderRadius: '50%',
                background: '#0F766E'
              }} />
              <Typography sx={{ color: '#1E293B', fontWeight: 600 }}>
                {item}
              </Typography>
            </Box>
          ))}
          </Box>
        </Box>
      </Box>

      {/* RIGHT SIDE */}
      <Box sx={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: { xs: 3, md: 8 },
        bgcolor: '#FFFFFF',
      }}>
        <Box sx={{
          width: '100%',
          maxWidth: 440,
        }}>
          <Typography variant="h4" sx={{ color: '#1E293B', fontWeight: 800, mb: 1, letterSpacing: '-0.5px' }}>
            {mode === 'login' ? 'Good to see you' : 'Create Profile'}
          </Typography>

          <Typography sx={{ color: '#64748B', mb: 4 }}>
            {mode === 'login'
              ? 'Enter your credentials to access your account.'
              : 'Begin your journey with TeamHub today.'}
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}

          <form onSubmit={handleSubmit}>

            {/* Username */}
            <TextField
              fullWidth
              name="username"
              placeholder={mode === 'login' ? 'Username or Email' : 'Full Name'}
              value={form.username}
              onChange={handleChange}
              sx={{ mb: 2.5 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon sx={{ color: '#94A3B8' }} />
                  </InputAdornment>
                ),
              }}
            />

            {/* Email (only register) */}
            {mode === 'register' && (
              <TextField
                fullWidth
                name="email"
                placeholder="Email Address"
                value={form.email}
                onChange={handleChange}
                sx={{ mb: 2.5 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon sx={{ color: '#94A3B8' }} />
                    </InputAdornment>
                  ),
                }}
              />
            )}

            {/* Password */}
            <TextField
              fullWidth
              name="password"
              placeholder="Password"
              type={showPassword ? 'text' : 'password'}
              value={form.password}
              onChange={handleChange}
              sx={{ mb: 4 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon sx={{ color: '#94A3B8' }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                    {showPassword ? <VisibilityOff sx={{ color: '#94A3B8' }} /> : <Visibility sx={{ color: '#94A3B8' }} />}
                  </IconButton>
                ),
              }}
            />

            <Button
              fullWidth
              type="submit"
              variant="contained"
              size="large"
              disabled={loading}
              sx={{
                py: 1.8,
                borderRadius: 2,
                fontWeight: 700,
                fontSize: '1rem',
                background: '#0F766E',
                boxShadow: 'none',
                '&:hover': {
                  background: '#0D6D66',
                  boxShadow: '2px 2px 0px 0px #134E4A',
                  transform: 'translate(-1px, -1px)',
                }
              }}
            >
              {loading
                ? <CircularProgress size={24} color="inherit" />
                : mode === 'login' ? 'Sign In' : 'Create Account'}
            </Button>
          </form>

          {/* TOGGLE */}
          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Typography sx={{ color: '#64748B' }}>
              {mode === 'login' ? "Don't have an account?" : "Already have an account?"}{' '}
              <Typography
                component="span"
                sx={{ 
                  color: '#0F766E', 
                  fontWeight: 600, 
                  cursor: 'pointer',
                  '&:hover': { textDecoration: 'underline' }
                }}
                onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
              >
                {mode === 'login' ? 'Create Account' : 'Sign In'}
              </Typography>
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}