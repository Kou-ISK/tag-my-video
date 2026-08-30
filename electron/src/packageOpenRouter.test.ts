import { describe, expect, it } from 'vitest';
import { createPackageOpenRouter, type PackageOpenSession } from './packageOpenRouter';

interface TestWindow {
  name: string;
}

interface TestSession extends PackageOpenSession<TestWindow> {
  id: string;
}

const createHarness = () => {
  const emptyWindow: TestWindow = { name: 'empty' };
  const emptySession: TestSession = {
    id: 'empty-session',
    mainWindow: emptyWindow,
    packagePath: null,
  };
  const sessions = new Map<string, TestSession>();
  sessions.set(emptySession.id, emptySession);
  const focused: string[] = [];
  const opened: string[] = [];
  let nextWindowId = 1;

  const router = createPackageOpenRouter<TestWindow, TestSession>({
    findByPath: (filePath) =>
      [...sessions.values()].find((session) => session.packagePath === filePath) ??
      null,
    findEmpty: () =>
      [...sessions.values()].find((session) => session.packagePath === null) ??
      null,
    createWindow: async () => ({ name: `new-${nextWindowId++}` }),
    reserve: (window, filePath) => {
      const duplicate = [...sessions.values()].find(
        (session) => session.packagePath === filePath,
      );
      if (duplicate) return duplicate;
      const session =
        [...sessions.values()].find((candidate) => candidate.mainWindow === window) ??
        ({ id: `session-${nextWindowId++}`, mainWindow: window, packagePath: null } satisfies TestSession);
      session.packagePath = filePath;
      sessions.set(session.id, session);
      return session;
    },
    focus: (session) => focused.push(session.id),
    sendOpen: (filePath, window) => opened.push(`${filePath}:${window.name}`),
  });

  return { emptySession, sessions, focused, opened, router };
};

describe('package open router', () => {
  it('reuses an empty session for the first package and creates windows for others', async () => {
    const harness = createHarness();

    await harness.router('a.stpkg');
    await harness.router('b.stpkg');

    expect(harness.opened).toEqual(['a.stpkg:empty', 'b.stpkg:new-1']);
    expect(harness.focused).toHaveLength(2);
  });

  it('focuses the existing session and does not send a duplicate open', async () => {
    const harness = createHarness();

    await harness.router('a.stpkg');
    await harness.router('a.stpkg');

    expect(harness.opened).toEqual(['a.stpkg:empty']);
    expect(harness.focused).toEqual(['empty-session', 'empty-session']);
  });

  it('keeps a reserved path authoritative when a request races', async () => {
    const emptyWindow = { name: 'empty' };
    const duplicateWindow = { name: 'duplicate' };
    const duplicateSession: TestSession = {
      id: 'duplicate-session',
      mainWindow: duplicateWindow,
      packagePath: 'a.stpkg',
    };
    const focused: TestSession[] = [];
    const opened: string[] = [];
    const router = createPackageOpenRouter<TestWindow, TestSession>({
      findByPath: () => null,
      findEmpty: () => ({ id: 'empty-session', mainWindow: emptyWindow, packagePath: null }),
      createWindow: async () => emptyWindow,
      reserve: () => duplicateSession,
      focus: (session) => focused.push(session),
      sendOpen: (filePath) => opened.push(filePath),
    });

    await router('a.stpkg');

    expect(focused).toEqual([duplicateSession]);
    expect(opened).toEqual([]);
  });
});
