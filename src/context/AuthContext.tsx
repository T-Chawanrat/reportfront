import React, { createContext, useState, useContext, ReactNode } from "react";

// 1. ประกาศ type สำหรับ context
interface AuthContextType {
  isLoggedIn: boolean;
  setIsLoggedIn: (val: boolean) => void;
}

// 2. สร้าง context โดยกำหนด type
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 3. สร้าง provider พร้อม type ของ children
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // อ่านค่าเริ่มต้นจาก localStorage
  const [isLoggedIn, setIsLoggedInState] = useState(
    () => localStorage.getItem("isLoggedIn") === "true"
  );

  // ฟังก์ชัน setIsLoggedIn ที่ sync กับ localStorage
  const setIsLoggedIn = (val: boolean) => {
    setIsLoggedInState(val);
    if (val) {
      localStorage.setItem("isLoggedIn", "true");
    } else {
      localStorage.removeItem("isLoggedIn");
    }
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, setIsLoggedIn }}>
      {children}
    </AuthContext.Provider>
  );
};

// 4. custom hook สำหรับใช้งาน context (พร้อม throw error ถ้าอยู่นอก provider)
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}