export interface PackageOpenSession<Window> {
  mainWindow: Window;
  packagePath: string | null;
}

export interface PackageOpenRouterDependencies<Window, Session extends PackageOpenSession<Window>> {
  findByPath: (filePath: string) => Session | null;
  findEmpty: () => Session | null;
  createWindow: () => Promise<Window>;
  reserve: (window: Window, filePath: string) => Session;
  focus: (session: Session) => void;
  sendOpen: (filePath: string, window: Window) => void;
  closeUnusedWindow?: (window: Window) => void;
}

/** Route one package open request without replacing another package session. */
export const createPackageOpenRouter = <
  Window,
  Session extends PackageOpenSession<Window>,
>(
  dependencies: PackageOpenRouterDependencies<Window, Session>,
): ((filePath: string) => Promise<void>) => {
  return async (filePath: string): Promise<void> => {
    const existing = dependencies.findByPath(filePath);
    if (existing) {
      dependencies.focus(existing);
      return;
    }

    const reusable = dependencies.findEmpty();
    const targetWindow = reusable?.mainWindow ?? (await dependencies.createWindow());
    const reserved = dependencies.reserve(targetWindow, filePath);
    if (reserved.mainWindow !== targetWindow) {
      dependencies.focus(reserved);
      if (reusable && reusable !== reserved) {
        dependencies.closeUnusedWindow?.(reusable.mainWindow);
      }
      return;
    }

    dependencies.focus(reserved);
    dependencies.sendOpen(filePath, targetWindow);
  };
};
