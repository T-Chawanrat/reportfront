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

export interface Transaction {
  tambon_id: string;
  zip_code: string;
  tambon: string;
  ampur: string;
  province: string;
  warehouse_name: string;
  Monday: string;
  Tuesday: string;
  Wednesday: string;
  Thursday: string;
  Friday: string;
  Saturday: string;
  Sunday: string;
  route_code: string;
  route_name: string;
  DC_Mapping: string;
  lastupdate: string;
}

const headers = [
  "รหัส",
  "รหัสไปรษณีย์",
  "ตำบล",
  "อำเภอ",
  "จังหวัด",
  "คลัง",
  "วันจันทร์",
  "วันอังคาร",
  "วันพุธ",
  "วันพฤหัสบดี",
  "วันศุกร์",
  "วันเสาร์",
  "วันอาทิตย์",
  "รหัสสายรถ",
  "ชื่อสายรถ",
  "พื้นที่รับผิดชอบ",
  "อัปเดตล่าสุด",
];

export default function Sla() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [page, setPage] = useState<number>(1);
  const [total, setTotal] = useState<number>(0);
  const limit = 20;
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTambon, setSearchTambon] = useState<string>("");
  const [searchAmpur, setSearchAmpur] = useState<string>("");
  const [searchProvince, setSearchProvince] = useState<string>("");
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
        search_tambon: searchTambon,
        search_ampur: searchAmpur,
        search_province: searchProvince,
      };

      const res = await AxiosInstance.get("/sla", { params });

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

  const handleDownload = async () => {
    setLoading(true);
    try {
      await ExportExcel({
        url: "/exportSla",
        filename: "SLA.xlsx",
      });
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [page, searchTambon, searchAmpur, searchProvince]);

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/signin", { replace: true });
    }
  }, [isLoggedIn, navigate]);

  return (
    <div className={`font-thai w-full ${loading ? "cursor-wait" : ""}`}>
      <div className="overflow-x-auto w-full">
        <div className="flex justify-between gap-1">
          <div className="flex gap-1 mb-2 mt-1">
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
          </div>
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
            <ResizableColumns headers={headers} pageKey="sla" />
            <tbody>
              {transactions.map((t, i) => (
                <tr key={crypto.randomUUID()} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                  <td className="px-4 py-2 border-b truncate max-w-xs">{t.tambon_id || "-"}</td>
                  <td className="px-4 py-2 border-b truncate max-w-xs">{t.zip_code || "-"}</td>
                  <td className="px-4 py-2 border-b truncate max-w-xs">{t.tambon || "-"}</td>
                  <td className="px-4 py-2 border-b truncate max-w-xs">{t.ampur || "-"}</td>
                  <td className="px-4 py-2 border-b truncate max-w-xs">{t.province || "-"}</td>
                  <td className="px-4 py-2 border-b truncate max-w-xs">{t.warehouse_name || "-"}</td>
                  <td className="px-4 py-2 border-b truncate max-w-xs">{t.Monday || "-"}</td>
                  <td className="px-4 py-2 border-b truncate max-w-xs">{t.Tuesday || "-"}</td>
                  <td className="px-4 py-2 border-b truncate max-w-xs">{t.Wednesday || "-"}</td>
                  <td className="px-4 py-2 border-b truncate max-w-xs">{t.Thursday || "-"}</td>
                  <td className="px-4 py-2 border-b truncate max-w-xs">{t.Friday || "-"}</td>
                  <td className="px-4 py-2 border-b truncate max-w-xs">{t.Saturday || "-"}</td>
                  <td className="px-4 py-2 border-b truncate max-w-xs">{t.Sunday || "-"}</td>
                  <td className="px-4 py-2 border-b truncate max-w-xs">{t.route_code || "-"}</td>
                  <td className="px-4 py-2 border-b truncate max-w-xs">{t.route_name || "-"}</td>
                  <td className="px-4 py-2 border-b truncate max-w-xs">{t.DC_Mapping || "-"}</td>
                  <td className="px-4 py-2 border-b truncate max-w-xs">
                    {" "}
                    {t.lastupdate ? format(new Date(t.lastupdate), "dd-MM-yyyy | HH:mm") : "-"}
                  </td>
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
