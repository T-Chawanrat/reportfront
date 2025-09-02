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
  warehouse_name: string;
  license_plate: string;
  tm_product_trucks_created_date: string;
  receive_code: string;
  serial_no: string;
  deadline_time: string;
  time_remaining_text: string;
  status_message: string;
}

interface OntruckV05_11Props {
  selectedWarehouseId: number | null;
}

const headers = [
  "คลังปัจจุบัน",
  "ทะเบียนรถ",
  "วันที่บิล",
  "ชื่อผู้รับ",
  "เลขที่บิล",
  "หมายเลขกล่อง",
  "ตำบล",
  "อำเภอ",
  "เวลาคืนคลัง",
  "เกินเวลา",
  "สถานะ",
];

export default function OntruckV05_11({ selectedWarehouseId }: OntruckV05_11Props) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [page, setPage] = useState<number>(1);
  const [total, setTotal] = useState<number>(0);
  const limit = 20;
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
        warehouse_id: selectedWarehouseId,
      };

      const res = await AxiosInstance.get("/05_11", { params });

      setTransactions(res.data.data || []);
      setTotal(res.data.total || 0);
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
    fetchTransactions();
  }, [page, selectedWarehouseId]);

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/signin", { replace: true });
    }
  }, [isLoggedIn, navigate]);

  return (
    <div className={`font-thai w-full ${loading ? "cursor-wait" : ""}`}>
      <div className="overflow-x-auto w-full">
        <h2 className="text-xl font-semibold mt-10">ไม่คืนคลัง</h2>
        <table className="w-full table-fixed border border-gray-300 rounded overflow-hidden">
          <ResizableColumns headers={headers} pageKey="v05_11" />
          <tbody>
            {transactions.map((t) => (
              <tr key={crypto.randomUUID()}>
                <td className="px-4 py-2 border-b truncate">{t.warehouse_name || "-"}</td>
                <td className="px-4 py-2 border-b truncate">{t.license_plate || "-"}</td>
                <td className="px-4 py-2 border-b truncate max-w-xs">
                  {" "}
                  {t.tm_product_trucks_created_date
                    ? format(new Date(t.tm_product_trucks_created_date), "dd-MM-yyyy | HH:mm")
                    : "-"}
                </td>
                <td className="px-4 py-2 border-b truncate max-w-xs">{t.receive_code || "-"}</td>
                <td className="px-4 py-2 border-b truncate max-w-xs">{t.serial_no || "-"}</td>
                <td className="px-4 py-2 border-b truncate max-w-xs">
                  {" "}
                  {t.deadline_time ? format(new Date(t.deadline_time), "dd-MM-yyyy | HH:mm") : "-"}
                </td>
                <td className="px-4 py-2 border-b truncate max-w-xs">{t.time_remaining_text || "-"}</td>
                <td className="px-4 py-2 border-b truncate max-w-xs">{t.status_message || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <Pagination
          page={page}
          pageCount={pageCount}
          onPageChange={(newPage) => {
            setPage(newPage);
          }}
          disabled={loading}
        />
      </div>

      {loading && (
        <div className="flex justify-center mt-4">
          <div className="loader"></div>
        </div>
      )}
      {error && <div className="text-red-600 text-center mt-4">{error}</div>}
    </div>
  );
}
