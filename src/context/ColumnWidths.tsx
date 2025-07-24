import React, { createContext, useState, useEffect, useContext } from "react";

// ประเภทของ Context
interface ColumnWidthsType {
  columnWidths: number[];
  setColumnWidths: React.Dispatch<React.SetStateAction<number[]>>;
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

  // บันทึก columnWidths ลงใน localStorage เมื่อมีการเปลี่ยนแปลง
  useEffect(() => {
    localStorage.setItem("columnWidths", JSON.stringify(columnWidths));
  }, [columnWidths]);

  // โหลดค่า columnWidths ที่บันทึกไว้ใน localStorage (ถ้ามี)
  useEffect(() => {
    const savedWidths = localStorage.getItem("columnWidths");
    if (savedWidths) {
      setColumnWidths(JSON.parse(savedWidths));
    }
  }, []);

  return (
    <ColumnWidths.Provider value={{ columnWidths, setColumnWidths }}>
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