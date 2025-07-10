import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
} from "react";

export interface UserType {
  user_id: string;
  username?: string;
}
interface AuthContextType {
  user: UserType | null;
  setUser: (user: UserType | null) => void;
  isLoggedIn: boolean;
  setIsLoggedIn: (val: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUserState] = useState<UserType | null>(null);
  const [isLoggedIn, setIsLoggedInState] = useState(
    () => localStorage.getItem("isLoggedIn") === "true"
  );

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUserState(JSON.parse(storedUser));
    }
  }, []);

  const setUser = (user: UserType | null) => {
    setUserState(user);
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
  };

  const setIsLoggedIn = (val: boolean) => {
    setIsLoggedInState(val);
    if (val) {
      localStorage.setItem("isLoggedIn", "true");
    } else {
      localStorage.removeItem("isLoggedIn");
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoggedIn, setUser, setIsLoggedIn }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
