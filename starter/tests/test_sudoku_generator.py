import os
import sys
import unittest

sys.path.append(os.path.dirname(os.path.dirname(__file__)))
import sudoku_logic


class SudokuGeneratorTests(unittest.TestCase):
    def test_generated_puzzle_has_exactly_one_solution(self):
        puzzle, solution = sudoku_logic.generate_puzzle(35)
        self.assertIsNotNone(solution)
        self.assertEqual(sudoku_logic.count_solutions(puzzle, limit=2), 1)

    def test_generator_respects_requested_clue_count(self):
        puzzle, _ = sudoku_logic.generate_puzzle(45)
        clues = sum(1 for row in puzzle for cell in row if cell != sudoku_logic.EMPTY)
        self.assertEqual(clues, 45)


if __name__ == '__main__':
    unittest.main()
