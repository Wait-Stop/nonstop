import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import { LoginPage, SignupPage } from "./pages/AuthPages";
import HomePage from "./pages/HomePage";
import { RecommendationsPage } from "./pages/RecommendationPages";

export default function App() {
  return <Routes>
    <Route element={<Layout />}>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/recommendations" element={<RecommendationsPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Route>
  </Routes>;
}
