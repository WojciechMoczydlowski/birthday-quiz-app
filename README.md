# Quiz Manager

A simple web app to manage a live quiz at a party. Built with React, TypeScript, and Material-UI.

## Features

- Dashboard showing scores for two teams
- List of questions with buttons
- Question overlay with 4 answer options
- Visual feedback (green/red) when answers are selected
- All state managed in the frontend (no backend required)

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Build for production:
```bash
npm run build
```

The app will open in your browser at `http://localhost:3000`.

## Usage

- Click on any question button to open the question
- Click on an answer to see if it's correct (green) or incorrect (red)
- Click "Close Question" to return to the dashboard
- Questions that have been answered are marked with a checkmark

## Customization

You can modify the questions in `src/App.tsx` in the `initialQuestions` array.
