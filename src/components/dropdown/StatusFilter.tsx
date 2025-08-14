import React from "react";

interface StatusFilterProps {
  value: string; // ค่าที่เลือกใน Dropdown
  onChange: (value: string) => void; // ฟังก์ชันที่เรียกเมื่อเปลี่ยนค่า
}

const StatusFilter: React.FC<StatusFilterProps> = ({ value, onChange }) => {
  return (
    <div className="mb-2">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="border border-gray-300 rounded px-2 py-1 text-sm "
      >
        <option value="">ทั้งหมด</option>
        <option value="overtime">เกินเวลา</option>
        <option value="not_yet">ยังไม่ถึง</option>
      </select>
    </div>
  );
};

export default StatusFilter;