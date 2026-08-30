const { readFile } = require('node:fs/promises');
const { resolve } = require('node:path');

const targets = [
  'src/components/OnboardingTutorialView.tsx',
  'src/features/playlist/components/AnnotationToolbar.tsx',
];
const forbidden = [
  { expression: /#[0-9a-f]{3,8}\b/i, name: 'hex color' },
  { expression: /rgba?\(/i, name: 'rgb color' },
  { expression: /boxShadow:\s*\d+/, name: 'numeric box shadow' },
  { expression: /zIndex:\s*\d+/, name: 'numeric z-index' },
];

const run = async () => {
  const violations = [];
  for (const target of targets) {
    const content = await readFile(resolve(target), 'utf8');
    for (const rule of forbidden) {
      if (rule.expression.test(content)) violations.push(`${target}: ${rule.name}`);
    }
  }
  if (violations.length > 0) {
    console.error('Design system check failed:\n' + violations.join('\n'));
    process.exitCode = 1;
    return;
  }
  console.log('Design system check passed');
};

void run();
