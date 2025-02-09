import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import { fetchApplicabilityOverview } from "../../../api/api"; // Assuming this function exists

// Ensure you have the necessary imports for Chart.js (if not, install it)
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Loading } from "../../common/Loading";
import TableRow2 from "../../common/TableRow2";
import TableHeader2 from "../../common/TableHeader2";
import { Link } from "react-router-dom";

// Register the necessary Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const ApplicabiliteOverview = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [chartData, setChartData] = useState(null);

  const [data, setData] = useState({
    administratifGeneral: [],
    isApplicable: [],
    notApplicable: [],
  });

  // Fetch the data when the component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetchApplicabilityOverview();
        const { administratifGeneral, isApplicable, notApplicable } = response;
        setData({
          administratifGeneral,
          isApplicable,
          notApplicable,
        });
      } catch (error) {
        console.error("Error fetching applicability overview data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []); // Empty dependency array ensures this runs only once

  // Once the data is fetched, format it for Chart.js
  useEffect(() => {
    if (data.administratifGeneral.length > 0) {
      const labels = data.administratifGeneral.map(
        (item) => item.admin_general_name
      );
      const isApplicable = data.isApplicable;
      const notApplicable = data.notApplicable;

      setChartData({
        labels: labels,
        datasets: [
          {
            label: "Applicable",
            data: isApplicable,
            backgroundColor: "#696cff",
            borderColor: "#696cff",
          },
          {
            label: "Non Applicable",
            data: notApplicable,
            backgroundColor: "#c8d3d9",
            borderColor: "#c8d3d9",
          },
        ],
      });
    }
  }, [data]); // This effect runs when `data` is updated

  // If loading or no data, return loading state
  if (isLoading || !chartData) {
    return (
      <p>
        <Loading />
      </p>
    );
  }

  // Chart.js options
  const options = {
    responsive: true,
    scales: {
      x: {
        stacked: true,
      },
      y: {
        stacked: true,
      },
    },
  };

  const columns = [
    { field: "admin_general_name", value: (val) => val }, // Plain value
    {
      field: "isApplicable",
      value: (_, rowIndex) => data.isApplicable[rowIndex],
    }, // Index-based access
    {
      field: "notApplicable",
      value: (_, rowIndex) => data.notApplicable[rowIndex],
    }, // Index-based access
    {
      field: "id",
      value: (val) => (
        <Link
          to={`/conformite/create/${val}`}
          className="link link-primary no-underline flex items-center"
        >
          <button className="btn btn-xs btn-circle  outline-none text-primary hover:btn-primary">
            {/* See more */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM12.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM18.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
              />
            </svg>
          </button>
        </Link>
      ),
    }, // Custom JSX
  ];

  return (
    <>
      <div className="grid grid-cols-2 grid-rows-2 gap-2">
        <div className="m-3 w-fit-content h-fit  w-full rounded-sm border border-base-300/20 ">
          <Bar data={chartData} options={options} />
        </div>
        {/* <div className="m-3 w-fit-content h-fit  w-full rounded-sm border border-base-300/20 ">
          {" "}
          <Bar data={chartData} options={options} />
        </div> */}
        <div className="col-span-2">
          <table className="m-3 table table-xs rounded-sm border border-base-300/20">
            <thead className="text-pretty text-base-content">
              <TableHeader2
                columnLabels={[
                  "Name",
                  "Applicable",
                  "Non Applicable",
                  "Details",
                ]}
              />
            </thead>
            <tbody>
              {data.administratifGeneral.map((item, index) => (
                <TableRow2
                  key={item.id}
                  rowData={{
                    ...item,
                    isApplicable: data.isApplicable[index],
                    notApplicable: data.notApplicable[index],
                  }}
                  columns={columns.map((col) => ({
                    ...col,
                    value:
                      col.value && col.value instanceof Function
                        ? (rowData) => col.value(rowData, index)
                        : col.value,
                  }))}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default ApplicabiliteOverview;
