import { useState, useEffect } from "react";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";
// import "../css/style.css";
// import FilterCustomerName from "../components/FilterCustomerName";
// import FilterDC from "../components/FilterDC";
import Pagination from "../components/Pagination";
import AxiosInstance from "../utils/AxiosInstance";
import EditLogModal from "../components/modal/EditLogModal";
import DoDetailModal from "../components/modal/DoDetailModal";

export interface Transaction {
  id?: number | string;
  resend_create_date?: string;
  resend_reason_detail?: string;
  remark?: string;
  create_date_1_2?: string;
  receive_code?: string;
  serial_no?: string;
  customer_name?: string;
  recipient_code?: string;
  to_warehouse?: string;
  package_name?: string;
  status_message?: string;
  from_warehouse?: string;
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

export default function DriverApp() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [search, setSearch] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [sortBy, setSortBy] = useState<string>("resend_create_date");
  const [order, setOrder] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState<number>(1);
  const [total, setTotal] = useState<number>(0);
  const limit = 14; // จำนวนรายการต่อหน้า
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const pageCount = Math.ceil(total / limit);
  // const [customerName, setCustomerName] = useState<string>("");
  // const [toWarehouse, setToWarehouse] = useState<string>("");
  const [remarkFilter, setRemarkFilter] = useState<"all" | "yes" | "no">("all");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalData, setModalData] = useState<
    Transaction | Transaction[] | null
  >(null);
  const [isDoDetailOpen, setIsDoDetailOpen] = useState(false);
  const [remarkInput, setRemarkInput] = useState("");
  const [leditRows, setLeditRows] = useState<LeditRow[]>([]);
  const [leditLoading, setLeditLoading] = useState(false);
  const [leditError, setLeditError] = useState<string | null>(null);

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
        // customer_name: customerName,
        // to_warehouse: toWarehouse,
        has_remark: remarkFilter,
      };

      const res = await AxiosInstance.get("/app", { params });
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

  const handleRemarkSubmit = () => {
    setRemarkInput("");
  };

  useEffect(() => {
    if (page > pageCount && pageCount > 0) {
      setPage(pageCount);
    } else {
      fetchTransactions();
    }

    // eslint-disable-next-line
  }, [
    search,
    selectedDate,
    page,
    sortBy,
    order,
    // customerName,
    // toWarehouse,
    pageCount,
    remarkFilter,
  ]);

  return (
    <div className={`w-full mx-auto ${loading ? "cursor-wait" : ""}`}>
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <input
          type="text"
          placeholder="ค้นหา (receive_code)"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-gray-300 rounded px-3 py-1 h-10 w-96 focus:outline-none focus:border-brand-500"
        />

        {/* <FilterCustomerName onSelect={setCustomerName} />
        <FilterDC onSelect={setToWarehouse} /> */}

        <DatePicker
          selected={selectedDate}
          onChange={(date: Date | null) => setSelectedDate(date)}
          dateFormat="yyyy-MM-dd"
          isClearable
          placeholderText="-- เลือกวันที่ --"
          className="border border-gray-300 rounded px-3 py-2"
        />

        <select
          className="px-4 py-2 rounded border border-gray-300 focus:outline-none focus:border-brand-500"
          value={remarkFilter}
          onChange={(e) =>
            setRemarkFilter(e.target.value as "all" | "yes" | "no")
          }
        >
          <option value="all">ทั้งหมด</option>
          <option value="yes">มีหมายเหตุ</option>
          <option value="no">ไม่มีหมายเหตุ</option>
        </select>
      </div>

      {/* ตารางข้อมูล */}
      <div className="overflow-x-auto">
        <table className="w-full table-fixed border border-gray-300 rounded overflow-hidden">
          <thead className="bg-gray-100">
            <tr>
              <th className="w-20 px-4 py-2 border-b text-left">Log</th>
              <th className="w-20 px-4 py-2 border-b text-left">DO detail</th>
              <th
                className={`w-60 px-4 py-2 border-b text-left text-brand-500 cursor-pointer
                ${sortBy === "resend_create_date" ? "bg-blue-100" : ""}`}
                onClick={() => handleSort("resend_create_date")}
              >
                create_date{" "}
                {sortBy === "resend_create_date" &&
                  (order === "asc" ? "▲" : "▼")}
              </th>
              <th
                className={`w-80 px-4 py-2 border-b text-left text-brand-500 cursor-pointer
                ${sortBy === "remark" ? "bg-blue-100" : ""}`}
                onClick={() => handleSort("remark")}
              >
                remark {sortBy === "remark" && (order === "asc" ? "▲" : "▼")}
              </th>
              <th className="w-40 px-4 py-2 border-b text-left">
                create_date_1_2
              </th>
              <th className="w-84 px-4 py-2 border-b text-left">
                receive_code
              </th>

              <th className="w-72 px-4 py-2 border-b text-left">
                customer_name
              </th>
              <th
                className={`w-60 px-4 py-2 border-b text-left text-brand-500 cursor-pointer
                ${sortBy === "to_warehouse" ? "bg-blue-100" : ""}`}
                onClick={() => handleSort("to_warehouse")}
              >
                to_warehouse{" "}
                {sortBy === "to_warehouse" && (order === "asc" ? "▲" : "▼")}
              </th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((t, i) => (
              <tr
                key={t.id ?? i}
                className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}
              >
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
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 20 20"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-4 h-4"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 8.25V6A2.25 2.25 0 0012.75 3.75h-5.5A2.25 2.25 0 005 6v2.25m10 0V14A2.25 2.25 0 0112.75 16.25h-5.5A2.25 2.25 0 015 14V8.25m10 0H5"
                      />
                    </svg>
                  </button>
                </td>
                <td className="px-4 py-2 border-b truncate">
                  <button
                    className="inline-flex gap-1 px-2.5 py-1.5 rounded text-xs bg-brand-500 hover:bg-brand-600 text-white font-medium shadow-sm transition focus:outline-none focus:ring-2 focus:ring-blue-300"
                    onClick={async () => {
                      setIsDoDetailOpen(true);
                      setModalData(t);
                      if (t.receive_code) {
                        await fetchLedit(String(t.receive_code));
                      } else {
                        setLeditRows([]);
                      }
                    }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-4 h-4"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                      />
                    </svg>
                  </button>
                </td>
                <td className="px-4 py-2 border-b truncate">
                  {t.resend_create_date
                    ? format(
                        new Date(t.resend_create_date),
                        "yyyy-MM-dd | HH:mm:ss"
                      )
                    : "-"}
                </td>

                <td className="px-4 py-2 border-b truncate max-w-xs">
                  {t.remark || "-"}
                </td>
                <td className="px-4 py-2 border-b truncate">
                  {t.create_date_1_2
                    ? format(new Date(t.create_date_1_2), "yyyy-MM-dd")
                    : "-"}
                </td>
                <td className="px-4 py-2 border-b truncate">
                  {t.receive_code || "-"}
                </td>
                <td className="px-4 py-2 border-b truncate">
                  {t.customer_name || "-"}
                </td>
                <td className="px-4 py-2 border-b truncate">
                  {t.to_warehouse || "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <EditLogModal
        isOpen={isModalOpen}
        onClose={closeModal}
        modalData={modalData}
        leditRows={leditRows}
        leditLoading={leditLoading}
        leditError={leditError}
        inputValue={remarkInput}
        onInputChange={setRemarkInput}
        onInputSubmit={handleRemarkSubmit}
      />

      <DoDetailModal
        isOpen={isDoDetailOpen}
        onClose={() => setIsDoDetailOpen(false)}
        modalData={modalData}
        leditLoading={leditLoading}
        leditError={leditError}
        transactions={transactions}
      />

      {loading && (
        <div className="flex justify-center mt-4">
          <div className="loader"></div>
        </div>
      )}
      {error && <div className="text-red-600 text-center mt-4">{error}</div>}

      {/* Pagination */}
      <Pagination
        page={page}
        pageCount={pageCount}
        onPageChange={setPage}
        disabled={loading}
      />
    </div>
  );
}
