import { BrowserRouter, Route, Routes } from 'react-router-dom'
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
          <Route path="/learn" element={<ContentPage />} />
          <Route path="/language" element={<LanguagePage />} />
        </Routes>
      </AppFrame>
    </BrowserRouter>
  )
}
