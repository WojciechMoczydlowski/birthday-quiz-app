import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Box,
  Typography,
  TextField,
  Button,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  Stack,
  Tooltip,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { Question } from '../types';
import { getCategoryColor } from '../categoryColors';
import QuestionEditor from './QuestionEditor';

interface ManageContentModalProps {
  open: boolean;
  onClose: () => void;
  categories: string[];
  questions: Question[];
  onAddCategory: (name: string) => void;
  onDeleteCategory: (name: string) => void;
  onAddQuestion: (question: Omit<Question, 'id'>) => void;
  onUpdateQuestion: (question: Question) => void;
  onDeleteQuestion: (id: number) => void;
}

// Sentinel used to represent "creating a new question" in the editor state.
type EditorState = { mode: 'new' } | { mode: 'edit'; question: Question } | null;

const ManageContentModal: React.FC<ManageContentModalProps> = ({
  open,
  onClose,
  categories,
  questions,
  onAddCategory,
  onDeleteCategory,
  onAddQuestion,
  onUpdateQuestion,
  onDeleteQuestion,
}) => {
  const [newCategory, setNewCategory] = useState('');
  const [categoryError, setCategoryError] = useState<string | null>(null);
  const [editor, setEditor] = useState<EditorState>(null);

  const handleAddCategory = () => {
    const trimmed = newCategory.trim();
    if (!trimmed) {
      setCategoryError('Podaj nazwę kategorii.');
      return;
    }
    if (categories.includes(trimmed)) {
      setCategoryError('Taka kategoria już istnieje.');
      return;
    }
    onAddCategory(trimmed);
    setNewCategory('');
    setCategoryError(null);
  };

  const handleDeleteCategory = (name: string) => {
    const count = questions.filter((q) => q.category === name).length;
    const message =
      count > 0
        ? `Usunąć kategorię "${name}" wraz z ${count} pytaniami?`
        : `Usunąć kategorię "${name}"?`;
    if (window.confirm(message)) {
      onDeleteCategory(name);
    }
  };

  const handleDeleteQuestion = (question: Question) => {
    if (window.confirm(`Usunąć pytanie: "${question.text}"?`)) {
      onDeleteQuestion(question.id);
    }
  };

  const handleSave = (q: Question | Omit<Question, 'id'>) => {
    if ('id' in q) {
      onUpdateQuestion(q);
    } else {
      onAddQuestion(q);
    }
    setEditor(null);
  };

  const handleClose = () => {
    setEditor(null);
    setNewCategory('');
    setCategoryError(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth scroll="paper">
      <DialogTitle sx={{ pr: 6 }}>
        Zarządzaj pytaniami i kategoriami
        <IconButton
          onClick={handleClose}
          sx={{ position: 'absolute', right: 8, top: 8 }}
          aria-label="Zamknij"
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {editor ? (
          <QuestionEditor
            categories={categories}
            question={editor.mode === 'edit' ? editor.question : null}
            onSave={handleSave}
            onCancel={() => setEditor(null)}
          />
        ) : (
          <Box>
            {/* ---------- Categories ---------- */}
            <Typography variant="h6" sx={{ mb: 1 }}>
              Kategorie
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
              {categories.length === 0 && (
                <Typography variant="body2" color="text.secondary">
                  Brak kategorii. Dodaj pierwszą poniżej.
                </Typography>
              )}
              {categories.map((cat) => {
                const colors = getCategoryColor(cat, categories);
                const count = questions.filter((q) => q.category === cat).length;
                return (
                  <Chip
                    key={cat}
                    label={`${cat} (${count})`}
                    onDelete={() => handleDeleteCategory(cat)}
                    sx={{
                      backgroundColor: colors.main,
                      color: 'white',
                      fontWeight: 600,
                      '& .MuiChip-deleteIcon': {
                        color: 'rgba(255,255,255,0.8)',
                        '&:hover': { color: 'white' },
                      },
                    }}
                  />
                );
              })}
            </Box>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start', mb: 3 }}>
              <TextField
                label="Nowa kategoria"
                value={newCategory}
                onChange={(e) => {
                  setNewCategory(e.target.value);
                  setCategoryError(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddCategory();
                }}
                size="small"
                error={Boolean(categoryError)}
                helperText={categoryError}
                sx={{ flexGrow: 1 }}
              />
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleAddCategory}
                sx={{ mt: 0.5 }}
              >
                Dodaj
              </Button>
            </Box>

            <Divider sx={{ mb: 2 }} />

            {/* ---------- Questions ---------- */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 1,
              }}
            >
              <Typography variant="h6">Pytania ({questions.length})</Typography>
              <Tooltip
                title={
                  categories.length === 0
                    ? 'Najpierw dodaj kategorię'
                    : 'Dodaj nowe pytanie'
                }
              >
                <span>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setEditor({ mode: 'new' })}
                    disabled={categories.length === 0}
                  >
                    Dodaj pytanie
                  </Button>
                </span>
              </Tooltip>
            </Box>

            {categories.map((cat) => {
              const catQuestions = questions.filter((q) => q.category === cat);
              if (catQuestions.length === 0) return null;
              const colors = getCategoryColor(cat, categories);
              return (
                <Box key={cat} sx={{ mb: 2 }}>
                  <Typography
                    variant="subtitle2"
                    sx={{ color: colors.dark, fontWeight: 700, mb: 0.5 }}
                  >
                    {cat}
                  </Typography>
                  <List dense disablePadding>
                    {catQuestions.map((question) => (
                      <ListItem
                        key={question.id}
                        divider
                        secondaryAction={
                          <Stack direction="row" spacing={0.5}>
                            <IconButton
                              edge="end"
                              aria-label="Edytuj"
                              onClick={() =>
                                setEditor({ mode: 'edit', question })
                              }
                            >
                              <EditIcon />
                            </IconButton>
                            <IconButton
                              edge="end"
                              aria-label="Usuń"
                              onClick={() => handleDeleteQuestion(question)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Stack>
                        }
                      >
                        <ListItemText
                          primary={question.text}
                          secondary={`${question.answers.length} odpowiedzi`}
                          sx={{ pr: 8 }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              );
            })}

            {questions.length === 0 && (
              <Typography variant="body2" color="text.secondary">
                Brak pytań. Dodaj pierwsze pytanie przyciskiem powyżej.
              </Typography>
            )}
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ManageContentModal;
