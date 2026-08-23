import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AppFrame } from './components/AppFrame'
import { HomePage } from './pages/HomePage'
import { VocabPage } from './pages/VocabPage'

export default function App() {
  return (
    <BrowserRouter>
      <AppFrame>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/vocab" element={<VocabPage />} />
        </Routes>
      </AppFrame>
    </BrowserRouter>
  )
}
