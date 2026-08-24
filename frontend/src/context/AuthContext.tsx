import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { api } from "../services/api";
import type { UserProfile } from "../types";

const TOKEN_KEY = "chungbuk-olgyeo-token";
const PROFILE_KEY = "chungbuk-olgyeo-profile";

const defaultProfile: UserProfile = {
  name: "", email: "", gender: "", currentRegion: "", age: "", major: "", job: "",
  salary: "", rent: "", deposit: "", transport: "", preferredRegions: [], recommendRegion: false,
};

interface AuthValue {
  isLoggedIn: boolean;
  profile: UserProfile;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, profile: UserProfile) => Promise<void>;
  logout: () => void;
  updateProfile: (profile: UserProfile) => Promise<void>;
}

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setLoggedIn] = useState(() => Boolean(localStorage.getItem(TOKEN_KEY)));
  const [profile, setProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem(PROFILE_KEY);
    return saved ? { ...defaultProfile, ...JSON.parse(saved) as UserProfile } : defaultProfile;
  });

  const saveProfile = (next: UserProfile) => {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(next));
    setProfile(next);
  };

  useEffect(() => {
    if (!isLoggedIn || profile.id) return;
    api.getMyProfile()
      .then((details) => saveProfile({ ...defaultProfile, ...profile, ...details }))
      .catch(() => undefined);
  }, [isLoggedIn, profile]);

  const value = useMemo<AuthValue>(() => ({
    isLoggedIn,
    profile,
    login: async (email, password) => {
      const user = await api.login(email, password);
      const details = await api.getMyProfile().catch(() => user);
      saveProfile({ ...defaultProfile, ...profile, ...details, id: String(details.id || user.id), email: user.email, name: user.name });
      setLoggedIn(true);
    },
    signup: async (email, password, nextProfile) => {
      await api.signup(email, password, nextProfile.name);
      await api.login(email, password);
      await api.updateMyProfile(nextProfile);
      const details = await api.getMyProfile();
      saveProfile({ ...nextProfile, id: String(details.id || "") });
      setLoggedIn(true);
    },
    logout: () => {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(PROFILE_KEY);
      setProfile(defaultProfile);
      setLoggedIn(false);
    },
    updateProfile: async (next) => {
      await api.updateMyProfile(next);
      saveProfile(next);
    },
  }), [isLoggedIn, profile]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside AuthProvider");
  return value;
}
