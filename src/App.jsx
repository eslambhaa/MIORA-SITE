import { Route, Routes } from 'react-router'
import Placeholder from './pages/Placeholder.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Placeholder />} />
    </Routes>
  )
}
