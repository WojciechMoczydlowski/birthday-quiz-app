import React, { useState } from 'react';
import { Box, Typography, Stack, Avatar, Paper, Button, Divider } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import { green, red, grey } from '@mui/material/colors';

// Define types for the shot outcomes
type ShotStatus = 'goal' | 'miss' | null;

interface TeamState {
  name: string;
  shots: ShotStatus[];
}

const PenaltyShootout: React.FC = () => {
  // Initialize two teams with 5 empty slots
  const [teamA, setTeamA] = useState<TeamState>({ name: 'Team Ewela', shots: Array(5).fill(null) });
  const [teamB, setTeamB] = useState<TeamState>({ name: 'Team Kasia', shots: Array(5).fill(null) });

  const handleShot = (team: 'A' | 'B', outcome: 'goal' | 'miss') => {
    const updateShots = (prev: TeamState) => {
      const firstNullIndex = prev.shots.indexOf(null);
      if (firstNullIndex === -1) return prev; // All shots taken

      const newShots = [...prev.shots];
      newShots[firstNullIndex] = outcome;
      return { ...prev, shots: newShots };
    };

    if (team === 'A') setTeamA(updateShots);
    else setTeamB(updateShots);
  };

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

  return (
    <Paper elevation={4} sx={{ p: 4, maxWidth: 450, mx: 'auto', mt: 4, borderRadius: 3 }}>
      {/* <Typography variant="h5" fontWeight="bold" textAlign="center" gutterBottom>
        Penalty Shootout
      </Typography> */}

      <Stack spacing={4} sx={{ mt: 2 }}>
        {/* Team Rows */}
        {[teamA, teamB].map((team, idx) => (
          <Box key={team.name}>
            <Typography variant="overline" fontWeight="bold" sx={{ display: 'block', mb: 1 }}>
              {team.name}
            </Typography>
            <Stack direction="row" spacing={1.5}>
              {team.shots.map((shot, i) => renderShotIcon(shot, i))}
            </Stack>
            <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
              <Button 
                variant="outlined" 
                color="success" 
                size="small"
                onClick={() => handleShot(idx === 0 ? 'A' : 'B', 'goal')}
              >
                Goal
              </Button>
              <Button 
                variant="outlined" 
                color="error" 
                size="small"
                onClick={() => handleShot(idx === 0 ? 'A' : 'B', 'miss')}
              >
                Miss
              </Button>
            </Stack>
          </Box>
        ))}
      </Stack>

      <Divider sx={{ my: 3 }} />
      
      <Button fullWidth variant="text" onClick={() => {
        setTeamA(t => ({ ...t, shots: Array(5).fill(null) }));
        setTeamB(t => ({ ...t, shots: Array(5).fill(null) }));
      }}>
        Reset Shootout
      </Button>
    </Paper>
  );
};

export default PenaltyShootout;