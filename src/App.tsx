import React from 'react';
import './App.css';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { MainView } from './pages/MainView';
import { TodoApp } from './pages/Todo/TodoApp';
import { Header } from './components/Header';

function App() {
  // TODO Localで立ち上げられない問題に対処する
  return (
    <>
      <HashRouter>
        <Header />
        <Routes>
          <Route path='/' element={<MainView />} />
          <Route path='/todo' element={<TodoApp />} />
        </Routes>
      </HashRouter></>
  );
}

export default App;