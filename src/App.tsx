import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Current from './pages/Current'
import Forecast from './pages/Forecast'
import Historical from './pages/Historical'
import Marine from './pages/Marine'
import Location from './pages/Location'

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Current />} />
        <Route path="/forecast" element={<Forecast />} />
        <Route path="/historical" element={<Historical />} />
        <Route path="/marine" element={<Marine />} />
        <Route path="/location" element={<Location />} />
      </Routes>
    </Layout>
  )
}
