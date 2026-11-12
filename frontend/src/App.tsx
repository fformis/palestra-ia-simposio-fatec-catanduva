import { BrowserRouter, Navigate, Route, Routes } from 'react-router'
import { AuthProvider } from './auth/AuthProvider'
import { RequireAuth } from './auth/RequireAuth'
import { AppLayout } from './layout/AppLayout'
import { PublicLayout } from './layout/PublicLayout'
import { DesignSystem } from './pages/DesignSystem'
import { Home } from './pages/Home'
import { ForgotPassword } from './pages/auth/ForgotPassword'
import { Login } from './pages/auth/Login'
import { Register } from './pages/auth/Register'
import { SetPassword } from './pages/auth/SetPassword'
import { Profile } from './pages/profile/Profile'
import { ThemeProvider } from './theme/ThemeProvider'

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<PublicLayout />}>
              <Route path="entrar" element={<Login />} />
              <Route path="criar-conta" element={<Register />} />
              <Route path="esqueci-senha" element={<ForgotPassword />} />
              <Route path="definir-senha" element={<SetPassword />} />
            </Route>
            <Route element={<RequireAuth />}>
              <Route element={<AppLayout />}>
                <Route index element={<Home />} />
                <Route path="perfil" element={<Profile />} />
                <Route path="design-system" element={<DesignSystem />} />
              </Route>
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}
