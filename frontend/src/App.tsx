import { BrowserRouter, Route, Routes } from 'react-router'
import { AppLayout } from './layout/AppLayout'
import { DesignSystem } from './pages/DesignSystem'
import { Home } from './pages/Home'
import { ThemeProvider } from './theme/ThemeProvider'

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route index element={<Home />} />
            <Route path="design-system" element={<DesignSystem />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  )
}
