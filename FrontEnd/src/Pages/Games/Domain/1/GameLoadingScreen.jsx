import React from 'react';
import { Box, Paper, CircularProgress, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { getDimOverlayStyle } from './GameTheme';

const LoadingContainer = styled(Box)(({ theme }) => ({
  width: '100%',
  minHeight: '70vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(4),
  background: 'linear-gradient(135deg, rgba(4, 37, 57, 0.1) 0%, rgba(87, 199, 133, 0.05) 50%, rgba(249, 117, 68, 0.05) 100%)',
}));

const LoadingBoard = styled(Paper)(({ theme }) => ({
  position: 'relative',
  width: '100%',
  maxWidth: '1000px',
  minWidth: '280px',
  aspectRatio: '4/3',
  backgroundImage: 'url(/Games/backgrounds/pool.jpg)',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  borderRadius: '16px',
  overflow: 'hidden',
  boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
  border: '1px solid rgba(255,255,255,0.2)',
  backdropFilter: 'blur(10px)',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  ...getDimOverlayStyle(),
}));

const LoadingContent = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: theme.spacing(3),
  padding: theme.spacing(4),
  background: 'rgba(255, 255, 255, 0.1)',
  borderRadius: '16px',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  maxWidth: '400px',
  textAlign: 'center',
}));

const StyledCircularProgress = styled(CircularProgress)(({ theme }) => ({
  color: '#57c785',
  '& .MuiCircularProgress-circle': {
    strokeLinecap: 'round',
  },
}));

const LoadingTitle = styled(Typography)(({ theme }) => ({
  color: '#ffffff',
  fontFamily: 'Fredoka One, sans-serif',
  fontSize: '1.5rem',
  fontWeight: 600,
  textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
  marginBottom: theme.spacing(1),
}));

const LoadingSubtitle = styled(Typography)(({ theme }) => ({
  color: 'rgba(255, 255, 255, 0.8)',
  fontFamily: 'Fredoka One, sans-serif',
  fontSize: '1rem',
  fontWeight: 400,
  textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
}));

export function GameLoadingScreen({ gameTitle = "Game" }) {
  return (
    <div>
      <LoadingContainer>
        <div className="pt-24 w-full flex justify-center items-center">
          <div style={{ width: '100%', maxWidth: 1100, margin: '0 auto', padding: '0 12px' }}>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <div style={{ width: '100%', maxWidth: '1000px', minWidth: '280px' }}>
                <LoadingBoard>
                  <LoadingContent>
                    <StyledCircularProgress size={60} thickness={4} />
                    <LoadingTitle>
                      Loading {gameTitle}
                    </LoadingTitle>
                    <LoadingSubtitle>
                      Verifying game access...
                    </LoadingSubtitle>
                  </LoadingContent>
                </LoadingBoard>
              </div>
            </div>
          </div>
        </div>
      </LoadingContainer>
    </div>
  );
}

export default GameLoadingScreen;
