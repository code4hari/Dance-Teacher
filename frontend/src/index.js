import React from 'react';
import ReactDOM from 'react-dom/client';
import reportWebVitals from './reportWebVitals';
import Navbar from './components/Navbar';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from './pages/Home';
import Investors from './pages/Investors';
import PageNotFound from './pages/PageNotFound';
import Learn from './pages/game/Learn/Learn';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="danceteacher" element={
          <>
            <Navbar />
            <Home />
          </>
        } />
        <Route path="danceteacher/investors" element={<Investors />} />
        <Route path="danceteacher/learn" element={<Learn />} />
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);

reportWebVitals();
