import React, { useState } from 'react';
import { Box, Paper, Typography, Grid, IconButton, ButtonGroup, Chip, Button, Stack, Avatar, TextField } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import PenaltyShootout from './PenaltyTracker';
import { green, red, grey } from '@mui/material/colors';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';

interface DashboardProps {
  team1Score: number;
  team2Score: number;
  onTeam1ScoreChange: (delta: number) => void;
  onTeam2ScoreChange: (delta: number) => void;
  team1Series: boolean[];
  team2Series: boolean[];
  currentTeam: 'team1' | 'team2';
  onResetGame: () => void;
  team1Name: string;
  team2Name: string;
  onTeam1NameChange: (name: string) => void;
  onTeam2NameChange: (name: string) => void;
}

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
  team1Score,
  team2Score,
  onTeam1ScoreChange,
  onTeam2ScoreChange,
  team1Series,
  team2Series,
  currentTeam,
  onResetGame,
  team1Name,
  team2Name,
  onTeam1NameChange,
  onTeam2NameChange,
}) => {
  const team1ShotStatuses = team1Series.map((value, _) => value === true ? 'goal' : 'miss');
  const team2ShotStatuses = team2Series.map((value, _) => value === true ? 'goal' : 'miss');

  const [editingTeam, setEditingTeam] = useState<'team1' | 'team2' | null>(null);
  const [draftName, setDraftName] = useState('');

  const startEdit = (team: 'team1' | 'team2', currentName: string) => {
    setEditingTeam(team);
    setDraftName(currentName);
  };

  const cancelEdit = () => setEditingTeam(null);

  const commitEdit = (onChange: (name: string) => void) => {
    const trimmed = draftName.trim();
    if (trimmed) {
      onChange(trimmed);
    }
    setEditingTeam(null);
  };

  const renderTeamName = (
    team: 'team1' | 'team2',
    name: string,
    color: string,
    onChange: (name: string) => void
  ) => (
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
      {editingTeam === team ? (
        <>
          <TextField
            value={draftName}
            onChange={(e) => setDraftName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commitEdit(onChange);
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
            onClick={() => commitEdit(onChange)}
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
            onClick={() => startEdit(team, name)}
            sx={{ color }}
            aria-label="Edytuj nazwę drużyny"
          >
            <EditIcon fontSize="small" />
          </IconButton>
        </>
      )}
    </Box>
  );

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
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2, mb: 2}}>
        <Chip 
          label={`Pytanie dla: ${currentTeam !== 'team1' ? team2Name : team1Name}`} 
          color="default" 
          sx={{ 
            backgroundColor: currentTeam === 'team1' ? '#81d4fa' : '#a5d6a7',
            color: currentTeam === 'team1' ? '#01579b' : '#1b5e20',
            border: '2px solid #ff9800',
            fontSize: '1rem',
            fontWeight: 600,
          }} 
        />
      </Box>
      <Grid container spacing={3} sx={{ mb: 4 }}>
      <Grid item xs={6}>
        <Paper
          elevation={3}
          sx={{
            p: 3,
            textAlign: 'center',
            backgroundColor: '#81d4fa',
            color: '#01579b',
            border: currentTeam === 'team1' ? '4px solid #ff9800' : '4px solid transparent',
            boxShadow: currentTeam === 'team1' ? 6 : 3,
          }}
        >
          {renderTeamName('team1', team1Name, '#01579b', onTeam1NameChange)}
          <Typography variant="h2" fontWeight="bold" sx={{ mb: 2, color: '#01579b' }}>
            {team1Score}
          </Typography>
          <Stack direction="row" spacing={1.5} justifyContent="center" alignItems="center">
              {team1ShotStatuses.map((val, idx) => renderShotIcon(val, idx))}
          </Stack>
          {/* <ButtonGroup variant="contained" sx={{ backgroundColor: 'rgba(21, 101, 192, 0.2)' }}>
            <IconButton
              onClick={() => onTeam1ScoreChange(-1)}
              sx={{ color: '#1565c0' }}
              size="small"
            >
              <RemoveIcon />
            </IconButton>
            <IconButton
              onClick={() => onTeam1ScoreChange(1)}
              sx={{ color: '#1565c0' }}
              size="small"
            >
              <AddIcon />
            </IconButton>
          </ButtonGroup> */}
        </Paper>
      </Grid>
      <Grid item xs={6}>
        <Paper
          elevation={3}
          sx={{
            p: 3,
            textAlign: 'center',
            backgroundColor: '#a5d6a7',
            color: '#1b5e20',
            border: currentTeam === 'team2' ? '4px solid #ff9800' : '4px solid transparent',
            boxShadow: currentTeam === 'team2' ? 6 : 3,
          }}
        >
          {renderTeamName('team2', team2Name, '#1b5e20', onTeam2NameChange)}
          <Typography variant="h2" fontWeight="bold" sx={{ mb: 2, color: '#1b5e20' }}>
            {team2Score}
          </Typography>
          <Stack direction="row" spacing={1.5} justifyContent="center" alignItems="center">
              {team2ShotStatuses.map((val, idx) => renderShotIcon(val, idx))}
          </Stack>
          {/* <ButtonGroup variant="contained" sx={{ backgroundColor: 'rgba(198, 40, 40, 0.2)' }}>
            <IconButton
              onClick={() => onTeam2ScoreChange(-1)}
              sx={{ color: '#c62828' }}
              size="small"
            >
              <RemoveIcon />
            </IconButton>
            <IconButton
              onClick={() => onTeam2ScoreChange(1)}
              sx={{ color: '#c62828' }}
              size="small"
            >
              <AddIcon />
            </IconButton>
          </ButtonGroup> */}
        </Paper>
      </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
