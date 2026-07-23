import os
import sys
import unittest

sys.path.append(os.path.dirname(os.path.dirname(__file__)))
import app as app_module


class CheckPuzzleTests(unittest.TestCase):
    def setUp(self):
        self.client = app_module.app.test_client()
        self.solution = [
            [1, 2, 3, 4, 5, 6, 7, 8, 9],
            [4, 5, 6, 7, 8, 9, 1, 2, 3],
            [7, 8, 9, 1, 2, 3, 4, 5, 6],
            [2, 3, 4, 5, 6, 7, 8, 9, 1],
            [5, 6, 7, 8, 9, 1, 2, 3, 4],
            [8, 9, 1, 2, 3, 4, 5, 6, 7],
            [3, 4, 5, 6, 7, 8, 9, 1, 2],
            [6, 7, 8, 9, 1, 2, 3, 4, 5],
            [9, 1, 2, 3, 4, 5, 6, 7, 8],
        ]
        app_module.CURRENT['solution'] = self.solution

    def test_check_reports_incorrect_cells(self):
        board = [row[:] for row in self.solution]
        board[0][0] = 2

        response = self.client.post('/check', json={'board': board})

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.get_json()['incorrect'], [[0, 0]])

    def test_check_accepts_a_completed_board(self):
        response = self.client.post('/check', json={'board': self.solution})

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.get_json()['incorrect'], [])


if __name__ == '__main__':
    unittest.main()
