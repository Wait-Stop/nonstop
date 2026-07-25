import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import LoginRequired from "./components/LoginRequired";
import { LoginPage, SignupPage } from "./pages/AuthPages";
import { CommunityPage, RegionComparePage, RegionsPage } from "./pages/ExplorePages";
import HomePage from "./pages/HomePage";
import { MyPage, ProfileEditPage, SavedItemsPage } from "./pages/MyPage";
import { PoliciesPage, PolicyDetailPage } from "./pages/PolicyPages";
import { RecommendationsPage, RegionDetailPage } from "./pages/RecommendationPages";
import SimulationPage, { SimulationHubPage } from "./pages/SimulationPage";

export default function App() {
  return <Routes>
    <Route element={<Layout />}>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/login-required" element={<LoginRequired />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/recommendations" element={<RecommendationsPage />} />
      <Route path="/regions" element={<RegionsPage />} />
      <Route path="/regions/compare" element={<RegionComparePage />} />
      <Route path="/regions/:id" element={<RegionDetailPage />} />
      <Route path="/simulation" element={<SimulationHubPage />} />
      <Route path="/simulation/:type" element={<SimulationPage />} />
      <Route path="/policies" element={<PoliciesPage />} />
      <Route path="/policies/:id" element={<PolicyDetailPage />} />
      <Route path="/mypage" element={<MyPage />} />
      <Route path="/mypage/saved" element={<SavedItemsPage />} />
      <Route path="/mypage/profile" element={<ProfileEditPage />} />
      <Route path="/community" element={<CommunityPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Route>
  </Routes>;
}
