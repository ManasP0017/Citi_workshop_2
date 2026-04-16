import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box, Typography, Grid, Paper, CircularProgress,
  Chip, List, ListItem, ListItemText, Card, CardContent, Avatar,
  LinearProgress, Rating, Skeleton, Tooltip as MuiTooltip,
} from '@mui/material';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, PieChart, Pie, Legend,
} from 'recharts';
import {
  Groups as TeamsIcon,
  People as PeopleIcon,
  EmojiEvents as TrophyIcon,
  TrendingUp as TrendingIcon,
  Psychology as SkillsIcon,
  Assignment as PlanIcon,
} from '@mui/icons-material';

import teamsService from '../services/teamsService';
import individualsService from '../services/individualsService';
import achievementsService from '../services/achievementsService';
import authService from '../services/authService';

// Static constant — no reason to recreate per render
const PROF_MAP = { 'Beginner': 1, 'Intermediate': 2, 'Advanced': 3, 'Expert': 4 };

const StatCard = ({ title, value, icon, gradient, loading, onClick, subtitle }) => {
  const handleKeyDown = (e) => {
    if (onClick && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <Card
      onClick={onClick}
      onKeyDown={handleKeyDown}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-label={onClick ? `${title}: ${value}` : undefined}
      sx={{
        borderRadius: 3, transition: 'all 0.3s',
        cursor: onClick ? 'pointer' : 'default',
        '&:hover': onClick ? { transform: 'translateY(-4px)', boxShadow: '0 12px 24px rgba(0,0,0,0.1)' } : {},
        bgcolor: 'background.paper',
        outline: 'none',
        '&:focus-visible': { boxShadow: '0 0 0 3px rgba(15,118,110,0.4)' },
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, fontWeight: 500 }}>
              {title}
            </Typography>
            {loading ? (
              <Skeleton width={60} height={42} />
            ) : (
              <Typography variant="h4" sx={{ fontWeight: 800, background: gradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                {value}
              </Typography>
            )}
            {subtitle && (
              <Typography variant="caption" color="text.secondary">{subtitle}</Typography>
            )}
          </Box>
          <Avatar sx={{ width: 48, height: 48, borderRadius: '12px', background: gradient, boxShadow: '0 4px 14px rgba(0,0,0,0.12)' }}>
            {icon}
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  );
};

const InsightRow = ({ label, value, chipBg, chipColor }) => (
  <Paper variant="outlined" sx={{ p: 2, borderRadius: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#F8F7F4' }}>
    <Typography fontWeight={600} color="text.secondary">{label}</Typography>
    <Chip label={value} size="small" sx={{ fontWeight: 800, bgcolor: chipBg, color: chipColor }} />
  </Paper>
);

const WinVelocityChart = ({ data, loading }) => {
  if (loading) return <Skeleton height={300} sx={{ borderRadius: 3, mt: 2 }} />;
  if (!data || data.length === 0) return null;

  return (
    <Box sx={{ height: 300, width: '100%', mt: 2 }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorWin" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0F766E" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#0F766E" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
          <XAxis 
            dataKey="date" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#94A3B8', fontSize: 10 }} 
            dy={10}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#94A3B8', fontSize: 10 }}
          />
          <Tooltip 
            contentStyle={{ 
              borderRadius: '12px', 
              border: 'none', 
              boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
              fontSize: '12px',
              fontWeight: 600
            }} 
          />
          <Area 
            type="monotone" 
            dataKey="wins" 
            stroke="#0F766E" 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorWin)" 
            animationDuration={1500}
          />
        </AreaChart>
      </ResponsiveContainer>
    </Box>
  );
};

const SquadRankingChart = ({ data, loading }) => {
  if (loading) return <Skeleton height={250} sx={{ borderRadius: 3, mt: 2 }} />;
  if (!data || data.length === 0) return null;

  return (
    <Box sx={{ height: 250, width: '100%', mt: 2 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F1F5F9" />
          <XAxis type="number" hide />
          <YAxis 
            dataKey="name" 
            type="category" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#475569', fontSize: 11, fontWeight: 600 }}
            width={80}
          />
          <Tooltip 
            cursor={{ fill: 'transparent' }}
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
          />
          <Bar dataKey="members" radius={[0, 4, 4, 0]} barSize={20} animationDuration={1000}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#6366F1' : '#0F766E'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
};

const RoleMixChart = ({ data, loading }) => {
  if (loading) return <Skeleton variant="circular" width={200} height={200} sx={{ mx: 'auto', mt: 2 }} />;
  if (!data || data.length === 0) return null;

  return (
    <Box sx={{ height: 220, width: '100%', mt: 2 }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
            animationDuration={1200}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} 
          />
          <Legend iconType="circle" verticalAlign="bottom" height={36}/>
        </PieChart>
      </ResponsiveContainer>
    </Box>
  );
};

function EmployeeDashboard({ myIndividual, loading: parentLoading }) {
  const [competencies, setCompetencies] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (myIndividual) {
      Promise.all([
        individualsService.getRecords(myIndividual.id, 'competencies').catch(() => []),
        individualsService.getRecords(myIndividual.id, 'plans').catch(() => []),
      ]).then(([c, p]) => {
        setCompetencies(c || []);
        setPlans(p || []);
      }).catch(() => {
        // Fallback if .then itself throws
        setCompetencies([]);
        setPlans([]);
      }).finally(() => {
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, [myIndividual]);

  const completedPlans = plans.filter(p => p.status === 'Completed').length;
  const overallProgress = plans.length > 0 ? Math.round((completedPlans / plans.length) * 100) : 0;

  const isLoading = loading || parentLoading;

  return (
    <>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={6}>
          <StatCard title="My Competencies" value={competencies.length} loading={isLoading}
            icon={<SkillsIcon />} gradient="#0F766E" />
        </Grid>
        <Grid item xs={12} sm={6} md={6}>
          <StatCard title="Dev Plan Progress" value={`${overallProgress}%`} loading={isLoading}
            icon={<PlanIcon />} gradient="#6366F1"
            subtitle={`${completedPlans}/${plans.length} plans done`} />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ borderRadius: 3, p: 3, height: '100%' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <SkillsIcon sx={{ color: 'primary.main' }} /> My Competencies Map
            </Typography>
            {isLoading ? (
              [1, 2, 3].map(i => <Skeleton key={i} height={50} sx={{ mb: 1, borderRadius: 2 }} />)
            ) : competencies.length > 0 ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {competencies.map(c => (
                  <Box key={c.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1.5, borderRadius: 2, bgcolor: '#F8F7F4' }}>
                    <Typography variant="body2" fontWeight={600}>{c.skill_name}</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="caption" color="text.secondary">{c.proficiency_level}</Typography>
                      <Rating
                        value={PROF_MAP[c.proficiency_level] || 1}
                        max={4}
                        readOnly
                        size="small"
                        aria-label={`${c.skill_name} proficiency: ${c.proficiency_level}`}
                      />
                    </Box>
                  </Box>
                ))}
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                No competencies mapped yet — check back soon.
              </Typography>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ borderRadius: 3, p: 3, height: '100%' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <PlanIcon sx={{ color: 'secondary.main' }} /> Active Development Plans
            </Typography>
            {isLoading ? (
              [1, 2, 3].map(i => <Skeleton key={i} height={60} sx={{ mb: 1, borderRadius: 2 }} />)
            ) : plans.length > 0 ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {plans.map(p => (
                  <Box key={p.id} sx={{ p: 2, borderRadius: 2, bgcolor: '#F8F7F4', border: '1px solid #E8E8E3' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="subtitle2" fontWeight={600}>{p.title}</Typography>
                      <Chip label={p.status} size="small"
                        sx={{
                          height: 20, fontSize: '0.65rem', fontWeight: 600,
                          bgcolor: p.status === 'Completed' ? '#CCFBF1' : '#EEF2FF',
                          color: p.status === 'Completed' ? '#0F766E' : '#4338CA',
                        }} />
                    </Box>
                    <LinearProgress variant="determinate"
                      value={p.status === 'Completed' ? 100 : p.status === 'In Progress' ? 50 : 0}
                      aria-label={`${p.title} progress`}
                      sx={{ height: 6, borderRadius: 3, bgcolor: '#E8E8E3' }} />
                  </Box>
                ))}
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                No active plans right now — reach out to your lead!
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </>
  );
}

function AdminDashboard({ teams, individuals, achievements, loading }) {
  const insights = useMemo(() => ({
    teamsWithLeaders: teams.filter(t => t.leader_id).length,
    activeTeams: teams.filter(t => individuals.some(i => i.team_id === t.id)).length,
    unassignedIndividuals: individuals.filter(i => !i.team_id).length,
  }), [teams, individuals]);

  const insightRows = useMemo(() => [
    { label: 'Teams with assigned leaders', value: insights.teamsWithLeaders, chipBg: '#CCFBF1', chipColor: '#0F766E' },
    { label: 'Active teams (with members)', value: insights.activeTeams, chipBg: '#EEF2FF', chipColor: '#6366F1' },
    { label: 'Unassigned Individuals (No Team)', value: insights.unassignedIndividuals, chipBg: '#FEF3C7', chipColor: '#D97706' },
  ], [insights]);

  const recentAwards = useMemo(() => (achievements || []).slice(0, 5), [achievements]);

  // Transform achievements for "Win Velocity" (Last 14 days)
  const velocityData = useMemo(() => {
    if (!achievements) return [];
    const counts = {};
    const last14Days = Array.from({ length: 14 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split('T')[0];
    }).reverse();

    last14Days.forEach(date => { counts[date] = 0; });
    achievements.forEach(a => {
      const date = a.achievement_date;
      if (counts[date] !== undefined) counts[date]++;
    });

    return last14Days.map(date => ({
      date: date.split('-').slice(1).join('/'), // MM/DD
      wins: counts[date]
    }));
  }, [achievements]);

  const squadData = useMemo(() => {
    return teams.map(t => ({
      name: t.name.length > 12 ? t.name.substring(0, 10) + '..' : t.name,
      members: individuals.filter(i => i.team_id === t.id).length
    })).sort((a, b) => b.members - a.members).slice(0, 6);
  }, [teams, individuals]);

  // Transform roles for "Member Mix"
  const roleData = useMemo(() => {
    const counts = { admin: 0, manager: 0, contributor: 0, viewer: 0 };
    individuals.forEach(i => {
      const r = i.role?.toLowerCase() || 'viewer';
      if (counts[r] !== undefined) counts[r]++;
    });
    return [
      { name: 'Admins', value: counts.admin, color: '#0F766E' },
      { name: 'Managers', value: counts.manager, color: '#6366F1' },
      { name: 'Contributors', value: counts.contributor, color: '#0EA5E9' },
      { name: 'Viewers', value: counts.viewer, color: '#94A3B8' },
    ].filter(d => d.value > 0);
  }, [individuals]);

  return (
    <>
      {/* STATS CARDS */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4} md={4}>
          <StatCard title="Total Members" value={individuals.length} loading={loading}
            icon={<PeopleIcon />} gradient="linear-gradient(135deg, #0F766E, #14B8A6)" />
        </Grid>
        <Grid item xs={12} sm={4} md={4}>
          <StatCard title="Total Squads" value={teams.length} loading={loading}
            icon={<TeamsIcon />} gradient="linear-gradient(135deg, #6366F1, #818CF8)" />
        </Grid>
        <Grid item xs={12} sm={4} md={4}>
          <StatCard title="Wins Recorded" value={achievements.length} loading={loading}
            icon={<TrophyIcon />} gradient="linear-gradient(135deg, #0F766E, #6366F1)" />
        </Grid>
      </Grid>

      {/* CHARTS ROW */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12}>
          <Paper sx={{ p: 4, borderRadius: 3, border: '1px solid #E8E8E3' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
              <Box>
                <Typography variant="h6" fontWeight={800} color="#1E293B">
                  Win Velocity
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Organization activity over the last 14 days
                </Typography>
              </Box>
              <Chip label="Live Trends" size="small" icon={<TrendingIcon fontSize="small" />} sx={{ bgcolor: '#F0FDFA', color: '#0F766E', fontWeight: 700 }} />
            </Box>
            <WinVelocityChart data={velocityData} loading={loading} />
          </Paper>
        </Grid>
      </Grid>

      {/* SECONDARY ROW */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={7}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, height: '100%' }}>
            {/* Squad Distribution */}
            <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid #E8E8E3' }}>
              <Typography variant="h6" fontWeight={800} sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1, color: '#1E293B' }}>
                <TeamsIcon sx={{ color: '#6366F1' }} /> Squad Strength
              </Typography>
              <SquadRankingChart data={squadData} loading={loading} />
            </Paper>

            {/* Highlights */}
            <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid #E8E8E3', flex: 1 }}>
              <Typography variant="h6" fontWeight={800} sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1, color: '#1E293B' }}>
                <TrendingIcon color="primary" /> Strategic Insights
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {loading ? (
                      [1, 2, 3].map(i => <Skeleton key={i} height={52} sx={{ borderRadius: 3 }} />)
                    ) : (
                      insightRows.map(row => <InsightRow key={row.label} {...row} />)
                    )}
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <RoleMixChart data={roleData} loading={loading} />
                </Grid>
              </Grid>
            </Paper>
          </Box>
        </Grid>

        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid #E8E8E3', height: '100%' }}>
            <Typography variant="h6" fontWeight={800} sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1, color: '#1E293B' }}>
              <TrophyIcon sx={{ color: '#0F766E' }} /> Latest Wins
            </Typography>
            {loading ? (
              [1, 2, 3].map(i => <Skeleton key={i} height={60} sx={{ mb: 1, borderRadius: 2 }} />)
            ) : recentAwards.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                Nothing recorded yet — start recognizing your squad!
              </Typography>
            ) : (
              <List dense sx={{ p: 0 }}>
                {recentAwards.map((a) => (
                  <ListItem key={a.id} sx={{ px: 0, py: 1.5, borderBottom: '1px solid #F1F5F9' }}>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', width: '100%' }}>
                      <Box sx={{ bgcolor: '#CCFBF1', color: '#0F766E', p: 1.5, borderRadius: '12px' }}>
                        <TrophyIcon fontSize="small" />
                      </Box>
                      <Box flex={1}>
                        <Typography fontWeight={700} color="#1E293B">{a.title}</Typography>
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mt: 0.5 }}>
                          <Chip size="small" label={a.description && a.description.toLowerCase().includes('year') ? 'yearly' : 'one-time'} sx={{ height: 20, fontSize: '0.65rem', bgcolor: '#EEF2FF', color: '#4338CA', fontWeight: 600 }} />
                          <Typography variant="caption" color="text.secondary" fontWeight={500}>
                            {a.achievement_date}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>
        </Grid>
      </Grid>
    </>
  );
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [teams, setTeams] = useState([]);
  const [individuals, setIndividuals] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [myIndividual, setMyIndividual] = useState(null);

  const user = authService.getUser();
  const role = user?.role || 'viewer';

  const loadData = useCallback(async () => {
    try {
      const [t, i, a] = await Promise.all([
        teamsService.getAll().catch(() => []),
        individualsService.getAll().catch(() => []),
        achievementsService.getAll().catch(() => []),
      ]);
      setTeams(t);
      setIndividuals(i);
      setAchievements(a);

      // Find my individual profile based on email/username mapping
      if (role === 'contributor' || role === 'viewer' || role === 'manager') {
        const myProfile = i.find(ind => ind.email === user?.username || ind.email === user?.email);
        setMyIndividual(myProfile || null);
      }
    } catch {
      console.error('Dashboard load failed');
    } finally {
      setLoading(false);
    }
  }, [role, user?.username, user?.email]);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, [loadData]);

  const dashboardTitle = role === 'admin' ? 'Organization Overview' : 'My Dashboard';

  return (
    <Box className="page-fade-in" sx={{ bgcolor: '#F8F7F4', minHeight: '100%' }}>
      <Paper sx={{ mb: 4, p: 3, borderRadius: 3, borderLeft: '6px solid #0F766E' }}>
        <Typography variant="h5" fontWeight={800}>
          Good to see you, {user?.username || 'User'} 👋
        </Typography>
        <Typography color="text.secondary">
          {dashboardTitle}
        </Typography>
      </Paper>

      {loading ? (
        <Box sx={{ p: 2 }} aria-label="Loading dashboard">
          <LinearProgress aria-label="Fetching data..." />
        </Box>
      ) : role === 'admin' ? (
        <AdminDashboard teams={teams} individuals={individuals} achievements={achievements} loading={loading} />
      ) : (
        <>
          <EmployeeDashboard myIndividual={myIndividual} loading={loading} />
          {role === 'manager' && (
            <Box sx={{ mt: 6 }}>
               <Typography variant="h5" fontWeight={800} sx={{ mb: 3 }}>Squad Structure Highlights</Typography>
               <AdminDashboard teams={teams} individuals={individuals} achievements={achievements} loading={loading} />
            </Box>
          )}
        </>
      )}
    </Box>
  );
}
