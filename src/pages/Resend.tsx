import { useState, useEffect } from "react";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Pagination from "../components/Pagination";
import AxiosInstance from "../utils/AxiosInstance";
import Button from "../components/ui/button/Button";
import Input from "../components/form/input/InputField";
import { ExportExcel } from "../utils/ExportExcel";
import { FileDown, Logs } from "lucide-react";

export interface Transaction {
  id?: number | string;
  Create_date___tm_resend?: string;
  detail?: string;
  remark?: string;
  DATETIME?: string;
  receive_code?: string;
  serial_no?: string;
  customer_name?: string;
  recipient_name?: string;
  warehouse_name?: string;
  package_name?: string;
  datetime?: string;
  update_date?: string;
}

export interface LeditRow {
  pk_id: number | string;
  create_date?: string;
  value_new?: string;
  column?: string;
  first_name?: string;
  last_name?: string;
}

export default function Resend() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [search, setSearch] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [sortBy, setSortBy] = useState<string>("Create_date___tm_resend");
  const [order, setOrder] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState<number>(1);
  const [total, setTotal] = useState<number>(0);
  const limit = 25;
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const pageCount = Math.ceil(total / limit);

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalData, setModalData] = useState<
    Transaction | Transaction[] | null
  >(null);
  const [leditRows, setLeditRows] = useState<LeditRow[]>([]);
  const [leditLoading, setLeditLoading] = useState(false);
  const [leditError, setLeditError] = useState<string | null>(null);
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();

  const [isReceiveCodeModalOpen, setIsReceiveCodeModalOpen] = useState(false);
  const [modalReceiveCode, setModalReceiveCode] = useState<string | null>(null);

  const fetchTransactions = async () => {
    setLoading(true);
    setError(null);
    try {
      const dateFilter = selectedDate ? format(selectedDate, "yyyy-MM-dd") : "";

      const params = {
        search,
        sort_by: sortBy,
        order,
        page,
        limit,
        date: dateFilter,
      };

      const res = await AxiosInstance.get("/01", { params });
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

  const fetchLedit = async (receive_code: string) => {
    setLeditLoading(true);
    setLeditError(null);
    try {
      const res = await AxiosInstance.get("/ledit", {
        params: { receive_code },
      });
      setLeditRows(res.data.data || []);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setLeditError(err?.message || "เกิดข้อผิดพลาดในการโหลด log แก้ไข");
      } else if (err instanceof Error) {
        setLeditError(err.message);
      } else {
        setLeditError("เกิดข้อผิดพลาดในการโหลด log แก้ไข");
      }
      setLeditRows([]);
    } finally {
      setLeditLoading(false);
    }
  };

  const handleSort = (key: string) => {
    if (sortBy === key) {
      setOrder(order === "asc" ? "desc" : "asc");
    } else {
      setSortBy(key);
      setOrder("asc");
    }
    setPage(1);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalData(null);
  };

  useEffect(() => {
    if (page > pageCount && pageCount > 0) {
      setPage(pageCount);
    } else {
      fetchTransactions();
    }
    // eslint-disable-next-line
  }, [search, selectedDate, page, sortBy, order, pageCount]);

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/signin", { replace: true });
    }
  }, [isLoggedIn, navigate]);

  // สำหรับ modal ใหม่ แสดง serial_no, customer_name, to_warehouse ตาม receive_code
  const modalSerialList = modalReceiveCode
    ? transactions.filter((t) => t.receive_code === modalReceiveCode)
    : [];

  const handleDownload = async () => {
    try {
      await ExportExcel({
        url: "/export",
        filename: "รายงานremark.xlsx",
      });
    } catch (err) {
      alert((err as Error).message);
    }
  };

  return (
    <div className={`w-full mx-auto ${loading ? "cursor-wait" : ""}`}>
      <div className="flex flex-col md:flex-row gap-4 mb-4 font-thai">
        <Input
          type="text"
          placeholder="ค้นหา (receive_code)"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-gray-300 rounded px-3 py-1 h-10 w-lg "
        />

        <DatePicker
          selected={selectedDate}
          onChange={(date: Date | null) => setSelectedDate(date)}
          dateFormat="yyyy-MM-dd"
          isClearable
          placeholderText="-- เลือกวันที่ --"
          className="border border-gray-300 rounded px-3 py-2"
        />
        <Button
          variant="primary"
          size="sm"
          onClick={handleDownload}
          className="h-10"
        >
          <FileDown />
          Export Excel
        </Button>
      </div>

      {/* ตารางข้อมูล */}
      <div className="overflow-x-auto">
        <table className="w-full table-fixed border border-gray-300 rounded overflow-hidden font-thai">
          <thead className="bg-gray-100">
            <tr>
              <th className="w-20 px-4 py-2 border-b text-left">Log</th>
              <th
                className={`w-60 px-4 py-2 border-b text-left text-brand-500 cursor-pointer
                ${sortBy === "Create_date___tm_resend" ? "bg-blue-100" : ""}`}
                onClick={() => handleSort("Create_date___tm_resend")}
              >
                วันที่กดแอพ{" "}
                {sortBy === "Create_date___tm_resend" &&
                  (order === "asc" ? "▲" : "▼")}
              </th>
              <th className="w-60 px-4 py-2 border-b text-left">รายละเอียด</th>
              <th className="w-80 px-4 py-2 border-b text-left">หมายเหตุ</th>
              <th className="w-40 px-4 py-2 border-b text-left">
                วันที่สร้างบิล
              </th>
              <th className="w-84 px-4 py-2 border-b text-left">
                เลขที่บิล (receive_code)
              </th>
              <th className="w-72 px-4 py-2 border-b text-left">ชื่อผู้ส่ง</th>
              <th className="w-72 px-4 py-2 border-b text-left">คลังปลายทาง</th>
            </tr>
          </thead>
          <tbody className="font-thai">
            {transactions.map((t, i) => {
              return (
                <tr
                  key={t.id ?? i}
                  className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}
                >
                  {/* log modal เดิม */}
                  <td className="px-4 py-2 border-b truncate">
                    <button
                      className="inline-flex gap-1 px-2.5 py-1.5 rounded text-xs bg-brand-500 hover:bg-brand-600 text-white font-medium shadow-sm transition focus:outline-none focus:ring-2 focus:ring-blue-300"
                      onClick={async () => {
                        setIsModalOpen(true);
                        setModalData(t);
                        if (t.receive_code) {
                          await fetchLedit(String(t.receive_code));
                        } else {
                          setLeditRows([]);
                        }
                      }}
                    >
                      <Logs />
                    </button>
                  </td>
                  <td className="px-4 py-2 border-b truncate">
                    {t.Create_date___tm_resend
                      ? format(
                          new Date(t.Create_date___tm_resend),
                          "yyyy-MM-dd | HH:mm:ss"
                        )
                      : "-"}
                  </td>
                  <td className="px-4 py-2 border-b truncate max-w-xs">
                    {t.detail || "-"}
                  </td>
                  <td className="px-4 py-2 border-b truncate max-w-xs">
                    {t.remark || "-"}
                  </td>
                  <td className="px-4 py-2 border-b truncate">
                    {t.DATETIME
                      ? format(new Date(t.DATETIME), "yyyy-MM-dd")
                      : "-"}
                  </td>
                  {/* ช่อง receive_code: เพิ่มปุ่ม modal ใหม่ เฉพาะแถวแรก */}
                  <td className="px-4 py-2 border-b truncate">
                    {t.receive_code}
                  </td>
                  {/* <td className="px-4 py-2 border-b truncate">
                    <button
                      className="text-brand-500 hover:text-brand-600 underline"
                      onClick={() => {
                        setModalReceiveCode(t.receive_code ?? null);
                        setIsReceiveCodeModalOpen(true);
                      }}
                    >
                      {t.receive_code}
                    </button>
                  </td> */}
                  <td className="px-4 py-2 border-b truncate">
                    {t.customer_name || "-"}
                  </td>
                  <td className="px-4 py-2 border-b truncate">
                    {t.warehouse_name || "-"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* modal log เดิม */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-white/30 backdrop-blur-sm font-thai"
          onClick={closeModal}
        >
          <div
            className="bg-white p-6 rounded shadow-lg min-w-[320px] max-w-[90vw]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">
                ประวัติการแก้ไข (Edit Log)
                {modalData &&
                  !Array.isArray(modalData) &&
                  (modalData.receive_code || modalData.id) && (
                    <span className="ml-2 text-base text-gray-600 font-normal">
                      {modalData.receive_code || modalData.id}
                    </span>
                  )}
              </h2>
              <button
                className="text-gray-500 hover:text-gray-900"
                onClick={closeModal}
              >
                ×
              </button>
            </div>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                className="border px-2 py-1 rounded-md w-full"
              />
              {/* <button className="bg-brand-500 text-white px-2 rounded-md">
                เพิ่ม
              </button> */}
              <Button variant="primary" size="sm">
                เพิ่ม
              </Button>
            </div>

            {/* ตารางข้อมูล log การแก้ไข */}
            <div className="overflow-x-auto">
              {leditLoading && (
                <div className="text-brand-500 py-2">
                  กำลังโหลด log แก้ไข...
                </div>
              )}
              {leditError && (
                <div className="text-red-500 py-2">{leditError}</div>
              )}

              <table className="min-w-full border-collapse">
                <thead>
                  <tr>
                    <th className="border px-2 py-1">create_date</th>
                    <th className="border px-2 py-1">value_new</th>
                    <th className="border px-2 py-1">column</th>
                    <th className="border px-2 py-1">first_name</th>
                    <th className="border px-2 py-1">last_name</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.isArray(leditRows) && leditRows.length > 0 ? (
                    leditRows.map((item, idx) => (
                      <tr key={item.pk_id ?? idx}>
                        <td className="border px-2 py-1">
                          {item.create_date || "-"}
                        </td>
                        <td className="border px-2 py-1">
                          {item.value_new || "-"}
                        </td>
                        <td className="border px-2 py-1">
                          {item.column || "-"}
                        </td>
                        <td className="border px-2 py-1">
                          {item.first_name || "-"}
                        </td>
                        <td className="border px-2 py-1">
                          {item.last_name || "-"}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className="border px-2 py-1 text-center" colSpan={5}>
                        ไม่มีข้อมูลการแก้ไข
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* modal ใหม่สำหรับ receive_code */}
      {isReceiveCodeModalOpen && modalReceiveCode && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-white/30 backdrop-blur-sm"
          onClick={() => {
            setIsReceiveCodeModalOpen(false);
            setModalReceiveCode(null);
          }}
        >
          <div
            className="bg-white p-6 rounded shadow-lg min-w-[320px] max-w-[90vw]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">
                รายการใน receive_code:{" "}
                <span className="ml-2 text-base text-gray-600 font-normal">
                  {modalReceiveCode}
                </span>
              </h2>
              <button
                className="text-gray-500 hover:text-gray-900 text-xl ml-3"
                onClick={() => {
                  setIsReceiveCodeModalOpen(false);
                  setModalReceiveCode(null);
                }}
              >
                ×
              </button>
            </div>
            <table className="min-w-full border-collapse border">
              <thead>
                <tr>
                  <th className="border px-2 py-1">serial_no</th>
                  <th className="border px-2 py-1">package_name</th>
                </tr>
              </thead>
              <tbody>
                {modalSerialList.length > 0 ? (
                  modalSerialList.map((item, idx) => (
                    <tr key={item.serial_no ?? idx}>
                      <td className="border px-2 py-1">
                        {item.serial_no || "-"}
                      </td>
                      <td className="border px-2 py-1">
                        {item.package_name || "-"}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="border px-2 py-1 text-center" colSpan={3}>
                      ไม่มีข้อมูล
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {loading && (
        <div className="flex justify-center mt-4">
          <div className="loader"></div>
        </div>
      )}
      {error && <div className="text-red-600 text-center mt-4">{error}</div>}

      <Pagination
        page={page}
        pageCount={pageCount}
        onPageChange={setPage}
        disabled={loading}
      />
    </div>
  );
}
