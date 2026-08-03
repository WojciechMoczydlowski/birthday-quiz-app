import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  MenuItem,
  Radio,
  IconButton,
  Stack,
  Alert,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import { Answer, Question } from '../types';

interface QuestionEditorProps {
  categories: string[];
  // The question being edited, or null when creating a new one.
  question: Question | null;
  onSave: (question: Question | Omit<Question, 'id'>) => void;
  onCancel: () => void;
}

const MIN_ANSWERS = 2;
const MAX_ANSWERS = 6;

const emptyAnswers = (): Answer[] => [
  { text: '', isCorrect: true },
  { text: '', isCorrect: false },
  { text: '', isCorrect: false },
  { text: '', isCorrect: false },
];

const QuestionEditor: React.FC<QuestionEditorProps> = ({
  categories,
  question,
  onSave,
  onCancel,
}) => {
  const [text, setText] = useState(question?.text ?? '');
  const [category, setCategory] = useState(
    question?.category ?? categories[0] ?? ''
  );
  const [answers, setAnswers] = useState<Answer[]>(
    question ? question.answers.map((a) => ({ ...a })) : emptyAnswers()
  );
  const [error, setError] = useState<string | null>(null);

  const correctIndex = answers.findIndex((a) => a.isCorrect);

  const handleAnswerTextChange = (index: number, value: string) => {
    setAnswers((prev) =>
      prev.map((a, i) => (i === index ? { ...a, text: value } : a))
    );
  };

  const handleSetCorrect = (index: number) => {
    setAnswers((prev) => prev.map((a, i) => ({ ...a, isCorrect: i === index })));
  };

  const handleAddAnswer = () => {
    setAnswers((prev) =>
      prev.length >= MAX_ANSWERS
        ? prev
        : [...prev, { text: '', isCorrect: false }]
    );
  };

  const handleRemoveAnswer = (index: number) => {
    setAnswers((prev) => {
      if (prev.length <= MIN_ANSWERS) return prev;
      const next = prev.filter((_, i) => i !== index);
      // Ensure there is still exactly one correct answer.
      if (!next.some((a) => a.isCorrect)) {
        next[0] = { ...next[0], isCorrect: true };
      }
      return next;
    });
  };

  const handleSave = () => {
    const trimmedText = text.trim();
    if (!trimmedText) {
      setError('Treść pytania nie może być pusta.');
      return;
    }
    if (!category) {
      setError('Wybierz kategorię (najpierw dodaj kategorię, jeśli lista jest pusta).');
      return;
    }
    const cleanedAnswers = answers.map((a) => ({ ...a, text: a.text.trim() }));
    if (cleanedAnswers.some((a) => !a.text)) {
      setError('Każda odpowiedź musi mieć treść.');
      return;
    }
    if (!cleanedAnswers.some((a) => a.isCorrect)) {
      setError('Zaznacz poprawną odpowiedź.');
      return;
    }

    const base = { text: trimmedText, category, answers: cleanedAnswers };
    if (question) {
      onSave({ ...base, id: question.id });
    } else {
      onSave(base);
    }
  };

  const letter = (index: number) => String.fromCharCode(65 + index);

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }}>
        {question ? 'Edytuj pytanie' : 'Nowe pytanie'}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <TextField
        label="Treść pytania"
        value={text}
        onChange={(e) => setText(e.target.value)}
        fullWidth
        multiline
        minRows={2}
        sx={{ mb: 2 }}
      />

      <TextField
        label="Kategoria"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        select
        fullWidth
        sx={{ mb: 3 }}
        helperText={
          categories.length === 0
            ? 'Brak kategorii — dodaj kategorię w sekcji "Kategorie".'
            : 'Wybierz kategorię pytania.'
        }
        disabled={categories.length === 0}
      >
        {categories.map((cat) => (
          <MenuItem key={cat} value={cat}>
            {cat}
          </MenuItem>
        ))}
      </TextField>

      <Typography variant="subtitle1" sx={{ mb: 1 }}>
        Odpowiedzi (zaznacz poprawną)
      </Typography>

      <Stack spacing={1.5} sx={{ mb: 2 }}>
        {answers.map((answer, index) => (
          <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Radio
              checked={correctIndex === index}
              onChange={() => handleSetCorrect(index)}
              color="success"
              inputProps={{ 'aria-label': `Poprawna odpowiedź ${letter(index)}` }}
            />
            <TextField
              label={`Odpowiedź ${letter(index)}`}
              value={answer.text}
              onChange={(e) => handleAnswerTextChange(index, e.target.value)}
              fullWidth
              size="small"
            />
            <IconButton
              aria-label="Usuń odpowiedź"
              onClick={() => handleRemoveAnswer(index)}
              disabled={answers.length <= MIN_ANSWERS}
            >
              <DeleteIcon />
            </IconButton>
          </Box>
        ))}
      </Stack>

      <Button
        startIcon={<AddIcon />}
        onClick={handleAddAnswer}
        disabled={answers.length >= MAX_ANSWERS}
        sx={{ mb: 3 }}
      >
        Dodaj odpowiedź
      </Button>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
        <Button onClick={onCancel}>Anuluj</Button>
        <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSave}>
          Zapisz
        </Button>
      </Box>
    </Box>
  );
};

export default QuestionEditor;
