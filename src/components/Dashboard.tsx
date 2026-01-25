import React from 'react';
import { Box, Paper, Typography, Grid, IconButton, ButtonGroup, Chip, Button, Stack, Avatar } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import PenaltyShootout from './PenaltyTracker';
import { green, red, grey } from '@mui/material/colors';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';

interface DashboardProps {
  team1Score: number;
  team2Score: number;
  onTeam1ScoreChange: (delta: number) => void;
  onTeam2ScoreChange: (delta: number) => void;
  team1Series: boolean[];
  team2Series: boolean[];
  currentTeam: 'team1' | 'team2';
  onResetGame: () => void;
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
}) => {
  const team1ShotStatuses = team1Series.map((value, _) => value === true ? 'goal' : 'miss');
  const team2ShotStatuses = team2Series.map((value, _) => value === true ? 'goal' : 'miss');
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
          label={`Pytanie dla: ${currentTeam !== 'team1' ? 'Team Ewela' : 'Team Kasia'}`} 
          color="default" 
          sx={{ 
            backgroundColor: currentTeam === 'team1' ? '#ff9436' : '#800080',
            color: 'white',
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
            backgroundColor: '#FFA64D',
            color: '#1565c0',
            border: currentTeam === 'team1' ? '3px solid #ffff00' : 'none',
            boxShadow: currentTeam === 'team1' ? 6 : 3,
          }}
        >
          <Typography variant="h5" gutterBottom sx={{ color: 'white', fontWeight: 'bold' }}>
            Team Kasia
          </Typography>
          <Typography variant="h2" fontWeight="bold" sx={{ mb: 2, color: 'white' }}>
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
            backgroundColor: '#A040A0',
            color: '#c62828',
            border: currentTeam === 'team2' ? '3px solid #ffff00' : 'none',
            boxShadow: currentTeam === 'team2' ? 6 : 3,
          }}
        >
          <Typography variant="h5" gutterBottom sx={{ color: 'white', fontWeight: 'bold' }}>
            Team Ewela
          </Typography>
          <Typography variant="h2" fontWeight="bold" sx={{ mb: 2, color: 'white' }}>
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
