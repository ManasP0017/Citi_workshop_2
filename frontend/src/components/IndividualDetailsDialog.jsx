import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, Box, Tabs, Tab,
  Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, IconButton, LinearProgress, TextField, Select, MenuItem, FormControl, InputLabel
} from '@mui/material';
import { Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import individualsService from '../services/individualsService';
import authService from '../services/authService';

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other} style={{ paddingTop: '20px' }}>
      {value === index && children}
    </div>
  );
}

export default function IndividualDetailsDialog({ open, onClose, person }) {
  const [tab, setTab] = useState(0);

  // States for each section
  const [reviews, setReviews] = useState([]);
  const [plans, setPlans] = useState([]);
  const [competencies, setCompetencies] = useState([]);
  const [trainings, setTrainings] = useState([]);
  const [loading, setLoading] = useState(false);

  // Form states
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (open && person) {
      loadData();
    }
  }, [open, person]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [revs, pls, comps, trns] = await Promise.all([
        individualsService.getRecords(person.id, 'reviews'),
        individualsService.getRecords(person.id, 'plans'),
        individualsService.getRecords(person.id, 'competencies'),
        individualsService.getRecords(person.id, 'trainings')
      ]);
      setReviews(revs || []);
      setPlans(pls || []);
      setCompetencies(comps || []);
      setTrainings(trns || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (type) => {
    try {
      await individualsService.createRecord(person.id, type, formData);
      setShowForm(false);
      setFormData({});
      loadData();
    } catch (err) {
      console.error("Create failed", err);
    }
  };

  const handleDelete = async (type, recordId) => {
    try {
      await individualsService.deleteRecord(person.id, type, recordId);
      loadData();
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  const canEdit = authService.canCreate();

  if (!person) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ fontWeight: 800, borderBottom: '1px solid #E8E8E3' }}>
        {person.first_name} {person.last_name}'s Profile Dashboard
      </DialogTitle>
      
      <DialogContent sx={{ p: 0 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 3, pt: 2 }}>
          <Tabs value={tab} onChange={(e, v) => { setTab(v); setShowForm(false); }}>
            <Tab label="Performance" />
            <Tab label="Dev Plans" />
            <Tab label="Competencies" />
            <Tab label="Training" />
          </Tabs>
        </Box>

        {loading ? (
          <LinearProgress aria-label="Fetching data..." sx={{ mx: 3, my: 6 }} />
        ) : (
          <Box sx={{ px: 3, pb: 4, minHeight: '400px' }}>
            
            {/* PERFORMANCE REVIEWS */}
            <TabPanel value={tab} index={0}>
              {canEdit && (
                <Button variant="outlined" startIcon={<AddIcon />} onClick={() => setShowForm(!showForm)} sx={{ mb: 2 }}>
                  Add Review
                </Button>
              )}
              {showForm && (
                 <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                    <TextField size="small" type="date" label="Date" InputLabelProps={{ shrink: true }} value={formData.review_date || ''} onChange={(e) => setFormData({...formData, review_date: e.target.value})} />
                    <TextField size="small" type="number" label="Rating (1-5)" value={formData.rating || ''} onChange={(e) => setFormData({...formData, rating: parseInt(e.target.value)})} />
                    <TextField size="small" fullWidth label="Comments" value={formData.comments || ''} onChange={(e) => setFormData({...formData, comments: e.target.value})} />
                    <Button variant="contained" onClick={() => handleCreate('reviews')}>Confirm</Button>
                 </Box>
              )}
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead><TableRow><TableCell>Date</TableCell><TableCell>Rating</TableCell><TableCell>Comments</TableCell><TableCell></TableCell></TableRow></TableHead>
                  <TableBody>
                    {reviews.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell>{r.review_date}</TableCell>
                        <TableCell>{r.rating} / 5</TableCell>
                        <TableCell>{r.comments}</TableCell>
                        <TableCell align="right">
                          {canEdit && <IconButton size="small" onClick={() => handleDelete('reviews', r.id)}><DeleteIcon fontSize="small" /></IconButton>}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </TabPanel>

            {/* DEVELOPMENT PLANS */}
            <TabPanel value={tab} index={1}>
              {canEdit && (
                <Button variant="outlined" startIcon={<AddIcon />} onClick={() => setShowForm(!showForm)} sx={{ mb: 2 }}>
                  Add Plan
                </Button>
              )}
              {showForm && (
                 <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                    <TextField size="small" label="Title" value={formData.title || ''} onChange={(e) => setFormData({...formData, title: e.target.value})} />
                    <TextField size="small" fullWidth label="Description" value={formData.description || ''} onChange={(e) => setFormData({...formData, description: e.target.value})} />
                    <FormControl size="small" sx={{ minWidth: 120 }}>
                      <InputLabel>Status</InputLabel>
                      <Select label="Status" value={formData.status || 'Not Started'} onChange={(e) => setFormData({...formData, status: e.target.value})}>
                        <MenuItem value="Not Started">Not Started</MenuItem>
                        <MenuItem value="In Progress">In Progress</MenuItem>
                        <MenuItem value="Completed">Completed</MenuItem>
                      </Select>
                    </FormControl>
                    <TextField size="small" type="date" label="Target Date" InputLabelProps={{ shrink: true }} value={formData.target_date || ''} onChange={(e) => setFormData({...formData, target_date: e.target.value})} />
                    <Button variant="contained" onClick={() => handleCreate('plans')}>Confirm</Button>
                 </Box>
              )}
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead><TableRow><TableCell>Title</TableCell><TableCell>Status</TableCell><TableCell>Target Date</TableCell><TableCell></TableCell></TableRow></TableHead>
                  <TableBody>
                    {plans.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell><Typography fontWeight={600}>{p.title}</Typography><Typography variant="body2">{p.description}</Typography></TableCell>
                        <TableCell>{p.status}</TableCell>
                        <TableCell>{p.target_date || '—'}</TableCell>
                        <TableCell align="right">
                          {canEdit && <IconButton size="small" onClick={() => handleDelete('plans', p.id)}><DeleteIcon fontSize="small" /></IconButton>}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </TabPanel>

            {/* COMPETENCIES */}
            <TabPanel value={tab} index={2}>
              {canEdit && (
                <Button variant="outlined" startIcon={<AddIcon />} onClick={() => setShowForm(!showForm)} sx={{ mb: 2 }}>
                  Add Competency
                </Button>
              )}
              {showForm && (
                 <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                    <TextField size="small" fullWidth label="Skill Name" value={formData.skill_name || ''} onChange={(e) => setFormData({...formData, skill_name: e.target.value})} />
                    <FormControl size="small" fullWidth>
                      <InputLabel>Level</InputLabel>
                      <Select label="Level" value={formData.proficiency_level || 'Beginner'} onChange={(e) => setFormData({...formData, proficiency_level: e.target.value})}>
                        <MenuItem value="Beginner">Beginner</MenuItem>
                        <MenuItem value="Intermediate">Intermediate</MenuItem>
                        <MenuItem value="Advanced">Advanced</MenuItem>
                        <MenuItem value="Expert">Expert</MenuItem>
                      </Select>
                    </FormControl>
                    <Button variant="contained" onClick={() => handleCreate('competencies')}>Confirm</Button>
                 </Box>
              )}
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead><TableRow><TableCell>Skill Name</TableCell><TableCell>Proficiency Level</TableCell><TableCell></TableCell></TableRow></TableHead>
                  <TableBody>
                    {competencies.map((c) => (
                      <TableRow key={c.id}>
                        <TableCell>{c.skill_name}</TableCell>
                        <TableCell>{c.proficiency_level}</TableCell>
                        <TableCell align="right">
                          {canEdit && <IconButton size="small" onClick={() => handleDelete('competencies', c.id)}><DeleteIcon fontSize="small" /></IconButton>}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </TabPanel>

            {/* TRAINING RECORDS */}
            <TabPanel value={tab} index={3}>
              {canEdit && (
                <Button variant="outlined" startIcon={<AddIcon />} onClick={() => setShowForm(!showForm)} sx={{ mb: 2 }}>
                  Add Training
                </Button>
              )}
              {showForm && (
                 <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                    <TextField size="small" fullWidth label="Course Name" value={formData.course_name || ''} onChange={(e) => setFormData({...formData, course_name: e.target.value})} />
                    <TextField size="small" type="date" label="Completed" InputLabelProps={{ shrink: true }} value={formData.completion_date || ''} onChange={(e) => setFormData({...formData, completion_date: e.target.value})} />
                    <Button variant="contained" onClick={() => handleCreate('trainings')}>Confirm</Button>
                 </Box>
              )}
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead><TableRow><TableCell>Course</TableCell><TableCell>Completed On</TableCell><TableCell></TableCell></TableRow></TableHead>
                  <TableBody>
                    {trainings.map((t) => (
                      <TableRow key={t.id}>
                        <TableCell>{t.course_name}</TableCell>
                        <TableCell>{t.completion_date || '—'}</TableCell>
                        <TableCell align="right">
                          {canEdit && <IconButton size="small" onClick={() => handleDelete('trainings', t.id)}><DeleteIcon fontSize="small" /></IconButton>}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </TabPanel>

          </Box>
        )}
      </DialogContent>
      <Box sx={{ p: 2, borderTop: '1px solid #E8E8E3', textAlign: 'right' }}>
        <Button onClick={onClose} variant="contained" color="inherit" sx={{ bgcolor: '#F0FDFA', color: '#0F766E' }}>Close Dashboard</Button>
      </Box>
    </Dialog>
  );
}
