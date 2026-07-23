import copy
import random

SIZE = 9
EMPTY = 0


def deep_copy(board):
    return copy.deepcopy(board)


def create_empty_board():
    return [[EMPTY for _ in range(SIZE)] for _ in range(SIZE)]


def is_safe(board, row, col, num):
    # Check row and column
    for x in range(SIZE):
        if board[row][x] == num or board[x][col] == num:
            return False
    # Check 3x3 box
    start_row = row - row % 3
    start_col = col - col % 3
    for i in range(3):
        for j in range(3):
            if board[start_row + i][start_col + j] == num:
                return False
    return True


def fill_board(board):
    for row in range(SIZE):
        for col in range(SIZE):
            if board[row][col] == EMPTY:
                possible = list(range(1, SIZE + 1))
                random.shuffle(possible)
                for candidate in possible:
                    if is_safe(board, row, col, candidate):
                        board[row][col] = candidate
                        if fill_board(board):
                            return True
                        board[row][col] = EMPTY
                return False
    return True


def find_empty_cell(board):
    for row in range(SIZE):
        for col in range(SIZE):
            if board[row][col] == EMPTY:
                return row, col
    return None


def count_solutions(board, limit=2):
    board = deep_copy(board)
    solutions = 0

    def backtrack(current_board):
        nonlocal solutions
        if solutions >= limit:
            return
        empty = find_empty_cell(current_board)
        if empty is None:
            solutions += 1
            return
        row, col = empty
        possible = list(range(1, SIZE + 1))
        random.shuffle(possible)
        for candidate in possible:
            if is_safe(current_board, row, col, candidate):
                current_board[row][col] = candidate
                backtrack(current_board)
                current_board[row][col] = EMPTY
                if solutions >= limit:
                    return

    backtrack(board)
    return solutions


def remove_cells(board, clues):
    positions = [(row, col) for row in range(SIZE) for col in range(SIZE)]
    random.shuffle(positions)
    removed = 0
    target_removed = SIZE * SIZE - clues

    for row, col in positions:
        if removed >= target_removed:
            break
        if board[row][col] == EMPTY:
            continue
        original_value = board[row][col]
        board[row][col] = EMPTY
        if count_solutions(board, limit=2) != 1:
            board[row][col] = original_value
        else:
            removed += 1

    return removed == target_removed


def generate_puzzle(clues=35):
    for _ in range(100):
        board = create_empty_board()
        fill_board(board)
        solution = deep_copy(board)
        puzzle = deep_copy(board)
        if remove_cells(puzzle, clues):
            return puzzle, solution

    raise RuntimeError('Unable to generate a uniquely solvable Sudoku puzzle')
