import { useState, useEffect } from 'react';
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, IconButton, Snackbar, Alert,
  CircularProgress, LinearProgress, FormControl, Select, MenuItem, Tooltip,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  AdminPanelSettings as AdminIcon,
} from '@mui/icons-material';
import authService from '../services/authService';
import ConfirmDialog from '../components/ConfirmDialog';

const roleStyles = {
  admin: { bg: '#F0FDFA', color: '#0F766E' },
  manager: { bg: '#EEF2FF', color: '#6366F1' },
  contributor: { bg: '#EFF6FF', color: '#0EA5E9' },
  viewer: { bg: '#F3F4F6', color: '#6B7280' },
};

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [snack, setSnack] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  const currentUser = authService.getUser();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const data = await authService.getUsers();
      setUsers(data);
    } catch {
      showSnack('Failed to load users', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await authService.updateUserRole(userId, newRole);
      showSnack('Role updated successfully');
      loadData();
    } catch {
      showSnack('Failed to update role', 'error');
    }
  };

  const handleDelete = async () => {
    try {
      await authService.deleteUser(deleteTarget);
      setDeleteTarget(null);
      showSnack('User deleted');
      loadData();
    } catch {
      showSnack('Failed to delete user', 'error');
    }
  };

  const showSnack = (message, severity = 'success') =>
    setSnack({ open: true, message, severity });

  return (
    <Box className="page-fade-in">

      {/* HEADER */}
      <Paper sx={{ mb: 4, p: 3, borderRadius: 3, borderLeft: '6px solid #0F766E', display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: '12px',
            background: '#0F766E',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <AdminIcon sx={{ color: '#fff' }} />
        </Box>

        <Box>
          <Typography variant="h5" fontWeight={800}>
            Accounts
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage access and role assignments
          </Typography>
        </Box>
      </Paper>

      {/* TABLE */}
      <Paper
        sx={{
          borderRadius: 4,
          overflow: 'hidden',
          border: '1px solid #E2E8F0',
        }}
      >
        {loading ? (
          <Box sx={{ p: 2 }}>
            <LinearProgress aria-label="Fetching data..." />
          </Box>
        ) : (
          <TableContainer>
            <Table>

              {/* HEADER */}
              <TableHead>
                <TableRow>
                  {['Username', 'Email', 'Role', 'Created'].map((h) => (
                    <TableCell
                      key={h}
                      sx={{
                        fontWeight: 700,
                        bgcolor: '#F0FDFA',
                        fontSize: '0.72rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                      }}
                    >
                      {h}
                    </TableCell>
                  ))}
                  <TableCell align="right" sx={{ fontWeight: 700, bgcolor: '#F0FDFA' }}>
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>

              {/* BODY */}
              <TableBody>
                {users.map((user) => (
                  <TableRow
                    key={user.id}
                    hover
                    sx={{
                      transition: 'all 0.2s ease',
                      '&:hover': { bgcolor: '#F0FDFA' },
                    }}
                  >
                    {/* USERNAME */}
                    <TableCell>
                      <Typography fontWeight={600}>
                        {user.username}
                      </Typography>
                    </TableCell>

                    {/* EMAIL */}
                    <TableCell>
                      <Typography color="text.secondary">
                        {user.email}
                      </Typography>
                    </TableCell>

                    {/* ROLE */}
                    <TableCell>
                      <FormControl size="small" sx={{ minWidth: 150 }}>
                        <Select
                          value={user.role}
                          onChange={(e) =>
                            handleRoleChange(user.id, e.target.value)
                          }
                          disabled={user.id === currentUser?.id}
                          sx={{
                            borderRadius: 2.5,
                            fontWeight: 600,
                            fontSize: '0.8rem',
                            bgcolor: roleStyles[user.role]?.bg,
                            color: roleStyles[user.role]?.color,
                            '& .MuiSelect-icon': {
                              color: roleStyles[user.role]?.color,
                            },
                          }}
                        >
                          {['admin', 'manager', 'contributor', 'viewer'].map((r) => (
                            <MenuItem key={r} value={r}>
                              {r}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </TableCell>

                    {/* CREATED DATE */}
                    <TableCell>
                      <Typography
                        sx={{
                          bgcolor: '#F1F5F9',
                          px: 1.5,
                          py: 0.4,
                          borderRadius: 1.5,
                          fontSize: '0.78rem',
                        }}
                      >
                        {user.created_at
                          ? new Date(user.created_at).toLocaleDateString()
                          : '—'}
                      </Typography>
                    </TableCell>

                    {/* ACTIONS */}
                    <TableCell align="right">
                      {user.id !== currentUser?.id && (
                        <Tooltip title="Remove user">
                          <IconButton
                            size="small"
                            onClick={() => setDeleteTarget(user.id)}
                            sx={{
                              color: '#BE123C',
                              bgcolor: '#EEF2FF',
                              borderRadius: 1.5,
                              width: 32,
                              height: 32,
                              '&:hover': {
                                bgcolor: '#FEE2E2',
                              },
                            }}
                          >
                            <DeleteIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Tooltip>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>

            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* DELETE CONFIRMATION */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete User"
        message="Are you sure you want to delete this user? This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* SNACKBAR */}
      <Snackbar
        open={snack.open}
        autoHideDuration={4000}
        onClose={() => setSnack({ ...snack, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity={snack.severity}>
          {snack.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
