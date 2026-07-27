import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import type { UserProfile } from "../types";

const STORAGE_KEY = "chungbuk-olgyeo-auth";

const defaultProfile: UserProfile = {
  name: "홍길동", email: "user@example.com", gender: "남성", currentRegion: "서울특별시",
  age: "30대", major: "공학계열", job: "IT·개발", salary: "3,600~4,500만원",
  rent: "60~80만원", deposit: "1,000~3,000만원", transport: "자가용", preferredRegions: ["청주시"], recommendRegion: false,
};

interface AuthValue {
  isLoggedIn: boolean;
  profile: UserProfile;
  login: () => void;
  logout: () => void;
  updateProfile: (profile: UserProfile) => void;
}

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setLoggedIn] = useState(() => localStorage.getItem(STORAGE_KEY) === "true");
  const [profile, setProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem("chungbuk-olgyeo-profile");
    return saved ? JSON.parse(saved) as UserProfile : defaultProfile;
  });
  const value = useMemo<AuthValue>(() => ({
    isLoggedIn,
    profile,
    login: () => { localStorage.setItem(STORAGE_KEY, "true"); setLoggedIn(true); },
    logout: () => { localStorage.removeItem(STORAGE_KEY); setLoggedIn(false); },
    updateProfile: (next) => { localStorage.setItem("chungbuk-olgyeo-profile", JSON.stringify(next)); setProfile(next); },
  }), [isLoggedIn, profile]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside AuthProvider");
  return value;
}
