import React, { useState, useEffect } from 'react';
import './App.css';
import { VideoPlayerApp } from './pages/VideoPlayerApp';
import { SettingsPage } from './pages/SettingsPage';

type AppView = 'main' | 'settings';

function App() {
  const [currentView, setCurrentView] = useState<AppView>('main');

  useEffect(() => {
    // メニューから設定を開くイベントをリッスン
    const handleOpenSettings = () => {
      setCurrentView('settings');
    };

    globalThis.window.electronAPI?.onOpenSettings(handleOpenSettings);

    return () => {
      globalThis.window.electronAPI?.offOpenSettings(handleOpenSettings);
    };
  }, []);

  // 設定画面からメインに戻る用のカスタムイベント
  useEffect(() => {
    const handleBackToMain = () => {
      setCurrentView('main');
    };

    globalThis.addEventListener('back-to-main', handleBackToMain);

    return () => {
      globalThis.removeEventListener('back-to-main', handleBackToMain);
    };
  }, []);

  if (currentView === 'settings') {
    return <SettingsPage />;
  }

  return <VideoPlayerApp />;
}

export default App;
