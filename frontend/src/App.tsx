import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import { LoginPage, SignupPage } from "./pages/AuthPages";
import { RegionComparePage, RegionsPage } from "./pages/ExplorePages";
import HomePage from "./pages/HomePage";
import { RecommendationsPage, RegionDetailPage } from "./pages/RecommendationPages";

export default function App() {
  return <Routes>
    <Route element={<Layout />}>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/recommendations" element={<RecommendationsPage />} />
      <Route path="/regions" element={<RegionsPage />} />
      <Route path="/regions/compare" element={<RegionComparePage />} />
      <Route path="/regions/:id" element={<RegionDetailPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Route>
  </Routes>;
}
