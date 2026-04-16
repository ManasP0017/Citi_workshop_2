import { useState, useEffect } from 'react';
import {
  Box, Button, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, IconButton, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, Snackbar, Alert, LinearProgress,
  Tooltip, InputAdornment, TablePagination,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  People as PeopleIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import individualsService from '../services/individualsService';
import authService from '../services/authService';
import ConfirmDialog from '../components/ConfirmDialog';
import IndividualDetailsDialog from '../components/IndividualDetailsDialog';

const EMPTY_FORM = {
  first_name: '',
  last_name: '',
  email: '',
  role: '',
};

export default function IndividualsPage() {
  const [individuals, setIndividuals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [detailsTarget, setDetailsTarget] = useState(null);
  const [snack, setSnack] = useState({ open: false, message: '', severity: 'success' });
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const data = await individualsService.getAll();
      setIndividuals(data);
    } catch {
      showSnack('Failed to load individuals', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filtered = individuals.filter((i) =>
    !search ||
    `${i.first_name} ${i.last_name} ${i.email}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const handleOpen = (person = null) => {
    if (person) {
      setEditingId(person.id);
      setForm({
        first_name: person.first_name || '',
        last_name: person.last_name || '',
        email: person.email || '',
        role: person.role || '',
      });
    } else {
      setEditingId(null);
      setForm(EMPTY_FORM);
    }
    setDialogOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editingId) {
        await individualsService.update(editingId, form);
        showSnack('Individual updated');
      } else {
        await individualsService.create(form);
        showSnack('Individual created');
      }
      setDialogOpen(false);
      loadData();
    } catch {
      showSnack('Operation failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await individualsService.delete(deleteTarget);
      setDeleteTarget(null);
      showSnack('Individual deleted');
      loadData();
    } catch {
      showSnack('Delete failed', 'error');
    }
  };

  const showSnack = (message, severity = 'success') =>
    setSnack({ open: true, message, severity });

  return (
    <Box className="page-fade-in">

      {/* HEADER */}
      <Paper
        sx={{
          mb: 4,
          p: 3,
          borderRadius: 3,
          borderLeft: '6px solid #0F766E',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
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
            <PeopleIcon sx={{ color: '#fff' }} />
          </Box>

          <Box>
            <Typography variant="h5" fontWeight={800}>
              Members
            </Typography>
            <Typography variant="body2" color="text.secondary">
              View and manage individual member profiles
            </Typography>
          </Box>
        </Box>

        {authService.canCreate() && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpen()}
            sx={{
              borderRadius: 2,
              px: 3,
              fontWeight: 600,
              background: '#0F766E',
              boxShadow: 'none',
              '&:hover': {
                boxShadow: '2px 2px 0px 0px #134E4A',
                transform: 'translate(-1px, -1px)',
              },
            }}
          >
            Add Member
          </Button>
        )}
      </Paper>

      {/* SEARCH */}
      <Paper
        sx={{
          p: 2.5,
          mb: 2,
          borderRadius: 3,
          border: '1px solid #E2E8F0',
        }}
      >
        <TextField
          size="small"
          placeholder="Type to search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: 'text.disabled' }} />
              </InputAdornment>
            ),
          }}
          sx={{
            minWidth: 280,
            '& .MuiOutlinedInput-root': {
              borderRadius: 2.5,
            },
          }}
        />
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
          <LinearProgress aria-label="Fetching data..." sx={{ mx: 2, my: 4 }} />
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    {['Name', 'Email', 'Role'].map((h) => (
                      <TableCell
                        key={h}
                        sx={{
                          fontWeight: 700,
                          bgcolor: '#F0FDFA',
                          fontSize: '0.72rem',
                          textTransform: 'uppercase',
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

                <TableBody>
                  {filtered
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((person) => (
                      <TableRow
                        key={person.id}
                        hover
                        sx={{
                          transition: 'all 0.2s',
                          '&:hover': { bgcolor: '#F0FDFA' },
                        }}
                      >
                        <TableCell>
                          <Typography fontWeight={600}>
                            {person.first_name} {person.last_name}
                          </Typography>
                        </TableCell>

                        <TableCell>{person.email}</TableCell>

                        <TableCell>
                          <Typography
                            sx={{
                              bgcolor: '#EEF2FF',
                              px: 1.5,
                              py: 0.4,
                              borderRadius: 1.5,
                              fontSize: '0.78rem',
                              display: 'inline-block',
                            }}
                          >
                            {person.role || '—'}
                          </Typography>
                        </TableCell>

                        <TableCell align="right">
                          <Tooltip title="View Performance & Records">
                            <IconButton onClick={() => setDetailsTarget(person)}>
                              <VisibilityIcon />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title="Modify">
                            <IconButton onClick={() => handleOpen(person)} sx={{ bgcolor: '#F0FDFA', color: '#0F766E' }}>
                              <EditIcon />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title="Remove">
                            <IconButton onClick={() => setDeleteTarget(person.id)} sx={{ bgcolor: '#FFF1F2', color: '#BE123C' }}>
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>

            <TablePagination
              component="div"
              count={filtered.length}
              page={page}
              rowsPerPage={rowsPerPage}
              onPageChange={(_, p) => setPage(p)}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(+e.target.value);
                setPage(0);
              }}
            />
          </>
        )}
      </Paper>

      {/* DIALOG */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>
          {editingId ? 'Edit Individual' : 'Add Individual'}
        </DialogTitle>

        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <TextField
            fullWidth
            label="First Name"
            value={form.first_name}
            onChange={(e) => setForm({ ...form, first_name: e.target.value })}
          />

          <TextField
            fullWidth
            label="Last Name"
            value={form.last_name}
            onChange={(e) => setForm({ ...form, last_name: e.target.value })}
          />

          <TextField
            fullWidth
            label="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />

          <TextField
            fullWidth
            label="Role"
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
          />
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDialogOpen(false)}>Dismiss</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving}>
            {saving ? <LinearProgress sx={{ width: 60, height: 3 }} /> : 'Confirm'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* DELETE CONFIRM */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Individual"
        message="Are you sure you want to delete this individual?"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* DETAILS DASHBOARD */}
      <IndividualDetailsDialog
        open={!!detailsTarget}
        onClose={() => setDetailsTarget(null)}
        person={detailsTarget}
      />

      {/* SNACKBAR */}
      <Snackbar
        open={snack.open}
        autoHideDuration={4000}
        onClose={() => setSnack({ ...snack, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity={snack.severity}>{snack.message}</Alert>
      </Snackbar>
    </Box>
  );
}