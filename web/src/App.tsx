import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AppFrame } from './components/AppFrame'
import { HomePage } from './pages/HomePage'
import { LanguagePage } from './pages/LanguagePage'
import { VocabPage } from './pages/VocabPage'

export default function App() {
  return (
    <BrowserRouter>
      <AppFrame>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/vocab" element={<VocabPage />} />
          <Route path="/language" element={<LanguagePage />} />
        </Routes>
      </AppFrame>
    </BrowserRouter>
  )
}
