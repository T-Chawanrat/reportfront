import React, { createContext, useState, useEffect, useContext, useCallback } from "react";

// ประเภทของ Context
interface ColumnWidthsType {
  columnWidths: number[];
  setColumnWidths: React.Dispatch<React.SetStateAction<number[]>>;
  setPageKey: (pageKey: string) => void;
}

// สร้าง Context
const ColumnWidths = createContext<ColumnWidthsType | undefined>(
  undefined
);

// Component Provider
export const ColumnWidthsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [columnWidths, setColumnWidths] = useState<number[]>(
    new Array(10).fill(150) // ค่าเริ่มต้นของแต่ละคอลัมน์
  );
  const [currentPageKey, setCurrentPageKey] = useState<string>("default");

  // ฟังก์ชันสำหรับเปลี่ยน page และโหลดค่า column widths ของ page นั้น
  const setPageKey = useCallback((pageKey: string) => {
    // ถ้าเป็น page เดียวกัน ไม่ต้องทำอะไร
    if (pageKey === currentPageKey) return;
    
    // บันทึกค่าปัจจุบันก่อนเปลี่ยน page
    localStorage.setItem(`columnWidths_${currentPageKey}`, JSON.stringify(columnWidths));
    
    // โหลดค่า column widths ของ page ใหม่
    const savedWidths = localStorage.getItem(`columnWidths_${pageKey}`);
    if (savedWidths) {
      try {
        const parsedWidths = JSON.parse(savedWidths);
        setColumnWidths(parsedWidths);
      } catch (error) {
        console.error('Error parsing saved column widths:', error);
        setColumnWidths(new Array(10).fill(150));
      }
    } else {
      // ถ้าไม่มีค่าที่บันทึกไว้ ให้ใช้ค่าเริ่มต้น
      setColumnWidths(new Array(10).fill(150));
    }
    
    // เปลี่ยน page key หลังจากโหลดค่าแล้ว
    setCurrentPageKey(pageKey);
  }, [currentPageKey, columnWidths]);

  // บันทึก columnWidths ลงใน localStorage เมื่อมีการเปลี่ยนแปลง
  useEffect(() => {
    if (currentPageKey !== "default") { // ไม่บันทึกค่าเริ่มต้น
      localStorage.setItem(`columnWidths_${currentPageKey}`, JSON.stringify(columnWidths));
    }
  }, [columnWidths, currentPageKey]);

  return (
    <ColumnWidths.Provider value={{ columnWidths, setColumnWidths, setPageKey }}>
      {children}
    </ColumnWidths.Provider>
  );
};

// Hook สำหรับใช้ Context
export const useColumnWidths = () => {
  const context = useContext(ColumnWidths);
  if (context === undefined) {
    throw new Error("useColumnWidths must be used within a ColumnWidthsProvider");
  }
  return context;
};