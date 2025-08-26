import { useState, useEffect } from "react";
import axios from "axios";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Pagination from "../components/Pagination";
import AxiosInstance from "../utils/AxiosInstance";
import ResizableColumns from "../components/ResizableColumns";
// import StatusFilter from "../components/dropdown/StatusFilter";

export interface Transaction {
  receive_code?: string;
  serial_no?: string;
  status_message?: string;
  go_datetime?: string | null;
  datetime?: string;
  username?: string;
  license_plate?: string;
  name?: string;
  truck_code?: string;
  is_close?: boolean | string;
  is_completed?: boolean | string;
  status?: string;
  warehouse_name?: string;
  to_warehouse_id?: string;
  is_go?: boolean | string;
  close_datetime?: string | null;
  arrived_datetime?: string | null;
  is_deleted?: boolean | string;
  w6_num_min?: number | string;
  deadline_time?: string;
  time_remaining?: string;
  minutes_remaining?: number;
  status_message_web?: string;
  time_remaining_text?: string;
  truck_create_date?: string;
  product_truck_created_date?: string;
}

export interface Detail {
  truck_load_id?: string;
  receive_code?: string;
  serial_no?: string;
  datetime?: string;
  status_message?: string;
}

const headers = [
  "tm_product_trucks.created_date",
  "receive_code",
  "serial_no",
  "status_message",
  "datetime",
  "username",
  "license_plate",
  "name",
  "tm_trucks.create_date",
  "truck_code",
  "is_close",
  "is_complete",
  "status",
  "warehouse_name",
  "to_warehouse_id",
  "is_go",
  "close_datetime",
  "go_datetime",
  "arrived_datetime",
  "is_delete",
  "w6_num_min",
  "time_remaining",
  "minutes_remaining",
  "status_message_web",
  "time_remaining_text",
];

export default function OntruckV05() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  // const [selectedTruckId, setSelectedTruckId] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [total, setTotal] = useState<number>(0);
  // const [statusFilter, setStatusFilter] = useState<string>("");
  // const [selectedDetails, setSelectedDetails] = useState<Detail[]>([]);
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
        // statusFilter,
      };

      const res = await AxiosInstance.get("/05", { params });

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

  // const fetchDetails = async (truck_load_id: string) => {
  //   setSelectedTruckId(truck_load_id);
  //   try {
  //     const res = await AxiosInstance.get(`/05detail/${truck_load_id}`);

  //     setSelectedDetails(res.data.data || []);
  //   } catch (err) {
  //     console.error("Error fetching details:", err);
  //     setSelectedDetails([]);
  //   }
  // };

  // const handleRowClick = (truck_load_id: string | undefined) => {
  //   if (!truck_load_id) return;

  //   console.log("Clicked truck_load_id:", truck_load_id);

  //   fetchDetails(truck_load_id);
  // };

  // const resetSelection = () => {
  //   setSelectedDetails([]);
  //   setSelectedTruckId(null);
  // };

  useEffect(() => {
    fetchTransactions();
    // resetSelection();
  }, [page]);
  // }, [page, statusFilter]);

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/signin", { replace: true });
    }
  }, [isLoggedIn, navigate]);

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

  console.log(transactions, "transactions");

  return (
    <div className={`font-thai w-full ${loading ? "cursor-wait" : ""}`}>
      <div className="flex flex-col lg:grid lg:grid-cols-10 gap-4">
        {/* ฝั่ง 80% */}
        <div className="lg:col-span-12">
          {/* <StatusFilter
            value={statusFilter}
            onChange={(newFilter) => {
              setStatusFilter(newFilter);
              setPage(1);
              resetSelection();
            }}
          /> */}

          <div className="overflow-x-auto w-full">
            <table className="w-full table-fixed border border-gray-300 rounded overflow-hidden">
              <ResizableColumns headers={headers} pageKey="OntruckV05" />
              <tbody>
                {transactions.map((t) => (
                  <tr
                  // key={crypto.randomUUID()}
                  // className={`cursor-pointer hover:bg-blue-100 transition-colors ${
                  //   selectedTruckId === t.truck_load_id
                  //     ? "bg-brand-100 border-l-4 border-brand-500"
                  //     : "even:bg-white odd:bg-gray-50"
                  // }`}
                  // onClick={() => handleRowClick(t.truck_load_id)}
                  >
                    <td className="px-4 py-2 border-b truncate max-w-xs">{t.product_truck_created_date || "-"}</td>
                    <td className="px-4 py-2 border-b truncate max-w-xs">{t.receive_code || "-"}</td>
                    <td className="px-4 py-2 border-b truncate max-w-xs">{t.serial_no || "-"}</td>
                    <td className="px-4 py-2 border-b truncate max-w-xs">{t.status_message || "-"}</td>
                    <td className="px-4 py-2 border-b truncate">
                      {t.datetime ? format(new Date(t.datetime), "dd-MM-yyyy | HH:mm") : "-"}
                    </td>
                    <td className="px-4 py-2 border-b truncate">{t.username || "-"}</td>
                    <td className="px-4 py-2 border-b truncate">{t.license_plate || "-"}</td>
                    <td className="px-4 py-2 border-b truncate">{t.name || "-"}</td>
                    <td className="px-4 py-2 border-b truncate">{t.truck_create_date || "-"}</td>
                    <td className="px-4 py-2 border-b truncate">{t.truck_code || "-"}</td>
                    <td className="px-4 py-2 border-b truncate">{t.is_close || "-"}</td>
                    <td className="px-4 py-2 border-b truncate">{t.is_completed || "-"}</td>
                    <td className="px-4 py-2 border-b truncate">{t.status || "-"}</td>
                    <td className="px-4 py-2 border-b truncate">{t.warehouse_name || "-"}</td>
                    <td className="px-4 py-2 border-b truncate">{t.to_warehouse_id || "-"}</td>
                    <td className="px-4 py-2 border-b truncate">{t.is_go || "-"}</td>
                    <td className="px-4 py-2 border-b truncate">{t.close_datetime || "-"}</td>
                    <td className="px-4 py-2 border-b truncate">{t.go_datetime || "-"}</td>
                    <td className="px-4 py-2 border-b truncate">{t.arrived_datetime || "-"}</td>
                    <td className="px-4 py-2 border-b truncate">{t.is_deleted || "-"}</td>
                    <td className="px-4 py-2 border-b truncate">{t.w6_num_min || "-"}</td>
                    <td className="px-4 py-2 border-b truncate">{t.deadline_time || "-"}</td>
                    <td className="px-4 py-2 border-b truncate">{t.time_remaining || "-"}</td>
                    <td className="px-4 py-2 border-b truncate">{t.minutes_remaining || "-"}</td>
                    <td className="px-4 py-2 border-b truncate">{t.status_message_web || "-"}</td>
                    <td className="px-4 py-2 border-b truncate">{t.time_remaining_text || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Pagination
              page={page}
              pageCount={pageCount}
              onPageChange={(newPage) => {
                setPage(newPage);
                // resetSelection();
              }}
              disabled={loading}
            />
          </div>
        </div>

        {/* ฝั่ง 20% */}
        {/* <div className="lg:col-span-2 rounded bg-gray-50">
          {selectedDetails && selectedDetails.length > 0 ? (
            <ul className="space-y-1 h-64 lg:h-[calc(100vh-10rem)] overflow-y-auto">
              {selectedDetails.map((t) => (
                <li key={crypto.randomUUID()} className="p-3 border border-gray-200 rounded bg-white shadow-sm">
                  <p className="text-sm">
                    <span className="font-medium">{t.receive_code || "-"}</span>
                  </p>
                  <p className="text-sm font-semibold text-brand-600">SN: {t.serial_no || "-"}</p>
                  <p className="text-sm">
                    <span className="font-medium">{t.status_message || "-"}</span>
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {t.datetime ? format(new Date(t.datetime), "dd-MM-yyyy | HH:mm") : "-"}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">คลิกแถวเพื่อดูรายละเอียด</p>
            </div>
          )}
        </div> */}
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
