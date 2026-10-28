import { lazy, useEffect } from 'react'
import { Route, Routes } from 'react-router'
import GuestOnly from './auth/GuestOnly.jsx'
import RequireAdmin from './auth/RequireAdmin.jsx'
import RequireAuth from './auth/RequireAuth.jsx'
import Layout from './components/Layout.jsx'
import SplashScreen from './components/SplashScreen.jsx'
import Home from './pages/Home.jsx'

// Every page except the home page loads on demand (smaller first download).
const pages = {
  About: () => import('./pages/About.jsx'),
  Admin: () => import('./pages/Admin.jsx'),
  AdminArticles: () => import('./pages/AdminArticles.jsx'),
  AdminArticleEdit: () => import('./pages/AdminArticleEdit.jsx'),
  AdminMedia: () => import('./pages/AdminMedia.jsx'),
  AdminMediaEdit: () => import('./pages/AdminMediaEdit.jsx'),
  AdminMessages: () => import('./pages/AdminMessages.jsx'),
  AdminEmergency: () => import('./pages/AdminEmergency.jsx'),
  AdminStats: () => import('./pages/AdminStats.jsx'),
  AdminNotifications: () => import('./pages/AdminNotifications.jsx'),
  AdminBackup: () => import('./pages/AdminBackup.jsx'),
  ComingSoon: () => import('./pages/ComingSoon.jsx'),
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
  MediaPage: () => import('./pages/MediaPage.jsx'),
  NotFound: () => import('./pages/NotFound.jsx'),
  Notifications: () => import('./pages/Notifications.jsx'),
  Privacy: () => import('./pages/Privacy.jsx'),
  Profile: () => import('./pages/Profile.jsx'),
  Relaxation: () => import('./pages/Relaxation.jsx'),
  Register: () => import('./pages/Register.jsx'),
  ResetPassword: () => import('./pages/ResetPassword.jsx'),
  Terms: () => import('./pages/Terms.jsx'),
}

const About = lazy(pages.About)
const Admin = lazy(pages.Admin)
const AdminArticles = lazy(pages.AdminArticles)
const AdminArticleEdit = lazy(pages.AdminArticleEdit)
const AdminMedia = lazy(pages.AdminMedia)
const AdminMediaEdit = lazy(pages.AdminMediaEdit)
const AdminMessages = lazy(pages.AdminMessages)
const AdminEmergency = lazy(pages.AdminEmergency)
const AdminStats = lazy(pages.AdminStats)
const AdminNotifications = lazy(pages.AdminNotifications)
const AdminBackup = lazy(pages.AdminBackup)
const ComingSoon = lazy(pages.ComingSoon)
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
const MediaPage = lazy(pages.MediaPage)
const NotFound = lazy(pages.NotFound)
const Notifications = lazy(pages.Notifications)
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
          <Route path="addiction" element={<ComingSoon title="الوعي بالإدمان" />} />
          <Route path="admin" element={<RequireAdmin><Admin /></RequireAdmin>} />
          <Route path="admin/articles" element={<RequireAdmin><AdminArticles /></RequireAdmin>} />
          <Route path="admin/articles/new" element={<RequireAdmin><AdminArticleEdit key="new" isNew /></RequireAdmin>} />
          <Route path="admin/articles/:id" element={<RequireAdmin><AdminArticleEdit key="edit" /></RequireAdmin>} />
          <Route path="admin/media" element={<RequireAdmin><AdminMedia /></RequireAdmin>} />
          <Route path="admin/media/new" element={<RequireAdmin><AdminMediaEdit key="new" isNew /></RequireAdmin>} />
          <Route path="admin/media/:id" element={<RequireAdmin><AdminMediaEdit key="edit" /></RequireAdmin>} />
          <Route path="admin/messages" element={<RequireAdmin><AdminMessages /></RequireAdmin>} />
          <Route path="admin/emergency" element={<RequireAdmin><AdminEmergency /></RequireAdmin>} />
          <Route path="admin/stats" element={<RequireAdmin><AdminStats /></RequireAdmin>} />
          <Route path="admin/notifications" element={<RequireAdmin><AdminNotifications /></RequireAdmin>} />
          <Route path="admin/backup" element={<RequireAdmin><AdminBackup /></RequireAdmin>} />
          <Route path="notifications"element={<Notifications />} />
          <Route path="assessment" element={<Assessment />} />
          <Route path="relaxation" element={<Relaxation />} />
          <Route path="assistant" element={<Assistant />} />
          <Route path="content/podcast/:id" element={<MediaPage kind="podcast" />} />
          <Route path="content/video/:id" element={<MediaPage kind="video" />} />
          <Route path="content/:slug" element={<Article />} />
          <Route path="journal" element={<RequireAuth><Journal /></RequireAuth>} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </>
  )
}
