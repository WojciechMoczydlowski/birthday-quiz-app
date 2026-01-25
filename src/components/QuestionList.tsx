import React from 'react';
import { Box, Button, Typography, Grid, Divider } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { Question } from '../types';

interface QuestionListProps {
  questions: Question[];
  categories: string[];
  onQuestionClick: (question: Question) => void;
  answeredQuestions: Set<number>;
}

const categoryColors: Record<string, { main: string; light: string; dark: string }> = {
  'Pytania ogólne': {
    main: '#ffd54f',
    light: '#fff9c4',
    dark: '#ffc107',
  },
  'Kobiety i związki': {
    main: '#4db6ac',
    light: '#b2dfdb',
    dark: '#26a69a',
  },
  'Nauka, studia, praca': {
    main: '#64b5f6',
    light: '#bbdefb',
    dark: '#42a5f5',
  },
  'Studnia': {
    main: '#f06292',
    light: '#f8bbd0',
    dark: '#ec407a',
  },
  'Pytania Combo': {
    main: '#a1887f', // Brown 300
    light: '#d7ccc8', // Brown 100
    dark: '#795548', // Brown 500
  },
};

const QuestionList: React.FC<QuestionListProps> = ({
  questions,
  categories,
  onQuestionClick,
  answeredQuestions,
}) => {
  const questionsByCategory = categories.map((category) => ({
    category,
    questions: questions.filter((q) => q.category === category),
  }));

  return (
    <Box>
      {/* <Typography variant="h5" gutterBottom sx={{ mb: 2 }}>
        Kategorie
      </Typography> */}
      {questionsByCategory.map(({ category, questions: catQuestions }, index) => (
        <Box key={category} sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 1 }}>
            {category}
          </Typography>
          <Grid container spacing={1}>
            {catQuestions.map((question, index) => {
              const isAnswered = answeredQuestions.has(question.id);
              const colors = categoryColors[category] || { main: '#757575', light: '#9e9e9e', dark: '#616161' };
              return (
                <Grid item xs={6} sm={4} md={2} lg={2} key={question.id}>
                  <Button
                    variant={isAnswered ? 'outlined' : 'contained'}
                    // size="large"
                    fullWidth
                    onClick={() => onQuestionClick(question)}
                    sx={{
                      py: 1,
                      minHeight: 42,
                      textTransform: 'none',
                      fontSize: 20,
                      fontWeight: 600,
                      ...(isAnswered
                        ? {
                            borderColor: colors.main,
                            color: colors.main,
                            '&:hover': {
                              borderColor: colors.dark,
                              backgroundColor: `${colors.light}20`,
                            },
                          }
                        : {
                            backgroundColor: colors.main,
                            color: 'white',
                            '&:hover': {
                              backgroundColor: colors.dark,
                            },
                          }),
                    }}
                    startIcon={isAnswered ? <CheckCircleIcon fontSize="small" /> : null}
                  >
                    {index + 1}
                  </Button>
                </Grid>
              );
            })}
            {catQuestions.length === 0 && (
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">
                  No questions in this category yet.
                </Typography>
              </Grid>
            )}
          </Grid>
          {index < questionsByCategory.length - 1 && (
            <Divider sx={{ mt: 3 }} />
          )}
        </Box>
      ))}
    </Box>
  );
};

export default QuestionList;
