import { describe, expect, it } from 'vitest';

import { buildHelpHtml } from './helpDocument';

describe('buildHelpHtml', () => {
  it('renders a searchable, keyboard-accessible help reference', () => {
    const html = buildHelpHtml();

    expect(html).toContain('id="help-search"');
    expect(html).toContain('aria-label="ヘルプを検索"');
    expect(html).toContain('role="tablist"');
    expect(html).toContain('role="tabpanel"');
    expect(html).toContain('prefers-color-scheme: dark');
    expect(html).toContain('max-width: 720px');
    expect(html).toContain('showSection(navButtons[0]?.dataset.target)');
    expect(html).not.toContain('使い方ガイドへようこそ');
  });
});
