import React, { useState, useEffect } from 'react';
import { Container, Box, Typography, Button } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
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
  {
    id: 3,
    text: 'Ile ważę kg? Po obudzeniu, w piżamie, po skorzystaniu z toalety. Stan na 24.01.2026.',
    category: 'Pytania ogólne',
    answers: [
      { text: '78', isCorrect: false },
      { text: '83', isCorrect: false },
      { text: '88', isCorrect: true },
      { text: '93', isCorrect: false },
    ],
  },
  {
    id: 4,
    text: 'Jaki jest mój ulubiony kanał na YT?',
    category: 'Pytania ogólne',
    answers: [
      { text: 'Mietczyński', isCorrect: true },
      { text: 'GM Hikaru Nakamura', isCorrect: false },
      { text: 'freeCodeCamp', isCorrect: false },
      { text: 'Polsport - Michał Pol', isCorrect: false },
    ],
  },
  {
    id: 5,
    text: 'Jakim dezodorantem się psikam?',
    category: 'Pytania ogólne',
    answers: [
      { text: 'Old Spice', isCorrect: false },
      { text: 'STR8', isCorrect: true },
      { text: 'Axe', isCorrect: false },
      { text: 'Adidas', isCorrect: false },
    ],
  },

  // Science & Nature (5)
  {
    id: 6,
    text: 'Z kim byłem najwięcej razy na weselu (takim prawdziwym, nie piknik w lesie)? Uszereguj od najwięcej do najmniej.',
    category: 'Kobiety i związki',
    answers: [
      { text: 'Ewela, Zuza, Kasia, Natalia', isCorrect: false },
      { text: 'Zuza, Ewela, Kasia, Natalia', isCorrect: true },
      { text: 'Ewela, Zuza, Natalia, Kasia', isCorrect: false },
      { text: 'Zuza, Ewela, Natalia, Kasia', isCorrect: false },
    ],
  },
  {
    id: 7,
    text: 'Ile wynosi mój łączny staż związkowy?',
    category: 'Kobiety i związki',
    answers: [
      { text: '6 miesięcy', isCorrect: false },
      { text: '12 miesięcy', isCorrect: false },
      { text: '18 miesięcy', isCorrect: true },
      { text: '24 miesiące', isCorrect: false },
    ],
  },
  {
    id: 8,
    text: 'Jak nazywała się moja ulubiona fryzjerka, gdy mieszkałem na Włochach?',
    category: 'Kobiety i związki',
    answers: [
      { text: 'Pani Ola', isCorrect: false },
      { text: 'Pani Gosia', isCorrect: false },
      { text: 'Pani Iwonka', isCorrect: false },
      { text: 'Pani Agata', isCorrect: true },
    ],
  },
  {
    id: 9,
    text: 'Z którą kobietą nigdy nie byłem w klubie?',
    category: 'Kobiety i związki',
    answers: [
      { text: 'Ula Chmielewska', isCorrect: false },
      { text: 'Patrycja Klimczak', isCorrect: false },
      { text: 'Agnieszka Koronowska', isCorrect: false },
      { text: 'Ania Burakowska', isCorrect: true },
    ],
  },
  {
    id: 10,
    text: 'Z iloma kobietami się całowałem w życiu?',
    category: 'Kobiety i związki',
    answers: [
      { text: '3', isCorrect: false },
      { text: '4', isCorrect: true },
      { text: '5', isCorrect: false },
      { text: '6', isCorrect: false },
    ],
  },

  // Math & Logic (5)
  {
    id: 11,
    text: 'W ilu firmach prawnie pracowałem (obecna też się liczy)?',
    category: 'Nauka, studia, praca',
    answers: [
      { text: '6', isCorrect: false },
      { text: '7', isCorrect: true },
      { text: '8', isCorrect: false },
      { text: '9', isCorrect: false },
    ],
  },
  {
    id: 12,
    text: 'Ile zajęło mi ukończenie studiów z informatyki? Licencjat + magisterka',
    category: 'Nauka, studia, praca',
    answers: [
      { text: '5 lat', isCorrect: false },
      { text: 'Więcej niż 5 lat, ale mniej niż 6', isCorrect: false },
      { text: '6 lat', isCorrect: false },
      { text: 'Więcej niż 6 lat', isCorrect: true },
    ],
  },
  {
    id: 13,
    text: 'Z jakiej atrakcji mojego biura najczęściej korzystam?',
    category: 'Nauka, studia, praca',
    answers: [
      { text: 'Siłownia', isCorrect: false },
      { text: 'Ping-pong', isCorrect: false },
      { text: 'Nap room', isCorrect: true },
      { text: 'Kawiarnia', isCorrect: false },
    ],
  },
  {
    id: 14,
    text: 'Jak zacząłem programować?',
    category: 'Nauka, studia, praca',
    answers: [
      { text: 'Poszedłem na kółko informatyczne', isCorrect: false },
      { text: 'Dostałem w prezencie książkę do nauki', isCorrect: true },
      { text: 'Rozwiązałem zagadkę logiczną na lekcji informatyki', isCorrect: false },
      { text: 'Oglądałem kanał na YouTube', isCorrect: false },
    ],
  },
  {
    id: 15,
    text: 'Pytanie z materiałem wideo. Ile lat ma dżentelmen na filmie?',
    category: 'Nauka, studia, praca',
    answers: [
      { text: '11', isCorrect: false },
      { text: '12', isCorrect: false },
      { text: '13', isCorrect: true },
      { text: '14', isCorrect: false },
    ],
  },

  // Literature & Arts (5)
  {
    id: 16,
    text: 'Kiedy pojawiłem się po raz pierwszy w Studni?',
    category: 'Studnia',
    answers: [
      { text: 'W Grudniu 2017 na śniadaniu po roratach', isCorrect: false },
      { text: 'W Grudniu 2017 na spotkaniu z Łukaszem Lewandowskim', isCorrect: true },
      { text: 'W Styczniu 2018 na spotkaniu z Januszem Traczem', isCorrect: false },
      { text: 'W Lutym 2018 na wyjeździe feriowym', isCorrect: false },
    ],
  },
  {
    id: 17,
    text: 'Jaki był mój ostatni wyjazd Studniowy?',
    category: 'Studnia',
    answers: [
      { text: 'Czerwcówka', isCorrect: false },
      { text: 'Małe Ciche', isCorrect: false },
      { text: 'Majówka', isCorrect: true },
      { text: 'Tatry', isCorrect: false },
    ],
  },
  {
    id: 18,
    text: 'Kto nigdy mnie nie wylosował na Mikołajkach?',
    category: 'Studnia',
    answers: [
      { text: 'Pola Witecka', isCorrect: false },
      { text: 'Kasia Gołębiowska', isCorrect: false },
      { text: 'Ania Burakowska', isCorrect: false },
      { text: 'Ania Boryczko', isCorrect: true },
    ],
  },
  {
    id: 19,
    text: 'Z kim NIE planowałem wynajmować wspólnie mieszkania?',
    category: 'Studnia',
    answers: [
      { text: 'Szymon Papierzewski', isCorrect: true },
      { text: 'Oskar Kobierecki', isCorrect: false },
      { text: 'Bartek Wydrych', isCorrect: false },
      { text: 'Wojtek Moczydłowski', isCorrect: false },
    ],
  },
  {
    id: 20,
    text: 'W ilu filmach na FZK grałem?',
    category: 'Studnia',
    answers: [
      { text: '3', isCorrect: false },
      { text: '4', isCorrect: false },
      { text: '5', isCorrect: false },
      { text: '6', isCorrect: true },
    ],
  },

  // Pytania Combo
  {
    id: 21,
    text: 'Które zdanie jest fałszywe?',
    category: 'Pytania Combo',
    answers: [
      { text: 'Pisałem z laureatem nagrody Nobla', isCorrect: false },
      { text: 'Pomagałem robić stronę internetową dla emerytowanej wokalistki', isCorrect: true },
      { text: 'Znana polska szachistka uprawiała seks w moim mieszkaniu', isCorrect: false },
      { text: 'Rozmawiałem przez telefon ze znanym reżyserem', isCorrect: false },
    ],
  },
  {
    id: 22,
    text: 'Które zdanie jest prawdziwe?',
    category: 'Pytania Combo',
    answers: [
      { text: 'Moja Babcia dała mi łyżkę, którą kiedyś jadł Dostojewski', isCorrect: false },
      { text: 'Byłem raz w odwiedzinach u Sylwii w Norwegii', isCorrect: false },
      { text: 'Znam 3 słowa w języku migowym', isCorrect: false },
      { text: 'Nigdy nie zatrzymała mnie policja na drodze', isCorrect: true },
    ],
  },
  {
    id: 23,
    text: 'Które zdanie jest fałszywe?',
    category: 'Pytania Combo',
    answers: [
      { text: 'Śpiewałem kiedyś w scholi na Dwudziestce', isCorrect: false },
      { text: 'Zacząłem programować w wieku 13 lat', isCorrect: false },
      { text: 'Byłem na pieszej pielgrzymce do Częstochowy', isCorrect: true },
      { text: 'Ktoś chciał mnie wciągnąć do sekty', isCorrect: false },
    ],
  },
  {
    id: 24,
    text: 'Które zdanie jest fałszywe?',
    category: 'Pytania Combo',
    answers: [
      { text: 'Byłem na 5 wieczorach kawalerskich', isCorrect: false },
      { text: 'Zwiedzałem z Moniką Wolską zoo w Monachium', isCorrect: true },
      { text: 'Mały Niebieski ma przebieg około 36 tys. km', isCorrect: false },
      { text: 'Studiowałem na 3 różnych kierunkach', isCorrect: false },
    ],
  },
  {
    id: 25,
    text: 'Które zdanie jest prawdziwe?',
    category: 'Pytania Combo',
    answers: [
      { text: 'Przebiegłem 3 razy półmaraton', isCorrect: true },
      { text: 'Mój typ osobowości to ISTJ (Logistyk)', isCorrect: false },
      { text: 'Założyłem się kiedyś o 500 złotych i przegrałem', isCorrect: false },
      { text: 'Zdałem prawo jazdy za drugim razem', isCorrect: false },
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
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom align="center" sx={{ mb: 4 }}>
        Quiz Urodzinowy
      </Typography>
      
      <Dashboard
        teams={teams}
        currentTeamIndex={currentTeamIndex}
        onResetGame={handleResetGame}
        onTeamNameChange={handleTeamNameChange}
      />
      
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4, mb: 1 }}>
        <Button
          variant="outlined"
          startIcon={<EditIcon />}
          onClick={() => setManageOpen(true)}
        >
          Zarządzaj pytaniami
        </Button>
      </Box>

      <Box sx={{ mt: 1 }}>
        <QuestionList
          questions={questions}
          categories={categories}
          onQuestionClick={handleQuestionClick}
          answeredQuestions={answeredQuestions}
        />
      </Box>

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
    </Container>
  );
}

export default App;
