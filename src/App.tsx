import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import EditIcon from '@mui/icons-material/Edit';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import Dashboard from './components/Dashboard';
import QuestionList from './components/QuestionList';
import QuestionModal from './components/QuestionModal';
import ManageContentModal from './components/ManageContentModal';
import { Question } from './types';

const STORAGE_KEY = 'quiz-manager-state';
const CONTENT_KEY = 'quiz-manager-content';

// Number of competing teams. Change this to add/remove teams; the dashboard and
// all game logic adapt automatically.
const NUM_TEAMS = 3;

// Default team names, used the first time the app runs (each is editable in UI).
const DEFAULT_TEAM_NAMES = ['Team Kasia', 'Team Ewela', 'Team 3'];

export interface TeamState {
  name: string;
  score: number;
  series: boolean[];
}

interface SavedState {
  teams: TeamState[];
  answeredQuestions: number[];
  currentTeamIndex: number;
}

const makeDefaultTeams = (): TeamState[] =>
  Array.from({ length: NUM_TEAMS }, (_, i) => ({
    name: DEFAULT_TEAM_NAMES[i] ?? `Team ${i + 1}`,
    score: 0,
    series: [],
  }));

const loadState = (): any => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (error) {
    console.error('Failed to load state from localStorage:', error);
  }
  return null;
};

// Builds the initial teams array, seeding from saved state when present. Handles
// both the current array format and the older team1*/team2* format so existing
// saves aren't lost, and gracefully grows/shrinks to NUM_TEAMS.
const initTeams = (saved: any): TeamState[] => {
  const teams = makeDefaultTeams();
  if (!saved) return teams;

  if (Array.isArray(saved.teams)) {
    saved.teams.slice(0, NUM_TEAMS).forEach((t: Partial<TeamState>, i: number) => {
      teams[i] = {
        name: t?.name ?? teams[i].name,
        score: typeof t?.score === 'number' ? t.score : 0,
        series: Array.isArray(t?.series) ? t!.series! : [],
      };
    });
  } else {
    // Legacy two-team format.
    if (typeof saved.team1Name === 'string') teams[0].name = saved.team1Name;
    if (typeof saved.team1Score === 'number') teams[0].score = saved.team1Score;
    if (teams[1] && typeof saved.team2Name === 'string') teams[1].name = saved.team2Name;
    if (teams[1] && typeof saved.team2Score === 'number') teams[1].score = saved.team2Score;
  }
  return teams;
};

const initCurrentTeamIndex = (saved: any): number => {
  if (saved) {
    if (typeof saved.currentTeamIndex === 'number') {
      return Math.min(Math.max(0, saved.currentTeamIndex), NUM_TEAMS - 1);
    }
    if (saved.currentTeam === 'team2') return Math.min(1, NUM_TEAMS - 1); // legacy
  }
  return 0;
};

const saveState = (state: SavedState) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('Failed to save state to localStorage:', error);
  }
};

// These are only used to seed the app the first time it runs. After that,
// categories and questions live in localStorage and are managed from the UI.
const defaultCategories = [
  'Pytania ogólne',
  'Kobiety i związki',
  'Nauka, studia, praca',
  'Studnia',
  'Pytania Combo',
];

const defaultQuestions: Question[] = [
  // General Knowledge (5)
  {
    id: 1,
    text: 'Jakiego koloru bluzy nie mam?',
    category: 'Pytania ogólne',
    answers: [
      { text: 'Beżowa', isCorrect: false },
      { text: 'Niebieska', isCorrect: false },
      { text: 'Czerwona', isCorrect: false },
      { text: 'Zielona', isCorrect: true },
    ],
  },
  {
    id: 2,
    text: 'W jakim kraju nigdy nie byłem?',
    category: 'Pytania ogólne',
    answers: [
      { text: 'Rosja', isCorrect: false },
      { text: 'Belgia', isCorrect: true },
      { text: 'Macedonia', isCorrect: false },
      { text: 'USA', isCorrect: false },
    ],
  },
];

interface SavedContent {
  categories: string[];
  questions: Question[];
}

const loadContent = (): SavedContent => {
  try {
    const saved = localStorage.getItem(CONTENT_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (
        parsed &&
        Array.isArray(parsed.categories) &&
        Array.isArray(parsed.questions)
      ) {
        return { categories: parsed.categories, questions: parsed.questions };
      }
    }
  } catch (error) {
    console.error('Failed to load content from localStorage:', error);
  }
  return { categories: defaultCategories, questions: defaultQuestions };
};

const saveContent = (content: SavedContent) => {
  try {
    localStorage.setItem(CONTENT_KEY, JSON.stringify(content));
  } catch (error) {
    console.error('Failed to save content to localStorage:', error);
  }
};

function App() {
  // Load initial state from localStorage
  const savedState = loadState();
  const [teams, setTeams] = useState<TeamState[]>(() => initTeams(savedState));
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [answeredQuestions, setAnsweredQuestions] = useState<Set<number>>(
    new Set(savedState?.answeredQuestions ?? [])
  );
  const [currentTeamIndex, setCurrentTeamIndex] = useState<number>(() =>
    initCurrentTeamIndex(savedState)
  );

  // Quiz content (categories + questions) is now editable from the UI and
  // persisted separately from the game state.
  const savedContent = loadContent();
  const [categories, setCategories] = useState<string[]>(savedContent.categories);
  const [questions, setQuestions] = useState<Question[]>(savedContent.questions);
  const [manageOpen, setManageOpen] = useState(false);
  const [settingsAnchor, setSettingsAnchor] = useState<null | HTMLElement>(null);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    saveState({
      teams,
      answeredQuestions: Array.from(answeredQuestions),
      currentTeamIndex,
    });
  }, [teams, answeredQuestions, currentTeamIndex]);

  // Persist quiz content whenever categories or questions change.
  useEffect(() => {
    saveContent({ categories, questions });
  }, [categories, questions]);

  // ---- Content management handlers ----
  const handleAddCategory = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed || categories.includes(trimmed)) {
      return;
    }
    setCategories((prev) => [...prev, trimmed]);
  };

  const handleDeleteCategory = (name: string) => {
    const removedIds = questions
      .filter((q) => q.category === name)
      .map((q) => q.id);
    setQuestions((prev) => prev.filter((q) => q.category !== name));
    setCategories((prev) => prev.filter((c) => c !== name));
    if (removedIds.length > 0) {
      setAnsweredQuestions((prev) => {
        const next = new Set(prev);
        removedIds.forEach((id) => next.delete(id));
        return next;
      });
    }
  };

  const handleAddQuestion = (question: Omit<Question, 'id'>) => {
    const newId =
      questions.reduce((max, cur) => Math.max(max, cur.id), 0) + 1;
    setQuestions((prev) => [...prev, { ...question, id: newId }]);
  };

  const handleUpdateQuestion = (updated: Question) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === updated.id ? updated : q))
    );
    setSelectedQuestion((prev) =>
      prev && prev.id === updated.id ? updated : prev
    );
  };

  const handleDeleteQuestion = (id: number) => {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
    setAnsweredQuestions((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    setSelectedQuestion((prev) => (prev && prev.id === id ? null : prev));
  };

  const switchTeam = () => {
    setCurrentTeamIndex((prev) => (prev + 1) % teams.length);
  };

  const handleQuestionClick = (question: Question) => {
    setSelectedQuestion(question);
  };

  const handleTeamNameChange = (index: number, name: string) => {
    setTeams((prev) =>
      prev.map((t, i) => (i === index ? { ...t, name } : t))
    );
  };

  const handleAnswerClick = (questionId: number, answerIndex: number, isCorrect: boolean) => {
    if (answeredQuestions.has(questionId)) {
      return; // Already answered
    }
    setAnsweredQuestions(new Set([...answeredQuestions, questionId]));

    // Award a point to the current team when the answer is correct, then pass
    // the turn to the next team (cycles through all teams).
    if (isCorrect) {
      setTeams((prev) =>
        prev.map((t, i) =>
          i === currentTeamIndex ? { ...t, score: t.score + 1 } : t
        )
      );
    }

    switchTeam();
  };

  const handleCloseQuestion = () => {
    setSelectedQuestion(null);
  };

  const handleResetGame = () => {
    if (window.confirm('Are you sure you want to reset the game? This will clear all scores and answered questions.')) {
      localStorage.removeItem(STORAGE_KEY);
      // Keep team names, reset scores and series.
      setTeams((prev) => prev.map((t) => ({ ...t, score: 0, series: [] })));
      setAnsweredQuestions(new Set());
      setCurrentTeamIndex(0);
      setSelectedQuestion(null);
    }
  };

  return (
    <>
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" component="h1" sx={{ fontWeight: 700 }}>
          🎉 Quiz Urodzinowy
        </Typography>
        <IconButton
          onClick={(e) => setSettingsAnchor(e.currentTarget)}
          aria-label="Ustawienia"
          aria-controls={settingsAnchor ? 'settings-menu' : undefined}
          aria-haspopup="true"
        >
          <SettingsIcon />
        </IconButton>
        <Menu
          id="settings-menu"
          anchorEl={settingsAnchor}
          open={Boolean(settingsAnchor)}
          onClose={() => setSettingsAnchor(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <MenuItem
            onClick={() => {
              setSettingsAnchor(null);
              setManageOpen(true);
            }}
          >
            <ListItemIcon>
              <EditIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Zarządzaj pytaniami</ListItemText>
          </MenuItem>
          <MenuItem
            onClick={() => {
              setSettingsAnchor(null);
              handleResetGame();
            }}
            sx={{ color: 'error.main' }}
          >
            <ListItemIcon>
              <RestartAltIcon fontSize="small" color="error" />
            </ListItemIcon>
            <ListItemText>Reset Game</ListItemText>
          </MenuItem>
        </Menu>
      </Box>

      <Box sx={{ display: 'flex', gap: 4, alignItems: 'flex-start' }}>
        <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center', minWidth: 0 }}>
          <Box sx={{ width: '100%', maxWidth: 900 }}>
            <QuestionList
              questions={questions}
              categories={categories}
              onQuestionClick={handleQuestionClick}
              answeredQuestions={answeredQuestions}
            />
          </Box>
        </Box>

        <Box sx={{ width: 280, flexShrink: 0, position: 'sticky', top: 16 }}>
          <Dashboard
            teams={teams}
            currentTeamIndex={currentTeamIndex}
            onTeamNameChange={handleTeamNameChange}
            orientation="vertical"
          />
        </Box>
      </Box>
    </Container>

      {selectedQuestion && (
        <QuestionModal
          question={selectedQuestion}
          onAnswerClick={handleAnswerClick}
          onClose={handleCloseQuestion}
          isAnswered={answeredQuestions.has(selectedQuestion.id)}
        />
      )}

      <ManageContentModal
        open={manageOpen}
        onClose={() => setManageOpen(false)}
        categories={categories}
        questions={questions}
        onAddCategory={handleAddCategory}
        onDeleteCategory={handleDeleteCategory}
        onAddQuestion={handleAddQuestion}
        onUpdateQuestion={handleUpdateQuestion}
        onDeleteQuestion={handleDeleteQuestion}
      />
    </>
  );
}

export default App;
