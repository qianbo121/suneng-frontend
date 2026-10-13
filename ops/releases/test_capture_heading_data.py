import ast
import hashlib
import tempfile
from pathlib import Path
import unittest


class FrozenHeadingData(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        # Exercise the actual pure function without starting the browser CLI.
        source = Path(__file__).with_name('browser') / 'capture-interactions.py'
        tree = ast.parse(source.read_text())
        function = next(n for n in tree.body if isinstance(n, ast.FunctionDef)
                        and n.name == 'expected_headings_for')
        namespace = {}
        exec(compile(ast.Module(body=[function], type_ignores=[]), str(source), 'exec'), namespace)
        cls.resolve = staticmethod(namespace['expected_headings_for'])

    def test_legacy_plan_keeps_existing_titles_and_article_routes(self):
        value = self.resolve({'articles': [{'path': '/en/news/example', 'title': 'Frozen article'}]})
        self.assertEqual(value['/en/news/example'], 'Frozen article')
        self.assertEqual(value['/en/products/detail/trolley-furnace'],
                         'Bogie-hearth Furnace | Batch Heat Treatment of Large Heavy Parts')
        self.assertEqual(len(value), 8)

    def test_new_approved_title_preserves_all_other_checks(self):
        frozen = {'articles': [], 'headingOverrides': {
            '/en/products/detail/trolley-furnace': 'Bogie-hearth (Trolley) Furnace | Batch Heat Treatment of Large Heavy Parts'}}
        original = self.resolve({'articles': []})
        updated = self.resolve(frozen)
        self.assertEqual(set(updated), set(original))
        self.assertEqual(updated.pop('/en/products/detail/trolley-furnace'),
                         frozen['headingOverrides']['/en/products/detail/trolley-furnace'])
        original.pop('/en/products/detail/trolley-furnace')
        self.assertEqual(updated, original)

    def test_empty_or_invalid_title_cannot_disable_heading_check(self):
        for value in ['', ' ', None, 3, ' title ']:
            with self.subTest(value=value), self.assertRaises(ValueError):
                self.resolve({'articles': [], 'headingOverrides': {
                    '/en/products/detail/trolley-furnace': value}})

    def test_unknown_route_or_non_mapping_is_rejected(self):
        for value in [[], {'/unexpected': 'Title'}]:
            with self.subTest(value=value), self.assertRaises(ValueError):
                self.resolve({'articles': [], 'headingOverrides': value})


    def test_assembly_rejects_rewritten_or_unbound_acceptance_plan(self):
        source = Path(__file__).with_name('browser') / 'assemble-interactions-report.py'
        tree = ast.parse(source.read_text())
        expression = next(value for node in ast.walk(tree) if isinstance(node, ast.Dict)
                          for key, value in zip(node.keys, node.values)
                          if isinstance(key, ast.Constant) and key.value == 'frozenAcceptancePlanUnchanged')
        compiled = compile(ast.Expression(expression), str(source), 'eval')
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder)
            plan = root / 'acceptance-plan.json'
            plan.write_text('{"headingOverrides": {}}')
            receipt = {'acceptancePlanSha256': hashlib.sha256(plan.read_bytes()).hexdigest()}
            context = {'root': root, 'receipt': receipt, 'hashlib': hashlib}
            self.assertTrue(eval(compiled, context))
            plan.write_text('{"headingOverrides": {"/en/news": "Changed after capture"}}')
            self.assertFalse(eval(compiled, context))
            receipt.clear()
            self.assertFalse(eval(compiled, context))


if __name__ == '__main__':
    unittest.main()
