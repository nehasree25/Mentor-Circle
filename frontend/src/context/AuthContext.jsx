import { createContext, useContext, useMemo, useState, useEffect } from "react";
import { authService } from "../services/authService";

const AuthContext = createContext(null);

const getStoredUser = () => {
  const raw = localStorage.getItem("auth_user");
  return raw ? JSON.parse(raw) : null;
};

const getStoredProfile = () => {
  const raw = localStorage.getItem("auth_profile");
  return raw ? JSON.parse(raw) : null;
};

const getStoredToken = () => localStorage.getItem("access_token");

export const AuthProvider = ({ children }) => {
  const [user, setUserState] = useState(getStoredUser);
  const [profile, setProfileState] = useState(getStoredProfile);
  const [accessToken, setAccessTokenState] = useState(getStoredToken);

  const fetchAndSetProfile = async () => {
    if (accessToken) {
      try {
        const profileData = await authService.userprofile.get();
        setProfileState(profileData);
        localStorage.setItem("auth_profile", JSON.stringify(profileData));
      } catch (err) {
        console.error("Failed to fetch profile:", err);
      }
    }
  };

  useEffect(() => {
    fetchAndSetProfile();
  }, [accessToken]);

  const setSession = async ({ user: nextUser, access, refresh }) => {
    if (access) localStorage.setItem("access_token", access);
    if (refresh) localStorage.setItem("refresh_token", refresh);
    if (nextUser) localStorage.setItem("auth_user", JSON.stringify(nextUser));

    setUserState(nextUser || null);
    setAccessTokenState(access || null);

    if (nextUser && access) {
      try {
        const profileData = await authService.userprofile.get();
        setProfileState(profileData);
        localStorage.setItem("auth_profile", JSON.stringify(profileData));
      } catch (error) {
        console.error("Failed to fetch profile on session set:", error);
      }
    }
  };

  const updateProfile = async (newProfile) => {
    setProfileState(newProfile);
    localStorage.setItem("auth_profile", JSON.stringify(newProfile));
  };

  const clearSession = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("auth_user");
    localStorage.removeItem("auth_profile");
    setUserState(null);
    setProfileState(null);
    setAccessTokenState(null);
  };

  const value = useMemo(
    () => ({
      user,
      profile,
      accessToken,
      isAuthenticated: Boolean(accessToken),
      setSession,
      clearSession,
      updateProfile,
    }),
    [user, profile, accessToken]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
