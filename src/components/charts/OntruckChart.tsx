// import Chart from "react-apexcharts";
// import { ApexOptions } from "apexcharts";
// import { MoreDotIcon } from "../../icons";
// import { useState, useEffect } from "react";
// import AxiosInstance from "../../utils/AxiosInstance";

// interface ApiResponse {
//   data: RouteData[];
// }

// interface RouteData {
//   route_type: string;
//   total_overdue: number;
// }

// export default function OntruckChart() {
//   const [windowWidth, setWindowWidth] = useState(0);
//   const [series, setSeries] = useState<{ name: string; data: number[] }[]>([
//     {
//       name: "เกินกำหนด",
//       data: [],
//     },
//   ]);
//   const [isOpen, setIsOpen] = useState(false);

//   useEffect(() => {
//     const handleResize = () => setWindowWidth(window.innerWidth);
//     handleResize();
//     window.addEventListener("resize", handleResize);
//     return () => window.removeEventListener("resize", handleResize);
//   }, []);

//   const options: ApexOptions = {
//     colors: ["#465fff"],
//     chart: {
//       fontFamily: "Sarabun, sans-serif",
//       type: "bar",
//       height: 180,
//       toolbar: { show: false },
//     },
//     plotOptions: {
//       bar: {
//         horizontal: false,
//         columnWidth: windowWidth < 768 ? "25%" : "18%", // responsive column width
//         borderRadius: 5,
//         borderRadiusApplication: "end",
//       },
//     },
//     dataLabels: {
//       enabled: true,
//       offsetX: 2,
//       style: {
//         fontSize: windowWidth < 768 ? "12px" : "12px",
//         fontWeight: "bold",
//       },
//     },
//     stroke: {
//       show: true,
//       width: 4,
//       colors: ["transparent"],
//     },
//     xaxis: {
//       categories: ["กทม → ตจว", "ตจว → กทม"],
//       axisBorder: { show: false },
//       axisTicks: { show: false },
//       labels: {
//         style: {
//           fontSize: windowWidth < 768 ? "13px" : "13px",
//         },
//       },
//     },
//     legend: {
//       show: true,
//       position: "top",
//       horizontalAlign: "left",
//       fontFamily: "Outfit",
//       fontSize: windowWidth < 768 ? "12px" : "12px",
//     },
//     yaxis: {
//       title: { text: undefined },
//       labels: {
//         style: {
//           fontSize: windowWidth < 768 ? "10px" : "10px",
//         },
//       },
//     },
//     grid: {
//       yaxis: { lines: { show: true } },
//     },
//     fill: { opacity: 1 },
//     tooltip: {
//       x: { show: false },
//       y: { formatter: (val: number) => `${val} ` },
//     },
//   };

//   const fetchData = async () => {
//     try {
//       const { data }: { data: ApiResponse } = await AxiosInstance.get("/dashboard04");

//       const categories = data.data.map((item) => item.route_type);
//       const values = data.data.map((item) => item.total_overdue);

//       options.xaxis!.categories = categories;

//       setSeries([
//         {
//           name: "เกินกำหนด",
//           data: values,
//         },
//       ]);
//     } catch (error) {
//       console.error("Error fetching data from API:", error);
//     }
//   };

//   useEffect(() => {
//     fetchData();
//   }, []);

//   function toggleDropdown() {
//     setIsOpen(!isOpen);
//   }

//   return (
//     <div className="font-thai overflow-hidden rounded-2xl border border-gray-200 bg-white px-3 pt-3 sm:px-5 sm:pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
//       <div className="flex items-center justify-between mb-2 sm:mb-0">
//         <h3 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-white/90">สินค้าบนรถขนย้าย</h3>
//         <div className="relative inline-block">
//           <button className="dropdown-toggle" onClick={toggleDropdown}>
//             <MoreDotIcon className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 size-5 sm:size-6" />
//           </button>
//         </div>
//       </div>

//       <div className="w-full overflow-hidden">
//         <div className="w-full">
//           <Chart options={options} series={series} type="bar" height={180} />
//         </div>
//       </div>
//     </div>
//   );
// }

import { MoreDotIcon } from "../../icons";
import { useState, useEffect } from "react";
import AxiosInstance from "../../utils/AxiosInstance";

interface ApiResponse {
  data: RouteData[];
}

interface RouteData {
  route_type: string;
  total_overdue: number;
}

export default function OntruckTable() {
  const [data, setData] = useState<RouteData[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const fetchData = async () => {
    try {
      const { data }: { data: ApiResponse } = await AxiosInstance.get("/dashboard04");
      setData(data.data);
    } catch (error) {
      console.error("Error fetching data from API:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  function toggleDropdown() {
    setIsOpen(!isOpen);
  }

  return (
    <div className="font-thai overflow-hidden rounded-2xl border border-gray-200 bg-white px-3 pt-3 sm:px-5 sm:pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
      <div className="flex items-center justify-between mb-2 sm:mb-0">
        <h3 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-white/90">
          สินค้าบนรถขนย้าย (เกินเวลา)
        </h3>
        <div className="relative inline-block">
          <button className="dropdown-toggle" onClick={toggleDropdown}>
            <MoreDotIcon className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 size-5 sm:size-6" />
          </button>
        </div>
      </div>

      <div className="w-full overflow-x-auto">
        <table className="w-full text-left border-collapse table-auto">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-700">
              <th className="px-4 py-2 text-gray-600 dark:text-gray-300">ประเภทรถขนย้าย</th>
              <th className="px-4 py-2 text-gray-600 dark:text-gray-300">เกินเวลา (กล่อง)</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr
                key={index}
                className={`border-t ${index % 2 === 0 ? "bg-gray-50 dark:bg-gray-800" : "bg-white dark:bg-gray-900"}`}
              >
                <td className="px-4 py-2 text-gray-800 dark:text-gray-200">{item.route_type}</td>
                <td className="px-4 py-2 text-gray-800 dark:text-gray-200">{item.total_overdue}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
