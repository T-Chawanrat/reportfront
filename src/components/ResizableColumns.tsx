import React, { useEffect } from "react";

interface ResizableColumnsProps {
  headers: string[]; // รายการชื่อหัวข้อคอลัมน์
  columnWidths: number[]; // ความกว้างเริ่มต้นของแต่ละคอลัมน์
  setColumnWidths: React.Dispatch<React.SetStateAction<number[]>>; // ฟังก์ชันสำหรับอัปเดตความกว้างของคอลัมน์
}

const ResizableColumns: React.FC<ResizableColumnsProps> = ({
  headers,
  columnWidths,
  setColumnWidths,
}) => {
  useEffect(() => {
    localStorage.setItem("columnWidths", JSON.stringify(columnWidths));
  }, [columnWidths]);

  useEffect(() => {
    const savedWidths = localStorage.getItem("columnWidths");
    if (savedWidths) {
      setColumnWidths(JSON.parse(savedWidths));
    }
  }, [setColumnWidths]);

  const handleMouseDown = (index: number, event: React.MouseEvent) => {
    const startX = event.clientX;
    const startWidth = columnWidths[index];

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const newWidth = Math.max(startWidth + deltaX, 50); // กำหนดความกว้างขั้นต่ำ 50px
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
            style={{ width: `${columnWidths[index]}px` }}
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
