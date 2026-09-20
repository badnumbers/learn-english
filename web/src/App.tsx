import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppFrame } from './components/AppFrame'
import { ContentPage } from './pages/ContentPage'
import { HomePage } from './pages/HomePage'
import { LanguagePage } from './pages/LanguagePage'

export default function App() {
  return (
    <BrowserRouter>
      <AppFrame>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/p" element={<ContentPage />} />
          <Route path="/vocab" element={<ContentPage />} />
          <Route path="/conversation" element={<Navigate to="/p" replace />} />
          <Route path="/language" element={<LanguagePage />} />
        </Routes>
      </AppFrame>
    </BrowserRouter>
  )
}
