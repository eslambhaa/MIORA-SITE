import { lazy } from 'react'
import { Route, Routes } from 'react-router'
import GuestOnly from './auth/GuestOnly.jsx'
import RequireAuth from './auth/RequireAuth.jsx'
import Layout from './components/Layout.jsx'
import SplashScreen from './components/SplashScreen.jsx'
import Home from './pages/Home.jsx'

// Every page except the home page loads on demand (smaller first download).
const About = lazy(() => import('./pages/About.jsx'))
const Article = lazy(() => import('./pages/Article.jsx'))
const Assessment = lazy(() => import('./pages/Assessment.jsx'))
const Assistant = lazy(() => import('./pages/Assistant.jsx'))
const Contact = lazy(() => import('./pages/Contact.jsx'))
const Content = lazy(() => import('./pages/Content.jsx'))
const ForgotPassword = lazy(() => import('./pages/ForgotPassword.jsx'))
const Help = lazy(() => import('./pages/Help.jsx'))
const Journal = lazy(() => import('./pages/Journal.jsx'))
const Journey = lazy(() => import('./pages/Journey.jsx'))
const Login = lazy(() => import('./pages/Login.jsx'))
const NotFound = lazy(() => import('./pages/NotFound.jsx'))
const Privacy = lazy(() => import('./pages/Privacy.jsx'))
const Profile = lazy(() => import('./pages/Profile.jsx'))
const Relaxation = lazy(() => import('./pages/Relaxation.jsx'))
const Register = lazy(() => import('./pages/Register.jsx'))
const ResetPassword = lazy(() => import('./pages/ResetPassword.jsx'))
const Terms = lazy(() => import('./pages/Terms.jsx'))

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
          <Route path="content" element={<Content />} />
          <Route path="assessment" element={<Assessment />} />
          <Route path="relaxation" element={<Relaxation />} />
          <Route path="assistant" element={<Assistant />} />
          <Route path="content/:slug" element={<Article />} />
          <Route path="journal" element={<RequireAuth><Journal /></RequireAuth>} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </>
  )
}
