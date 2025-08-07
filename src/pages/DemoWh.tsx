import { useState, useEffect } from "react";
import axios from "axios";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Pagination from "../components/Pagination";
import AxiosInstance from "../utils/AxiosInstance";
import ResizableColumns from "../components/ResizableColumns";

export interface Transaction {
  id?: number;
  receive_code?: string;
  warehouse_name?: string;
  to_warehouse_name?: string;
  status_message?: string;
  close_datetime?: string;
  go_datetime?: string;
  license_plate?: string;
  truck_code?: string;
  status_message_web?: string;
  time_remaining_text?: string;
  serial_no?: string;
}

const headers = [
  "คลังต้นทาง",
  "คลังปลายทาง",
  "ทะเบียนรถ",
  "ใบปิดบรรทุก",
  "เวลาปิดบรรทุก",
  "เวลาปล่อยรถ",
  "สถานะ",
  "กำหนดเวลา",
  "เลขที่เอกสาร",
  "หมายเลขกล่อง",
  "สถานะสินค้า",
];

export default function DemoWh() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [page, setPage] = useState<number>(1);
  const [total, setTotal] = useState<number>(0);
  const limit = 18;
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const pageCount = Math.ceil(total / limit);
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();

  const fetchTransactions = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page,
        limit,
      };

      const res = await AxiosInstance.get("/04wh", { params });
      setTransactions(res.data.data2 || []);
      setTotal(res.data.total2 || 0);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err?.message || "เกิดข้อผิดพลาดในการโหลดข้อมูล");
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("เกิดข้อผิดพลาดในการโหลดข้อมูล");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (page > pageCount && pageCount > 0) {
      setPage(pageCount);
    } else {
      fetchTransactions();
    }
  }, [page, pageCount]);

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/signin", { replace: true });
    }
  }, [isLoggedIn, navigate]);

  return (
    <div className={`font-thai w-full ${loading ? "cursor-wait" : ""}`}>
      {/* ตารางข้อมูล */}
      <div className="overflow-x-auto w-full">
        <table className="w-full table-fixed border border-gray-300 rounded overflow-hidden">
          <ResizableColumns headers={headers} pageKey="Demo04" />
          <tbody>
            {transactions.map((t, i) => {
              return (
                <tr key={t.id ?? i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                  <td className="px-4 py-2 border-b truncate max-w-xs">{t.warehouse_name || "-"}</td>
                  <td className="px-4 py-2 border-b truncate max-w-xs">{t.to_warehouse_name || "-"}</td>
                  <td className="px-4 py-2 border-b truncate max-w-xs">{t.license_plate || "-"}</td>
                  <td className="px-4 py-2 border-b truncate max-w-xs">{t.truck_code || "-"}</td>
                  <td className="px-4 py-2 border-b truncate">
                    {t.close_datetime ? format(new Date(t.close_datetime), "dd-MM-yyyy | HH:mm") : "-"}
                  </td>
                  <td className="px-4 py-2 border-b truncate">
                    {t.go_datetime ? format(new Date(t.go_datetime), "dd-MM-yyyy | HH:mm") : "-"}
                  </td>
                  <td className="px-4 py-2 border-b truncate">{t.status_message_web || "-"}</td>
                  <td className="px-4 py-2 border-b truncate">{t.time_remaining_text || "-"}</td>
                  <td className="px-4 py-2 border-b truncate">{t.receive_code}</td>
                  <td className="px-4 py-2 border-b truncate">{t.serial_no || "-"}</td>
                  <td className="px-4 py-2 border-b truncate">{t.status_message || "-"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {loading && (
        <div className="flex justify-center mt-4">
          <div className="loader"></div>
        </div>
      )}
      {error && <div className="text-red-600 text-center mt-4">{error}</div>}

      <Pagination page={page} pageCount={pageCount} onPageChange={setPage} disabled={loading} />
    </div>
  );
}

