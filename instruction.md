# GitHub Copilot Instructions

## Project Goal
Refactor this legacy Flask Sudoku game into a modern, maintainable application while preserving existing functionality.

## Coding Guidelines
- Keep the code modular and easy to read.
- Reuse existing functions where possible instead of duplicating logic.
- Preserve existing functionality unless explicitly changing it.
- Explain every file that is modified.
- Use clear variable and function names.
- Add comments only where they improve readability.
- Handle errors gracefully without crashing the application.

## UI Guidelines
- Keep the interface responsive for desktop and mobile.
- Use accessible colors with sufficient contrast.
- Maintain a clean and consistent layout.

## Feature Requirements
Implement features according to the project rubric:
- Unique-solution Sudoku generator.
- Difficulty selector (Easy, Medium, Hard).
- Timer.
- Hint system.
- Check Puzzle button.
- Immediate validation of invalid entries.
- Top 10 leaderboard using localStorage.
- Congratulatory message on completion.
- Dark mode support.

## Copilot Behavior
- Prefer minimal, focused changes.
- Do not rewrite unrelated code.
- Explain the reasoning behind major changes.
- Preserve compatibility with the existing Flask project.