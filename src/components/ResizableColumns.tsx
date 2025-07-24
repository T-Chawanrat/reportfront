import React, { useEffect, useRef } from "react";
import { useColumnWidths } from "../context/ColumnWidths"; // ปรับ path ให้ถูกต้อง

interface ResizableColumnsProps {
  headers: string[];
  pageKey: string;
}

const ResizableColumns: React.FC<ResizableColumnsProps> = ({
  headers,
  pageKey,
}) => {
  const { columnWidths, setColumnWidths, setPageKey } = useColumnWidths();
  const isInitialized = useRef(false);

  // เปลี่ยน page key เมื่อ component mount หรือ pageKey เปลี่ยน
  useEffect(() => {
    if (!isInitialized.current) {
      setPageKey(pageKey);
      isInitialized.current = true;
    } else if (pageKey) {
      setPageKey(pageKey);
    }
  }, [pageKey, setPageKey]);

  const handleMouseDown = (index: number, event: React.MouseEvent) => {
    event.preventDefault();
    
    const startX = event.clientX;
    const startWidth = columnWidths[index];

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const newWidth = Math.max(startWidth + deltaX, 50);
      setColumnWidths((prevWidths) =>
        prevWidths.map((width, i) => (i === index ? newWidth : width))
      );
    };

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  return (
    <thead className="bg-gray-100">
      <tr>
        {headers.map((header, index) => (
          <th
            key={index}
            style={{ width: `${columnWidths[index] || 150}px` }}
            className="relative px-4 py-2 border-b text-left border-gray-200"
          >
            <div className="flex items-center justify-between">
              <span>{header}</span>
              <span
                className="absolute right-0 top-0 h-full w-1 bg-transparent cursor-col-resize border-r-1 border-gray-300"
                onMouseDown={(e) => handleMouseDown(index, e)}
              />
            </div>
          </th>
        ))}
      </tr>
    </thead>
  );
};

export default ResizableColumns;