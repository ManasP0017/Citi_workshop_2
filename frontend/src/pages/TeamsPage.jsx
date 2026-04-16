import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Box, Button, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, IconButton, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, Snackbar, Alert, Chip, LinearProgress,
  FormControl, InputLabel, Select, MenuItem, Tooltip, InputAdornment,
  TablePagination, useTheme,
} from '@mui/material';
import {
  Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon,
  Search as SearchIcon, Groups as GroupsIcon, WarningAmber as WarningAmberIcon,
} from '@mui/icons-material';
import teamsService from '../services/teamsService';
import individualsService from '../services/individualsService';
import authService from '../services/authService';
import ConfirmDialog from '../components/ConfirmDialog';

const EMPTY_FORM = { name: '', description: '', location: '', leader_id: '', org_leader_id: '' };

export default function TeamsPage() {
  const theme = useTheme();
  const [teams, setTeams] = useState([]);
  const [individuals, setIndividuals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [snack, setSnack] = useState({ open: false, message: '', severity: 'success' });
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => { loadData(); }, []);

  const loadData = useCallback(async () => {
    try {
      const [t, ind] = await Promise.all([
        teamsService.getAll().catch((err) => { console.error('Teams fetch error:', err?.response?.data || err); return []; }),
        individualsService.getAll().catch((err) => { console.error('Individuals fetch error:', err?.response?.data || err); return []; }),
      ]);
      setTeams(Array.isArray(t) ? t : []);
      setIndividuals(Array.isArray(ind) ? ind : []);
    } catch (err) {
      console.error('loadData error:', err);
      showSnack('Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  const filtered = useMemo(() =>
    (teams || []).filter(t =>
      !search || `${t.name || ''} ${t.description || ''} ${t.location || ''}`.toLowerCase().includes(search.toLowerCase())
    ), [teams, search]);

  const handleOpen = useCallback((team = null) => {
    if (team) {
      setEditingId(team.id);
      setForm({
        name: team.name || '',
        description: team.description || '',
        location: team.location || '',
        leader_id: team.leader_id || '',
        org_leader_id: team.org_leader_id || '',
      });
    } else {
      setEditingId(null);
      setForm(EMPTY_FORM);
    }
    setErrors({});
    setDialogOpen(true);
  }, []);

  const validate = () => {
    const e = {};
    if (!form.name?.trim()) e.name = 'Team name is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        description: (form.description || '').trim(),
        location: (form.location || '').trim(),
        leader_id: form.leader_id || null,
        org_leader_id: form.org_leader_id || null,
      };

      if (editingId) {
        await teamsService.update(editingId, payload);
        showSnack('Team updated successfully');
      } else {
        await teamsService.create(payload);
        showSnack('Team created successfully');
      }
      setDialogOpen(false);
      setErrors({});
      await loadData();
    } catch (err) {
      console.error('Save error:', err?.response?.data || err?.message || err);
      // Show the specific message from backend (contains actual SQL/validation error), not the generic "Internal server error"
      const serverData = err?.response?.data;
      const msg = serverData?.message
        || (Array.isArray(serverData?.details) ? serverData.details.join(', ') : null)
        || serverData?.error
        || err?.message
        || 'Operation failed';
      showSnack(msg, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await teamsService.delete(deleteTarget);
      showSnack('Team deleted');
      setDeleteTarget(null);
      await loadData();
    } catch (err) {
      console.error('Delete error:', err?.response?.data || err?.message);
      showSnack(err?.response?.data?.error || 'Delete failed', 'error');
      setDeleteTarget(null);
    }
  };

  const handleCloseSnack = useCallback(() => setSnack(prev => ({ ...prev, open: false })), []);
  const showSnack = (message, severity = 'success') => setSnack({ open: true, message, severity });

  const getPersonName = useCallback((id) => {
    if (!id) return '—';
    const p = individuals.find(i => i.id === id);
    return p ? `${p.first_name} ${p.last_name}` : '—';
  }, [individuals]);

  return (
    <Box className="page-fade-in">
      {/* HEADER */}
      <Paper sx={{ mb: 3, p: 3, borderRadius: 3, borderLeft: '6px solid #0F766E', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <Box sx={{
            width: 48, height: 48, borderRadius: '12px',
            background: '#0F766E',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <GroupsIcon sx={{ color: '#fff' }} />
          </Box>
          <Box>
            <Typography variant="h5" fontWeight={800}>Squads</Typography>
            <Typography variant="body2" color="text.secondary">Organize and manage your squad hierarchy</Typography>
          </Box>
        </Box>
        {authService.canCreate() && (
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpen()}
            aria-label="Create a new squad"
            sx={{
              borderRadius: 2, textTransform: 'none', fontWeight: 600, px: 3,
              background: '#0F766E',
              boxShadow: 'none',
              '&:hover': { boxShadow: '2px 2px 0px 0px #134E4A', transform: 'translate(-1px, -1px)' },
            }}
          >
            New Team
          </Button>
        )}
      </Paper>

      {/* TABLE */}
      <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
          <TextField size="small" placeholder="Type to search..." value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            aria-label="Search teams"
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: 'text.disabled' }} /></InputAdornment> }}
            sx={{ minWidth: 280, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
          />
        </Box>

        {loading ? (
          <LinearProgress aria-label="Fetching data..." sx={{ mx: 2, my: 4 }} />
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ '& th': { fontWeight: 700, bgcolor: 'action.hover', color: 'text.secondary', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: 0.5 } }}>
                    <TableCell>Squad Name</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Location</TableCell>
                    <TableCell>Leader</TableCell>
                    <TableCell>Org Leader</TableCell>
                    <TableCell align="center">Members</TableCell>
                    {(authService.canUpdate() || authService.canDelete()) && <TableCell align="right">Actions</TableCell>}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} sx={{ textAlign: 'center', py: 6 }}>
                        <GroupsIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                        <Typography color="text.secondary" display="block">
                          {search ? 'No matching squads found' : 'No squads created yet'}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((team) => (
                      <TableRow key={team.id} hover sx={{ transition: 'background 0.2s' }}>
                        <TableCell>
                          <Typography variant="subtitle2" fontWeight={600}>{team.name}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary"
                            sx={{ maxWidth: 250, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {team.description || '—'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">{team.location || '—'}</Typography>
                        </TableCell>
                        <TableCell>
                          {team.leader_id ? (
                            <Typography variant="body2" color="text.secondary">{getPersonName(team.leader_id)}</Typography>
                          ) : (
                            <Chip
                              icon={<WarningAmberIcon />}
                              label="No Leader"
                              color="warning"
                              size="small"
                              variant="outlined"
                              sx={{ borderRadius: 1.5 }}
                            />
                          )}
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">{getPersonName(team.org_leader_id)}</Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Chip label={team.member_count || 0} size="small"
                            sx={{ fontWeight: 700, bgcolor: '#CCFBF1', color: '#0F766E', border: '1px solid #99F6E4', minWidth: 36 }} />
                        </TableCell>
                        {(authService.canUpdate() || authService.canDelete()) && (
                          <TableCell align="right">
                            {authService.canUpdate() && (
                              <Tooltip title="Modify">
                                <IconButton size="small" onClick={() => handleOpen(team)}
                                  aria-label={`Modify ${team.name}`} sx={{ bgcolor: '#F0FDFA', color: '#0F766E' }}>
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
                            {authService.canDelete() && (
                              <Tooltip title="Remove">
                                <IconButton size="small" onClick={() => setDeleteTarget(team.id)}
                                  aria-label={`Remove ${team.name}`} sx={{ bgcolor: '#FFF1F2', color: '#BE123C' }}>
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
                          </TableCell>
                        )}
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination component="div" count={filtered.length} page={page} rowsPerPage={rowsPerPage}
              onPageChange={(_, p) => setPage(p)} onRowsPerPageChange={(e) => { setRowsPerPage(+e.target.value); setPage(0); }}
              rowsPerPageOptions={[5, 10, 25]} />
          </>
        )}
      </Paper>

      {/* CREATE/EDIT DIALOG */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 700 }}>{editingId ? 'Edit Team' : 'Add Team'}</DialogTitle>
        <DialogContent sx={{ pt: '16px !important' }}>
          <TextField fullWidth label="Squad Name" value={form.name} required
            onChange={(e) => { setForm({ ...form, name: e.target.value }); setErrors(p => ({ ...p, name: undefined })); }}
            error={!!errors.name} helperText={errors.name}
            sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
          />
          <TextField fullWidth label="Description" value={form.description} multiline rows={2}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
          />
          <TextField fullWidth label="Location" value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
          />
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            <FormControl fullWidth sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}>
              <InputLabel>Squad Leader</InputLabel>
              <Select value={form.leader_id} label="Squad Leader"
                onChange={(e) => setForm({ ...form, leader_id: e.target.value })}>
                <MenuItem value="">None</MenuItem>
                {individuals.map(i => <MenuItem key={i.id} value={i.id}>{i.first_name} {i.last_name}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl fullWidth sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}>
              <InputLabel>Org Leader</InputLabel>
              <Select value={form.org_leader_id} label="Org Leader"
                onChange={(e) => setForm({ ...form, org_leader_id: e.target.value })}>
                <MenuItem value="">None</MenuItem>
                {individuals.map(i => <MenuItem key={i.id} value={i.id}>{i.first_name} {i.last_name}</MenuItem>)}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDialogOpen(false)} sx={{ borderRadius: 2 }}>Dismiss</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving}
            sx={{
              borderRadius: 2,
              background: '#0F766E',
            }}
          >
            {saving ? <LinearProgress sx={{ width: 60, height: 3 }} /> : 'Confirm'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* DELETE CONFIRM */}
      <ConfirmDialog open={!!deleteTarget} title="Delete Team"
        message="Are you sure you want to delete this team? All member associations will be removed."
        onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />

      {/* SNACKBAR */}
      <Snackbar open={snack.open} autoHideDuration={4000} onClose={handleCloseSnack}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert severity={snack.severity} onClose={handleCloseSnack} sx={{ borderRadius: 2 }}>{snack.message}</Alert>
      </Snackbar>
    </Box>
  );
}