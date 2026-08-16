import { BrowserRouter, Link, Route, Routes } from 'react-router-dom'
import { HomePage } from './pages/HomePage'
import { VocabPage } from './pages/VocabPage'

export default function App() {
  return (
    <BrowserRouter>
      <div className="shell">
        <header className="site-header">
          <Link className="site-title" to="/">
            Learn English
          </Link>
        </header>
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/vocab" element={<VocabPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}
