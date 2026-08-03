export interface CategoryColor {
  main: string;
  light: string;
  dark: string;
}

// Colors for the original, built-in categories are preserved so the game keeps
// its familiar look. Any category not listed here gets a color from the palette
// below based on its position in the categories array.
const namedColors: Record<string, CategoryColor> = {
  'Pytania ogólne': { main: '#ffd54f', light: '#fff9c4', dark: '#ffc107' },
  'Kobiety i związki': { main: '#4db6ac', light: '#b2dfdb', dark: '#26a69a' },
  'Nauka, studia, praca': { main: '#64b5f6', light: '#bbdefb', dark: '#42a5f5' },
  'Studnia': { main: '#f06292', light: '#f8bbd0', dark: '#ec407a' },
  'Pytania Combo': { main: '#a1887f', light: '#d7ccc8', dark: '#795548' },
};

const palette: CategoryColor[] = [
  { main: '#ffd54f', light: '#fff9c4', dark: '#ffc107' }, // amber
  { main: '#4db6ac', light: '#b2dfdb', dark: '#26a69a' }, // teal
  { main: '#64b5f6', light: '#bbdefb', dark: '#42a5f5' }, // blue
  { main: '#f06292', light: '#f8bbd0', dark: '#ec407a' }, // pink
  { main: '#a1887f', light: '#d7ccc8', dark: '#795548' }, // brown
  { main: '#9575cd', light: '#d1c4e9', dark: '#673ab7' }, // deep purple
  { main: '#4dd0e1', light: '#b2ebf2', dark: '#00acc1' }, // cyan
  { main: '#81c784', light: '#c8e6c9', dark: '#43a047' }, // green
  { main: '#ff8a65', light: '#ffccbc', dark: '#f4511e' }, // deep orange
  { main: '#ba68c8', light: '#e1bee7', dark: '#8e24aa' }, // purple
  { main: '#7986cb', light: '#c5cae9', dark: '#3949ab' }, // indigo
  { main: '#dce775', light: '#f0f4c3', dark: '#c0ca33' }, // lime
];

const fallback: CategoryColor = { main: '#757575', light: '#9e9e9e', dark: '#616161' };

export const getCategoryColor = (
  category: string,
  categories: string[]
): CategoryColor => {
  const idx = categories.indexOf(category);
  if (idx >= 0) {
    return palette[idx % palette.length];
  }
  return fallback;
};
