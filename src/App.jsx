import { Route, Routes } from 'react-router'
import Layout from './components/Layout.jsx'
import SplashScreen from './components/SplashScreen.jsx'
import About from './pages/About.jsx'
import ComingSoon from './pages/ComingSoon.jsx'
import Contact from './pages/Contact.jsx'
import Help from './pages/Help.jsx'
import Home from './pages/Home.jsx'
import Journey from './pages/Journey.jsx'
import NotFound from './pages/NotFound.jsx'
import Privacy from './pages/Privacy.jsx'
import Terms from './pages/Terms.jsx'

const upcoming = [
  ['assistant', 'المساعد الذكي'],
  ['content', 'المحتوى التوعوي'],
  ['journal', 'مذكراتي'],
  ['relaxation', 'تمارين الاسترخاء'],
  ['assessment', 'التقييمات الذاتية'],
  ['profile', 'ملفي الشخصي'],
  ['login', 'تسجيل الدخول'],
  ['register', 'إنشاء حساب'],
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
          {upcoming.map(([path, title]) => (
            <Route key={path} path={path} element={<ComingSoon title={title} />} />
          ))}
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </>
  )
}
