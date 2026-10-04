import { createRequire } from 'node:module';
import { createHash } from 'node:crypto';

function inputFor(spec) {
  const n = spec.depth;
  if (spec.inputKind === 'braces') return '{'.repeat(n) + 'a,b' + '}'.repeat(n);
  if (spec.inputKind === 'parens') return '('.repeat(n) + 'x' + ')'.repeat(n);
  if (spec.inputKind === 'mixed') return '{('.repeat(n / 2) + 'a,b' + ')}'.repeat(n / 2);
  if (spec.inputKind === 'unclosed') return '{'.repeat(n) + 'a,b';
  if (spec.inputKind === 'character-limit') return 'x'.repeat(n);
  if (spec.inputKind === 'ast') {
    let node = { type: 'text', value: 'x' };
    for (let i = 0; i < n; i++) node = { type: 'paren', nodes: [node] };
    return { type: 'root', nodes: [node] };
  }
  if (spec.inputKind === 'ast-child-cycle') {
    const root = { type: 'root', nodes: [] };
    root.nodes.push(root);
    return root;
  }
  if (spec.inputKind === 'ast-parent-cycle') {
    const node = { type: 'paren', nodes: [{ type: 'text', value: 'x' }] };
    node.parent = node;
    return node;
  }
  if (spec.inputKind === 'ast-value-array' || spec.inputKind === 'ast-range-value-array') {
    let value = ['x'];
    for (let i = 0; i < n; i++) value = [value];
    if (spec.inputKind === 'ast-range-value-array') return { type: 'brace', ranges: 1, commas: 0, open: true, close: true, nodes: [{ type: 'text', value }, { type: 'range', value: '..' }, { type: 'text', value: '2' }] };
    return { type: 'root', nodes: [{ type: 'text', value }] };
  }
  if (spec.inputKind === 'ast-value-cycle') {
    const value = [];
    value.push(value);
    return { type: 'root', nodes: [{ type: 'text', value }] };
  }
  if (spec.inputKind === 'ast-value-object') return { type: 'root', nodes: [{ type: 'text', value: {} }] };
  if (spec.inputKind === 'ast-array-node') return { type: 'root', nodes: [[]] };
  if (spec.inputKind === 'ast-invalid-children') return { type: 'root', nodes: {} };
  return spec.pattern;
}

try {
  const [packageJson, specText, consumerPackageJson] = process.argv.slice(2);
  const spec = JSON.parse(specText);
  const require = createRequire(packageJson);
  const braces = require(packageJson.replace(/package\.json$/, 'index.js'));
  const options = { ...(spec.options || {}) };
  if (spec.optionKind === 'infinity') options.maxDepth = Infinity;
  if (spec.optionKind === 'nan') options.maxDepth = NaN;
  if (spec.optionKind === 'huge') options.maxDepth = 1000000;
  let output;
  if (spec.integration === 'micromatch') {
    const fromConsumer = createRequire(consumerPackageJson);
    const micromatch = fromConsumer(consumerPackageJson.replace(/package\.json$/, 'index.js'));
    output = micromatch(spec.files, spec.pattern, options);
  } else {
    const input = inputFor(spec);
    output = spec.method === 'main' ? braces(input, options) : braces[spec.method](input, options);
  }
  const serialized = JSON.stringify(output, (key, value) => key === 'parent' || key === 'prev' ? undefined : value);
  process.stdout.write(JSON.stringify({ outcome: 'returned', outputSha256: createHash('sha256').update(serialized).digest('hex') }));
} catch (error) {
  process.stdout.write(JSON.stringify({ outcome: 'threw', errorName: error.name, errorMessage: error.message }));
}
