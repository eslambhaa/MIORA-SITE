import { Route, Routes } from 'react-router'
import GuestOnly from './auth/GuestOnly.jsx'
import RequireAuth from './auth/RequireAuth.jsx'
import Layout from './components/Layout.jsx'
import SplashScreen from './components/SplashScreen.jsx'
import About from './pages/About.jsx'
import ComingSoon from './pages/ComingSoon.jsx'
import Contact from './pages/Contact.jsx'
import ForgotPassword from './pages/ForgotPassword.jsx'
import Help from './pages/Help.jsx'
import Home from './pages/Home.jsx'
import Journey from './pages/Journey.jsx'
import Login from './pages/Login.jsx'
import NotFound from './pages/NotFound.jsx'
import Privacy from './pages/Privacy.jsx'
import Profile from './pages/Profile.jsx'
import Register from './pages/Register.jsx'
import ResetPassword from './pages/ResetPassword.jsx'
import Terms from './pages/Terms.jsx'

const upcoming = [
  ['assistant', 'المساعد الذكي'],
  ['content', 'المحتوى التوعوي'],
  ['relaxation', 'تمارين الاسترخاء'],
  ['assessment', 'التقييمات الذاتية'],
]

export default function App() {
  return (
    <>
      <SplashScreen />
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="help" element={<Help />} />
          <Route path="contact" element={<Contact />} />
          <Route path="privacy" element={<Privacy />} />
          <Route path="terms" element={<Terms />} />
          <Route path="journey" element={<Journey />} />
          <Route path="login" element={<GuestOnly><Login /></GuestOnly>} />
          <Route path="register" element={<GuestOnly><Register /></GuestOnly>} />
          <Route path="forgot-password" element={<GuestOnly><ForgotPassword /></GuestOnly>} />
          <Route path="reset-password" element={<ResetPassword />} />
          <Route path="profile" element={<RequireAuth><Profile /></RequireAuth>} />
          <Route path="content/:slug" element={<ComingSoon title="المقال" />} />
          <Route path="journal" element={<RequireAuth><ComingSoon title="مذكراتي" /></RequireAuth>} />
          {upcoming.map(([path, title]) => (
            <Route key={path} path={path} element={<ComingSoon title={title} />} />
          ))}
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </>
  )
}
