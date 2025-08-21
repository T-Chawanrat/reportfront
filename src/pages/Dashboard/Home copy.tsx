// import EcommerceMetrics from "../../components/ecommerce/EcommerceMetrics";
// import MonthlySalesChart from "../../components/ecommerce/MonthlySalesChart";
// import StatisticsChart from "../../components/ecommerce/StatisticsChart";
// import MonthlyTarget from "../../components/ecommerce/MonthlyTarget";
// import RecentOrders from "../../components/ecommerce/RecentOrders";
// import DemographicCard from "../../components/ecommerce/DemographicCard";
import PageMeta from "../../components/common/PageMeta";
import ProductWarehouseChart from "../../components/charts/ProductWarehouseChart";
import OntruckChart from "../../components/charts/OntruckChart";
import WarehouseStdChart from "../../components/charts/WarehouseStdChart";

export default function HomeCopy() {
  return (
    <>
      <PageMeta title="Trantech Report" description="Trantech Report" />
      <div className="grid grid-cols-12 gap-4 md:gap-2">
        <div className="col-span-12 space-y-6 xl:col-span-4">
          <ProductWarehouseChart />
        </div>

        <div className="col-span-12 xl:col-span-4">
          <OntruckChart />
        </div>

        <div className="col-span-12 xl:col-span-8">
          <WarehouseStdChart />
        </div>

        {/* <EcommerceMetrics /> */}
        {/* <div className="col-span-12 xl:col-span-5">
          <MonthlyTarget />
        </div>

        <div className="col-span-12">
          <StatisticsChart />
        </div>

        <div className="col-span-12 xl:col-span-5">
          <DemographicCard />
        </div>

        <div className="col-span-12 xl:col-span-7">
          <RecentOrders />
        </div> */}
      </div>
    </>
  );
}
