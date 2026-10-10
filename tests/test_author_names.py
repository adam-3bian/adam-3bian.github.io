import sys, unittest
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'scripts'))
from site_model import named_authors

class AuthorNamesTests(unittest.TestCase):
    def test_oxford_comma_does_not_become_part_of_a_contributors_name(self):
        self.assertEqual(named_authors('Jonathan Woodruff, Robert N. M. Watson, and Simon W. Moore. IEEE Transactions on Computers, 2019.'),
                         ['Jonathan Woodruff', 'Robert N. M. Watson', 'Simon W. Moore'])

    def test_unnamed_contributors_do_not_become_people(self):
        self.assertEqual(named_authors('John Baldwin, Jessica Clarke, and others. ACM SOSP, 2025.'),
                         ['John Baldwin', 'Jessica Clarke'])
