import React from 'react';
import './App.css';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { MainView } from './pages/MainView';
import { Todo } from './pages/Todo/Todo';
import { Header } from './components/Header';

function App() {
  // TODO Localで立ち上げられない問題に対処する
  return (
    <>
      <HashRouter>
        <Header />
        <Routes>
          <Route path='/' element={<MainView />} />
          <Route path='/todo' element={<Todo />} />
        </Routes>
      </HashRouter></>
  );
}

export default App;