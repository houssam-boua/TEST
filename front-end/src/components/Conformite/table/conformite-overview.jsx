import React, { useEffect, useState } from "react";
import { fetchConformiteOverview } from "../../../api/api";
import { Loading } from "../../common/Loading";
import { Link } from "react-router-dom";
import TableRow2 from "../../common/TableRow2";
import TableHeader2 from "../../common/TableHeader2";

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
import { Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const ConformiteOverview = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [chartData, setChartData] = useState(null);

  const [data, setData] = useState({
    administratifGeneral: [],
    countsConformityTypes: {},
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetchConformiteOverview();
        const { administratifGeneral = [], countsConformityTypes = {} } =
          response;

        setData({
          administratifGeneral: administratifGeneral,
          countsConformityTypes: countsConformityTypes,
        });
      } catch (error) {
        console.error("Error fetching conformite overview data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (data.administratifGeneral.length > 0) {
      const labels = data.administratifGeneral.map(
        (item) => item.admin_general_name || "Unknown"
      );

      setChartData({
        labels,
        datasets: [
          {
            label: "Conforme",
            data: data.countsConformityTypes.isConforme || [],
            backgroundColor: "green",
          },
          {
            label: "Non Conforme Majeur",
            data: data.countsConformityTypes.isNonConformeMaj || [],
            backgroundColor: "red",
          },
          {
            label: "Non Conforme Mineur",
            data: data.countsConformityTypes.isNonConformeMin || [],
            backgroundColor: "yellow",
          },
          {
            label: "Non Conforme",
            data: data.countsConformityTypes.isNonConforme || [],
            backgroundColor: "orange",
          },
        ],
      });
    }
  }, [data]);

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
    { field: "id", value: (val) => val || "N/A" }, // Plain value with fallback
    {
      field: "admin_general_name",
      value: (val) => val || "Unknown",
    }, // Plain value with fallback
    {
      field: "is_conforme_number",
      value: (_, rowIndex) =>
        data.countsConformityTypes.isConforme[rowIndex] || 0,
    }, // Index-based access with fallback
    {
      field: "is_nc_majeure_number",
      value: (_, rowIndex) =>
        data.countsConformityTypes.isNonConformeMaj[rowIndex] || 0,
    }, // Index-based access with fallback
    {
      field: "is_nc_mineure_number",
      value: (_, rowIndex) =>
        data.countsConformityTypes.isNonConformeMin[rowIndex] || 0,
    },
    {
      field: "is_non_conforme_number",
      value: (_, rowIndex) =>
        data.countsConformityTypes.isNonConforme[rowIndex] || 0,
    },
    {
      field: "id",
      value: (val) => (
        <Link
          to={`/actions/administratif/${val}`}
          className="link no-underline flex items-center"
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
        <div className="m-3 w-fit-content h-fit w-full rounded-sm border border-base-300/20">
          <Bar data={chartData} options={options} />
        </div>
        <div className="col-span-2">
          <table className="m-3 table table-xs rounded-sm border border-base-300/20">
            <thead className="text-pretty text-base-content">
              <TableHeader2
                columnLabels={[
                  "ID",
                  "Name",
                  "Conforme",
                  "Non Conforme Majeur",
                  "Non Conforme Mineur",
                  "Non Conforme",
                  "Details",
                ]}
              />
            </thead>
            <tbody>
              {data.administratifGeneral.map((item, index) => (
                <TableRow2
                  key={item.id || index}
                  rowData={{
                    ...item,
                    is_conforme_number:
                      data.countsConformityTypes.isConforme[index],
                    is_nc_majeure_number:
                      data.countsConformityTypes.isNonConformeMaj[index] || 0,
                    is_nc_mineure_number:
                      data.countsConformityTypes.isNonConformeMin[index] || 0,
                    is_non_conforme_number:
                      data.countsConformityTypes.isNonConforme[index] || 0,
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

export default ConformiteOverview;
