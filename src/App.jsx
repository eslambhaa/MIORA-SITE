import { lazy, useEffect } from 'react'
import { Route, Routes } from 'react-router'
import GuestOnly from './auth/GuestOnly.jsx'
import RequireAuth from './auth/RequireAuth.jsx'
import Layout from './components/Layout.jsx'
import SplashScreen from './components/SplashScreen.jsx'
import Home from './pages/Home.jsx'

// Every page except the home page loads on demand (smaller first download).
const pages = {
  About: () => import('./pages/About.jsx'),
  Article: () => import('./pages/Article.jsx'),
  Assessment: () => import('./pages/Assessment.jsx'),
  Assistant: () => import('./pages/Assistant.jsx'),
  Contact: () => import('./pages/Contact.jsx'),
  Content: () => import('./pages/Content.jsx'),
  ForgotPassword: () => import('./pages/ForgotPassword.jsx'),
  Help: () => import('./pages/Help.jsx'),
  Journal: () => import('./pages/Journal.jsx'),
  Journey: () => import('./pages/Journey.jsx'),
  Login: () => import('./pages/Login.jsx'),
  NotFound: () => import('./pages/NotFound.jsx'),
  Privacy: () => import('./pages/Privacy.jsx'),
  Profile: () => import('./pages/Profile.jsx'),
  Relaxation: () => import('./pages/Relaxation.jsx'),
  Register: () => import('./pages/Register.jsx'),
  ResetPassword: () => import('./pages/ResetPassword.jsx'),
  Terms: () => import('./pages/Terms.jsx'),
}

const About = lazy(pages.About)
const Article = lazy(pages.Article)
const Assessment = lazy(pages.Assessment)
const Assistant = lazy(pages.Assistant)
const Contact = lazy(pages.Contact)
const Content = lazy(pages.Content)
const ForgotPassword = lazy(pages.ForgotPassword)
const Help = lazy(pages.Help)
const Journal = lazy(pages.Journal)
const Journey = lazy(pages.Journey)
const Login = lazy(pages.Login)
const NotFound = lazy(pages.NotFound)
const Privacy = lazy(pages.Privacy)
const Profile = lazy(pages.Profile)
const Relaxation = lazy(pages.Relaxation)
const Register = lazy(pages.Register)
const ResetPassword = lazy(pages.ResetPassword)
const Terms = lazy(pages.Terms)

// Once the first page is ready and the browser is idle, fetch the other pages
// quietly so moving around the site is instant. Skipped on "data saver".
function usePrefetchPages() {
  useEffect(() => {
    if (navigator.connection?.saveData) return undefined
    const idle = window.requestIdleCallback ?? ((callback) => setTimeout(callback, 1500))
    const cancel = window.cancelIdleCallback ?? clearTimeout
    const handle = idle(() => Object.values(pages).forEach((load) => load().catch(() => {})), { timeout: 4000 })
    return () => cancel(handle)
  }, [])
}

export default function App() {
  usePrefetchPages()
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
