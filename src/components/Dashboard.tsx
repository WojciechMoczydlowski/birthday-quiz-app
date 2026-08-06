import React, { useState } from 'react';
import { Box, Paper, Typography, Grid, IconButton, Chip, Button, Stack, Avatar, TextField } from '@mui/material';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import { green, red, grey } from '@mui/material/colors';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';

interface TeamView {
  name: string;
  score: number;
  series: boolean[];
}

interface DashboardProps {
  teams: TeamView[];
  currentTeamIndex: number;
  onResetGame: () => void;
  onTeamNameChange: (index: number, name: string) => void;
}

// Light card colors (with a matching dark text color) per team. Cycles if there
// are more teams than palette entries. The active team is marked with an orange
// border, so orange is intentionally avoided here.
const teamColors = [
  { bg: '#81d4fa', text: '#01579b' }, // light blue
  { bg: '#a5d6a7', text: '#1b5e20' }, // light green
  { bg: '#ce93d8', text: '#4a148c' }, // light purple
  { bg: '#fff59d', text: '#f57f17' }, // light yellow
  { bg: '#ef9a9a', text: '#b71c1c' }, // light red
];

const ACTIVE_BORDER = '#ff9800';

const colorFor = (index: number) => teamColors[index % teamColors.length];

type ShotStatus = 'goal' | 'miss' | null;

const renderShotIcon = (status: ShotStatus, index: number) => {
  let bgColor: string = grey[200];
  let icon = <Typography variant="caption" color="text.secondary">{index + 1}</Typography>;

  if (status === 'goal') {
    bgColor = green[600];
    icon = <CheckIcon sx={{ fontSize: 18, color: 'white' }} />;
  } else if (status === 'miss') {
    bgColor = red[600];
    icon = <CloseIcon sx={{ fontSize: 18, color: 'white' }} />;
  }

  return (
    <Avatar
      key={index}
      sx={{
        width: 36,
        height: 36,
        bgcolor: bgColor,
        border: '1px solid',
        borderColor: status ? 'transparent' : grey[400],
        transition: 'all 0.3s ease',
      }}
    >
      {icon}
    </Avatar>
  );
};

const Dashboard: React.FC<DashboardProps> = ({
  teams,
  currentTeamIndex,
  onResetGame,
  onTeamNameChange,
}) => {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [draftName, setDraftName] = useState('');

  const startEdit = (index: number, currentName: string) => {
    setEditingIndex(index);
    setDraftName(currentName);
  };

  const cancelEdit = () => setEditingIndex(null);

  const commitEdit = (index: number) => {
    const trimmed = draftName.trim();
    if (trimmed) {
      onTeamNameChange(index, trimmed);
    }
    setEditingIndex(null);
  };

  const renderTeamName = (index: number, name: string, color: string) => (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 0.5,
        mb: 1,
        minHeight: 40,
      }}
    >
      {editingIndex === index ? (
        <>
          <TextField
            value={draftName}
            onChange={(e) => setDraftName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commitEdit(index);
              if (e.key === 'Escape') cancelEdit();
            }}
            autoFocus
            variant="standard"
            inputProps={{ 'aria-label': 'Nazwa drużyny', maxLength: 40 }}
            sx={{
              '& .MuiInputBase-input': {
                color,
                fontWeight: 'bold',
                textAlign: 'center',
                fontSize: '1.5rem',
              },
              '& .MuiInput-underline:before': { borderBottomColor: color },
              '& .MuiInput-underline:after': { borderBottomColor: color },
            }}
          />
          <IconButton
            size="small"
            onClick={() => commitEdit(index)}
            sx={{ color }}
            aria-label="Zapisz nazwę drużyny"
          >
            <CheckIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            onClick={cancelEdit}
            sx={{ color }}
            aria-label="Anuluj edycję nazwy"
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </>
      ) : (
        <>
          <Typography variant="h5" sx={{ color, fontWeight: 'bold' }}>
            {name}
          </Typography>
          <IconButton
            size="small"
            onClick={() => startEdit(index, name)}
            sx={{ color }}
            aria-label="Edytuj nazwę drużyny"
          >
            <EditIcon fontSize="small" />
          </IconButton>
        </>
      )}
    </Box>
  );

  // Distribute the 12-column grid evenly across the teams (min 1 col wide).
  const colSize = Math.max(1, Math.floor(12 / Math.max(1, teams.length)));
  const activeColor = colorFor(currentTeamIndex);
  const activeName = teams[currentTeamIndex]?.name ?? '';

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button
          variant="outlined"
          color="error"
          startIcon={<RestartAltIcon />}
          onClick={onResetGame}
          size="small"
        >
          Reset Game
        </Button>
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2, mb: 2 }}>
        <Chip
          label={`Pytanie dla: ${activeName}`}
          color="default"
          sx={{
            backgroundColor: activeColor.bg,
            color: activeColor.text,
            border: `2px solid ${ACTIVE_BORDER}`,
            fontSize: '1rem',
            fontWeight: 600,
          }}
        />
      </Box>
      <Grid container spacing={3} sx={{ mb: 4 }} justifyContent="center">
        {teams.map((team, index) => {
          const colors = colorFor(index);
          const isActive = index === currentTeamIndex;
          const shotStatuses: ShotStatus[] = team.series.map((v) =>
            v === true ? 'goal' : 'miss'
          );
          return (
            <Grid item xs={12} sm={colSize} key={index}>
              <Paper
                elevation={3}
                sx={{
                  p: 3,
                  textAlign: 'center',
                  backgroundColor: colors.bg,
                  color: colors.text,
                  border: isActive
                    ? `4px solid ${ACTIVE_BORDER}`
                    : '4px solid transparent',
                  boxShadow: isActive ? 6 : 3,
                }}
              >
                {renderTeamName(index, team.name, colors.text)}
                <Typography variant="h2" fontWeight="bold" sx={{ mb: 2, color: colors.text }}>
                  {team.score}
                </Typography>
                <Stack direction="row" spacing={1.5} justifyContent="center" alignItems="center">
                  {shotStatuses.map((val, idx) => renderShotIcon(val, idx))}
                </Stack>
              </Paper>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};

export default Dashboard;
