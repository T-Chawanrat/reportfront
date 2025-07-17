import { useState, useEffect } from "react";
import axios from "axios";
// import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Pagination from "../components/Pagination";
import AxiosInstance from "../utils/AxiosInstance";
import Button from "../components/ui/button/Button";
// import Input from "../components/form/input/InputField";
import { ExportExcel } from "../utils/ExportExcel";
import { FileDown, Loader2, Logs } from "lucide-react";

export interface Transaction {
  id?: number | string;
  Create_date_tm_resend?: string;
  detail?: string;
  remark?: string;
  DATETIME?: string;
  receive_code?: string;
  customer_name?: string;
  recipient_name?: string;
  warehouse_name?: string;
  reference_no?: string;
  Last_status_nameTH?: string;
  receive_business_id?: string;
}

export interface LeditRow {
  pk_id: number | string;
  create_date?: string;
  value_new?: string;
  column?: string;
  people_first_name?: string;
  people_last_name?: string;
  employee_first_name?: string;
  employee_last_name?: string;
  user_type?: string;
}

export default function AppRemark() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [search, setSearch] = useState<string>("");
  // const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  // const [sortBy, setSortBy] = useState<string>("Create_date___tm_resend");
  // const [order, setOrder] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState<number>(1);
  const [total, setTotal] = useState<number>(0);
  const limit = 17;
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

  const [newRemark, setNewRemark] = useState("");
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

  const { isLoggedIn, user } = useAuth();
  const navigate = useNavigate();

  // const [isReceiveCodeModalOpen, setIsReceiveCodeModalOpen] = useState(false);
  // const [modalReceiveCode, setModalReceiveCode] = useState<string | null>(null);

  const fetchTransactions = async () => {
    setLoading(true);
    setError(null);
    try {
      // const dateFilter = selectedDate ? format(selectedDate, "yyyy-MM-dd") : "";

      const params = {
        search,
        // sort_by: sortBy,
        // order,
        page,
        limit,
        // date: dateFilter,
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

  const fetchLedit = async (receive_id: string) => {
    setLeditLoading(true);
    setLeditError(null);
    try {
      const res = await AxiosInstance.get("/vledit", {
        params: { receive_id },
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

  // const handleSort = (key: string) => {
  //   if (sortBy === key) {
  //     setOrder(order === "asc" ? "desc" : "asc");
  //   } else {
  //     setSortBy(key);
  //     setOrder("asc");
  //   }
  //   setPage(1);
  // };

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
    // }, [search, selectedDate, page, sortBy, order, pageCount]);
  }, [search, page, pageCount]);

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/signin", { replace: true });
    }
  }, [isLoggedIn, navigate]);

  useEffect(() => {
    if (
      isModalOpen &&
      modalData &&
      !Array.isArray(modalData) &&
      modalData.receive_business_id
    ) {
      setLeditRows([]);
      setLeditLoading(true);
      fetchLedit(String(modalData.receive_business_id));
    }
  }, [isModalOpen, modalData]);

  // สำหรับ modal ใหม่ แสดง serial_no, customer_name, to_warehouse ตาม receive_code
  // const modalSerialList = modalReceiveCode
  //   ? transactions.filter((t) => t.receive_code === modalReceiveCode)
  //   : [];

  const handleDownload = async () => {
    setLoading(true);
    try {
      await ExportExcel({
        url: "/export01",
        filename: "App_Remark.xlsx",
      });
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddRemark = async () => {
    if (updateLoading) return;
    if (!newRemark.trim()) return;
    if (
      !modalData ||
      Array.isArray(modalData) ||
      !modalData.receive_business_id
    )
      return;

    setUpdateLoading(true);
    setUpdateError(null);
    try {
      await AxiosInstance.post("/update-remark", {
        in_receive_code: modalData.receive_code,
        in_user_id: String(user?.user_id),
        in_new_remark: newRemark,
      });

      setNewRemark("");
      fetchLedit(String(modalData.receive_business_id)); // refresh log

      // อัปเดต remark ใน modalData ทันที (ไม่ต้อง fetch ใหม่ ไม่ต้องปิด-เปิด modal)
      setModalData((prev) =>
        prev && !Array.isArray(prev) ? { ...prev, remark: newRemark } : prev
      );
      // ถ้าอยากให้ remark ในตารางหลักอัปเดตทันที (โดยไม่ fetch ทั้ง table)
      setTransactions((txs) =>
        txs.map((tx) =>
          tx.receive_code === modalData.receive_code
            ? { ...tx, remark: newRemark }
            : tx
        )
      );
    } catch (err) {
      setUpdateError((err as Error).message);
    } finally {
      setUpdateLoading(false);
    }
  };

  return (
    <div className={`font-thai w-full ${loading ? "cursor-wait" : ""}`}>
      <div className="flex items-center justify-between mb-2 gap-2">
        <div>
          <input
            type="text"
            placeholder="ค้นหา Do หรือ Ref"
            value={search}
            onChange={(e) => setSearch(e.target.value.trim())}
            className="border border-gray-300 rounded-lg px-3 py-1 h-9 w-85 md:w-lg focus:outline-none focus:border-brand-400 focus:ring-1 focus:ring-brand-400"
          />

          {/* <DatePicker
            selected={selectedDate}
            onChange={(date: Date | null) => setSelectedDate(date)}
            dateFormat="yyyy-MM-dd"
            isClearable
            placeholderText="-- เลือกวันที่ --"
            className="border border-gray-300 rounded px-3 py-2"
          /> */}
        </div>
        <button
          onClick={handleDownload}
          className="h-9 flex-shrink-0 inline-flex items-center gap-2 px-2 py-1 rounded-md bg-brand-500 hover:bg-brand-600 text-white font-medium shadow-sm transition focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FileDown />
          <span className="hidden md:inline">Export Excel</span>
        </button>
      </div>

      {/* ตารางข้อมูล */}
      <div className="overflow-x-auto w-full">
        <table className="w-full table-fixed border border-gray-300 rounded overflow-hidden">
          <thead className="bg-gray-100">
            <tr>
              <th className="w-15 px-4 py-2 border-b text-left">Log</th>
              <th className="w-40 px-4 py-2 border-b text-left">
                วันที่จากแอป
              </th>
              <th className="w-40 px-4 py-2 border-b text-left">หมายเหตุแอป</th>
              <th className="w-55 px-4 py-2 border-b text-left">หมายเหตุ</th>
              <th className="w-55 px-4 py-2 border-b text-left">เลขที่บิล</th>
              <th className="w-50 px-4 py-2 border-b text-left">
                เลขที่อ้างอิง
              </th>
              <th className="w-60 px-4 py-2 border-b text-left">เจ้าของงาน</th>
              <th className="w-55 px-4 py-2 border-b text-left">
                ชื่อผู้รับ
              </th>
              <th className="w-35 px-4 py-2 border-b text-left">คลังปลายทาง</th>
              <th className="w-55 px-4 py-2 border-b text-left">สถานะล่าสุด</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((t, i) => {
              return (
                <tr
                  key={t.id ?? i}
                  className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}
                >
                  {/* log modal เดิม */}
                  <td className="px-3 py-1 border-b truncate">
                    <button
                      className="inline-flex gap-1 px-1.5 py-1 rounded text-xs bg-brand-500 hover:bg-brand-600 text-white font-medium shadow-sm transition focus:outline-none focus:ring-2 focus:ring-blue-300"
                      onClick={async () => {
                        if (updateLoading) 
                        setIsModalOpen(true);
                        setModalData(t);
                      }}
                    >
                      <Logs size={23} />
                    </button>
                  </td>
                  <td className="py-1 border-b truncate">
                    {t.Create_date_tm_resend
                      ? format(
                          new Date(t.Create_date_tm_resend),
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
                  {/* ช่อง receive_code: เพิ่มปุ่ม modal ใหม่ เฉพาะแถวแรก */}
                  <td className="px-4 py-2 border-b truncate">
                    {t.receive_code}
                  </td>
                  <td className="px-4 py-2 border-b truncate">
                    {t.reference_no || "-"}
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
                    {t.recipient_name || "-"}
                  </td>
                  <td className="px-4 py-2 border-b truncate">
                    {t.warehouse_name || "-"}
                  </td>
                  <td className="px-4 py-2 border-b truncate">
                    {t.Last_status_nameTH || "-"}
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
          className="fixed inset-0 z-100000 flex items-center justify-center bg-white/30 backdrop-blur-sm"
          onClick={() => {
            if (updateLoading) return;
            closeModal();
          }}
        >
          <div
            className="bg-white p-6 rounded shadow-lg min-w-[320px] max-w-[90vw]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-base">
                ประวัติการแก้ไข (Edit Log)
                {modalData &&
                  !Array.isArray(modalData) &&
                  (modalData.receive_code || modalData.id) && (
                    <span className="ml-2 text-base text-gray-600 font-normal">
                      {modalData.receive_code ||
                        modalData.receive_business_id ||
                        modalData.id}
                    </span>
                  )}
              </h2>
              <button
                className="text-gray-500 hover:text-gray-900"
                onClick={() => {
                  if (updateLoading) return;
                  closeModal();
                }}
                disabled={updateLoading}
              >
                ×
              </button>
            </div>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                className="border px-2 py-1 h-9 rounded-md w-full focus:outline-none focus:border-brand-400 focus:ring-1 focus:ring-brand-400"
                value={newRemark}
                onChange={(e) => setNewRemark(e.target.value)}
                placeholder="กรอกหมายเหตุใหม่"
                disabled={updateLoading}
              />
              <Button
                variant="primary"
                size="sm"
                onClick={handleAddRemark}
                disabled={updateLoading || !newRemark.trim()}
                className="h-9 flex-shrink-0"
              >
                {updateLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  "เพิ่ม"
                )}
              </Button>
            </div>

            {updateLoading && (
              <div className="text-brand-500 py-2">กำลังบันทึกหมายเหตุ...</div>
            )}

            {updateError && (
              <div className="text-red-500 text-sm">{updateError}</div>
            )}

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
              <div className="max-h-96 overflow-y-auto">
                <table className="min-w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="border px-2 py-1">วันที่หมายเหตุ</th>
                      <th className="border px-2 py-1">หมายเหตุ</th>
                      <th className="border px-2 py-1">ช่องทางหมายเหตุ</th>
                      <th className="border px-2 py-1">ชื่อ</th>
                      <th className="border px-2 py-1">นามสกุล</th>
                      <th className="border px-2 py-1">ชื่อ</th>
                      <th className="border px-2 py-1">นามสกุล</th>
                      <th className="border px-2 py-1">ประเภทผู้ใช้</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.isArray(leditRows) && leditRows.length > 0 ? (
                      leditRows.map((i, idx) => (
                        <tr key={i.pk_id ?? idx}>
                          <td className="border px-2 py-1 truncate">
                            {i.create_date
                              ? format(
                                  new Date(i.create_date),
                                  "yyyy-MM-dd HH:mm:ss"
                                )
                              : "-"}
                          </td>
                          <td className="border px-2 py-1">
                            {i.value_new || "-"}
                          </td>
                          <td className="border px-2 py-1">
                            {i.column || "-"}
                          </td>
                          <td className="border px-2 py-1">
                            {i.people_first_name || "-"}
                          </td>
                          <td className="border px-2 py-1">
                            {i.people_last_name || "-"}
                          </td>
                          <td className="border px-2 py-1">
                            {i.employee_first_name || "-"}
                          </td>
                          <td className="border px-2 py-1">
                            {i.employee_last_name || "-"}
                          </td>
                          <td className="border px-2 py-1">
                            {i.user_type || "-"}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          className="border px-2 py-1 text-center"
                          colSpan={8}
                        >
                          ไม่มีข้อมูลการแก้ไข
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* modal ใหม่สำหรับ receive_code */}
      {/* {isReceiveCodeModalOpen && modalReceiveCode && (
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
      )} */}

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
