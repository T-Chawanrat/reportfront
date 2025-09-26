import { useState, useEffect } from "react";
import axios from "axios";
import "react-datepicker/dist/react-datepicker.css";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Pagination from "../components/Pagination";
import AxiosInstance from "../utils/AxiosInstance";
import ResizableColumns from "../components/ResizableColumns";
import { format } from "date-fns";
import { FileDown } from "lucide-react";
import { ExportExcel } from "../utils/ExportExcel";

export interface Vtg7d {
  vgt_reference: string;
  tt_do: string;
  box_serial: string;
  booking_no: string;
  shipper_name: string;
  origin_dc: string;
  origin_province: string;
  recipient_name: string;
  recipient_province: string;
  destination_dc: string;
  truck_license: string | null;
  pickup_employee_first_name: string | null;
  pickup_employee_last_name: string | null;
  pickup_employee_phone: string | null;
  tt_status: string;
  tt_status_date: string;
  tt_status_time: string;
  report_generated_at: string;
  status_id: number;
  book_is_deleted: string;
  receive_is_deleted: string;
  book_is_deleted_text: string;
  receive_is_deleted_text: string;
}

const headers = [
  "อ้างอิง VGT",
  "DO TT",
  "BOX",
  "BOOKING NO",
  "ชื่อผู้ส่ง",
  "DC ต้นทาง",
  "จังหวัดต้นทาง",
  "ชื่อผู้รับ",
  "จังหวัดผู้รับ",
  "DC ต้นปลายทาง",
  "ทะเบียนรถ",
  "ชื่อพนักงานเข้ารับ",
  "นามสกุลพนักงานเข้ารับ",
  "เบอร์โทรศัพท์",
  "สถานะ",
  "วันที่สถานะ TT",
  "เวลาสถานะ TT",
  "date_time_report",
  // "status_id",
  // "books_is_deleted",
  // "receives_is_deleted",
  // "books_is_deleted_text",
  // "receives_is_deleted_text",
];

export default function Vtg7d() {
  const [vtg7d, setVtg7d] = useState<Vtg7d[]>([]);
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
      };

      const res = await AxiosInstance.get("/7d", { params });

      setVtg7d(res.data.data || []);
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

  const handleDownload = async () => {
    setLoading(true);
    try {
      await ExportExcel({
        url: "/exportVtg7d",
        filename: "Vtg7d.xlsx",
      });
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [page]);

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/signin", { replace: true });
    }
  }, [isLoggedIn, navigate]);

  return (
    <div className={`font-thai w-full ${loading ? "cursor-wait" : ""}`}>
      <div className="overflow-x-auto w-full">
        <div className="flex justify-end gap-1">
          {/* <div className="flex gap-1 mb-2 mt-1">
            <input
              type="text"
              placeholder="ค้นหาตำบล"
              value={searchTambon}
              onChange={(e) => setSearchTambon(e.target.value.trim())}
              className="border border-gray-300 rounded-lg ml-1 px-3 py-1 h-9 w-full md:w-85 focus:outline-none focus:border-brand-400 focus:ring-1 focus:ring-brand-400"
            />
            <input
              type="text"
              placeholder="ค้นหาอำเภอ"
              value={searchAmpur}
              onChange={(e) => setSearchAmpur(e.target.value.trim())}
              className="border border-gray-300 rounded-lg px-3 py-1 h-9 w-full md:w-85 focus:outline-none focus:border-brand-400 focus:ring-1 focus:ring-brand-400"
            />
            <input
              type="text"
              placeholder="ค้นหาจังหวัด"
              value={searchProvince}
              onChange={(e) => setSearchProvince(e.target.value.trim())}
              className="border border-gray-300 rounded-lg px-3 py-1 h-9 w-full md:w-85 focus:outline-none focus:border-brand-400 focus:ring-1 focus:ring-brand-400"
            />
          </div> */}
          <div>
            <button
              onClick={handleDownload}
              className="h-9 flex-shrink-0 inline-flex items-center gap-2 px-2 py-1 rounded-md bg-brand-500 hover:bg-brand-600 text-white font-medium shadow-sm transition focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              <FileDown />
              <span className="hidden md:inline">Export Excel</span>
            </button>
          </div>
        </div>
        <div className="overflow-x-auto w-full">
          <table className="w-full table-fixed border border-gray-300 rounded overflow-hidden">
            <ResizableColumns headers={headers} pageKey="vtg7d" />
            <tbody>
              {vtg7d.map((t, i) => (
                <tr key={crypto.randomUUID()} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                  <td className="px-4 py-2 border-b truncate max-w-xs">{t.vgt_reference || "-"}</td>
                  <td className="px-4 py-2 border-b truncate max-w-xs">{t.tt_do || "-"}</td>
                  <td className="px-4 py-2 border-b truncate max-w-xs">{t.box_serial || "-"}</td>
                  <td className="px-4 py-2 border-b truncate max-w-xs">{t.booking_no || "-"}</td>
                  <td className="px-4 py-2 border-b truncate max-w-xs">{t.shipper_name || "-"}</td>
                  <td className="px-4 py-2 border-b truncate max-w-xs">{t.origin_dc || "-"}</td>
                  <td className="px-4 py-2 border-b truncate max-w-xs">{t.origin_province || "-"}</td>
                  <td className="px-4 py-2 border-b truncate max-w-xs">{t.recipient_name || "-"}</td>
                  <td className="px-4 py-2 border-b truncate max-w-xs">{t.recipient_province || "-"}</td>
                  <td className="px-4 py-2 border-b truncate max-w-xs">{t.destination_dc || "-"}</td>
                  <td className="px-4 py-2 border-b truncate max-w-xs">{t.truck_license || "-"}</td>
                  <td className="px-4 py-2 border-b truncate max-w-xs">{t.pickup_employee_first_name || "-"}</td>
                  <td className="px-4 py-2 border-b truncate max-w-xs">{t.pickup_employee_last_name || "-"}</td>
                  <td className="px-4 py-2 border-b truncate max-w-xs">{t.pickup_employee_phone || "-"}</td>
                  <td className="px-4 py-2 border-b truncate max-w-xs">{t.tt_status || "-"}</td>
                  <td className="px-4 py-2 border-b truncate max-w-xs">
                    {" "}
                    {t.tt_status_date ? format(new Date(t.tt_status_date), "dd-MM-yyyy") : "-"}
                  </td>
                  <td className="px-4 py-2 border-b truncate max-w-xs">{t.tt_status_time || "-"}</td>
                  <td className="px-4 py-2 border-b truncate max-w-xs">
                    {" "}
                    {t.report_generated_at ? format(new Date(t.report_generated_at), "dd-MM-yyyy | HH:mm") : "-"}
                  </td>
                  {/* <td className="px-4 py-2 border-b truncate max-w-xs">{t.status_id || "-"}</td>
                  <td className="px-4 py-2 border-b truncate max-w-xs">{t.book_is_deleted || "-"}</td>
                  <td className="px-4 py-2 border-b truncate max-w-xs">{t.receive_is_deleted || "-"}</td>
                  <td className="px-4 py-2 border-b truncate max-w-xs">{t.book_is_deleted_text || "-"}</td>
                  <td className="px-4 py-2 border-b truncate max-w-xs">{t.receive_is_deleted_text || "-"}</td> */}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
