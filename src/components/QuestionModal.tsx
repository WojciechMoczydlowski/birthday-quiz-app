import React, { useState } from 'react';
import {
  Box,
  Modal,
  Paper,
  Typography,
  Button,
  Grid,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { Question } from '../types';

interface QuestionModalProps {
  question: Question;
  onAnswerClick: (questionId: number, answerIndex: number, isCorrect: boolean) => void;
  onClose: () => void;
  isAnswered: boolean;
}

const QuestionModal: React.FC<QuestionModalProps> = ({
  question,
  onAnswerClick,
  onClose,
  isAnswered,
}) => {
  const [selectedAnswerIndex, setSelectedAnswerIndex] = useState<number | null>(null);

  const handleAnswerClick = (index: number, isCorrect: boolean) => {
    if (isAnswered) return;
    
    setSelectedAnswerIndex(index);
    onAnswerClick(question.id, index, isCorrect);
  };

  const getAnswerColor = (index: number, isCorrect: boolean) => {
    if (selectedAnswerIndex === null) {
      return 'default';
    }
    // If this is the selected answer, show green if correct, red if incorrect
    if (selectedAnswerIndex === index) {
      return isCorrect ? 'success' : 'error';
    }
    // If another answer was selected, show the correct answer in green
    if (isCorrect) {
      return 'success';
    }
    return 'default';
  };

  const getAnswerBackgroundColor = (index: number, isCorrect: boolean) => {
    if (selectedAnswerIndex === null) {
      return 'transparent';
    }
    // If this is the selected answer, show green if correct, red if incorrect
    if (selectedAnswerIndex === index) {
      return isCorrect ? '#4caf50' : '#f44336';
    }
    // If another answer was selected, show the correct answer in green
    if (isCorrect) {
      return '#4caf50';
    }
    return 'transparent';
  };

  const getAnswerTextColor = (index: number, isCorrect: boolean) => {
    if (selectedAnswerIndex === null) {
      return 'inherit';
    }
    if (selectedAnswerIndex === index || isCorrect) {
      return 'white';
    }
    return 'inherit';
  };
  const letter = (index: number) => String.fromCharCode(65 + index);
  return (
    <Modal
      open={true}
      onClose={onClose}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Paper
        sx={{
          position: 'relative',
          width: '90%',
          maxWidth: 1100,
          p: 4,
          outline: 'none',
        }}
      >
        <IconButton
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
          }}
        >
          <CloseIcon />
        </IconButton>

        <Typography variant="h4" component="h2" gutterBottom sx={{ pr: 5 }}>
          {question.text}
        </Typography>

        <Grid container spacing={2} sx={{ mt: 2 }}>
          {question.answers.map((answer, index) => (
            <Grid item xs={12} sm={6} key={index}>
              <Button
                variant="outlined"
                fullWidth
                onClick={() => handleAnswerClick(index, answer.isCorrect)}
                disabled={isAnswered}
                sx={{
                  py: 2,
                  minHeight: 80,
                  fontSize: '1.1rem',
                  backgroundColor: getAnswerBackgroundColor(index, answer.isCorrect),
                  color: getAnswerTextColor(index, answer.isCorrect),
                  borderColor:
                    selectedAnswerIndex !== null && (selectedAnswerIndex === index || answer.isCorrect)
                      ? answer.isCorrect
                        ? '#4caf50'
                        : '#f44336'
                      : 'inherit',
                  '&:hover': {
                    backgroundColor:
                      selectedAnswerIndex === null
                        ? 'action.hover'
                        : getAnswerBackgroundColor(index, answer.isCorrect),
                  },
                }}
              >
                {letter(index) + ') ' + answer.text}
              </Button>
            </Grid>
          ))}
        </Grid>

        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Button
            variant="contained"
            onClick={onClose}
            size="large"
            sx={{ px: 4 }}
          >
            Close Question
          </Button>
        </Box>
      </Paper>
    </Modal>
  );
};

export default QuestionModal;
