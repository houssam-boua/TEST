import React, { useEffect, useState } from "react";
import {
  fetchActionsByPriorityOverview,
  fetchActionsByStatusOverview,
} from "../../../api/api";
import TableHeader2 from "../../common/TableHeader2";
import TableRow2 from "../../common/TableRow2";
import { Line } from "react-chartjs-2";

const ActionTable = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [statusData, setStatusData] = useState({
    administratifGeneral: [],
    statusCounts: {},
  });

  const [priorityData, setPriorityData] = useState({
    administratifGeneral: [],
    priorityCounts: {},
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetchActionsByStatusOverview();
        const { administratifGeneral, statusCounts } = response;
        setStatusData({
          administratifGeneral,
          statusCounts,
        });
        console.log(statusData);
      } catch (error) {
        console.error("Error fetching applicability overview data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchPriorityData = async () => {
      try {
        const response = await fetchActionsByPriorityOverview();
        const { administratifGeneral, priorityCounts } = response;
        setPriorityData({
          administratifGeneral,
          priorityCounts,
        });
      } catch (error) {
        console.error("Error fetching priority overview data:", error);
      }
    };
    fetchPriorityData();
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const columns = [
    { field: "admin_general_name", label: "Nom" },
    {
      field: "ouvert",
      value: (_, rowIndex) => statusData.statusCounts.ouvert[rowIndex], // Custom rendering for "ouvert"
      label: "Ouvert",
    },
    {
      field: "encours",
      value: (_, rowIndex) => statusData.statusCounts.encours[rowIndex] || 0, // Custom rendering for "encours"
      label: "En cours",
    },
    {
      field: "cloture",
      value: (_, rowIndex) => statusData.statusCounts.cloture[rowIndex] || 0, // Custom rendering for "cloture"
      label: "Cloturé",
    },
    {
      field: "rejete",
      value: (_, rowIndex) => statusData.statusCounts.rejete[rowIndex] || 0, // Custom rendering for "rejete"
      label: "Rejeté",
    },
    {
      field: "reouvert",
      value: (_, rowIndex) => statusData.statusCounts.reouvert[rowIndex] || 0, // Custom rendering for "reouvert"
      label: "Réouvert",
    },
  ];

  const PriorityColumns = [
    { field: "admin_general_name", label: "Nom" },
    {
      field: "Majeur",
      label: "Majeur",
      value: (_, rowIndex) => priorityData.priorityCounts.Majeur[rowIndex] || 0,
    },
    {
      field: "Moyen",
      label: "Moyen",
      value: (_, rowIndex) => priorityData.priorityCounts.Moyen[rowIndex] || 0,
    },
    {
      field: "Mineur",
      label: "Mineur",
      value: (_, rowIndex) => priorityData.priorityCounts.Mineur[rowIndex] || 0,
    },
  ];

  // Extract data for the Line Chart
  const labels = statusData.administratifGeneral.map(
    (item) => item.admin_general_name
  ); // X-axis labels
  const ouvert = statusData.statusCounts.ouvert || [];
  const encours = statusData.statusCounts.encours || [];
  const cloture = statusData.statusCounts.cloture || [];
  const rejete = statusData.statusCounts.rejete || [];
  const reouvert = statusData.statusCounts.reouvert || [];

  const chartData = {
    labels,
    datasets: [
      {
        label: "Ouvert",
        data: ouvert,
        borderColor: "rgba(75, 192, 192, 1)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        borderWidth: 2,
        tension: 0.4,
      },
      {
        label: "En cours",
        data: encours,
        borderColor: "rgba(54, 162, 235, 1)",
        backgroundColor: "rgba(54, 162, 235, 0.2)",
        borderWidth: 2,
        tension: 0.4,
      },
      {
        label: "Cloturé",
        data: cloture,
        borderColor: "rgba(153, 102, 255, 1)",
        backgroundColor: "rgba(153, 102, 255, 0.2)",
        borderWidth: 2,
        tension: 0.4,
      },
      {
        label: "Rejeté",
        data: rejete,
        borderColor: "rgba(255, 99, 132, 1)",
        backgroundColor: "rgba(255, 99, 132, 0.2)",
        borderWidth: 2,
        tension: 0.4,
      },
      {
        label: "Réouvert",
        data: reouvert,
        borderColor: "rgba(255, 206, 86, 1)",
        backgroundColor: "rgba(255, 206, 86, 0.2)",
        borderWidth: 2,
        tension: 0.4,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: "top",
      },
      title: {
        display: true,
        text: "Statut des Actions",
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Administratif General",
        },
      },
      y: {
        beginAtZero: true,
        max: 500,
        title: {
          display: true,
          text: "Statut Count",
        },
      },
    },
  };

  return (
    <>
      <div className="grid grid-cols-2 grid-rows-2 gap-2 p-2">
        <div className="flex flex-col items-center">
          <h2 className="block text-sm  font-sm leading-6 pb-1">Status</h2>
          <table className="table table-xs  w-full rounded-sm border border-base-300/20 ">
            <thead className="text-pretty text-base-content">
              <TableHeader2
                columnLabels={(columns || []).map((column) => column.label)}
              />
            </thead>
            <tbody>
              {statusData.administratifGeneral.map((item, index) => (
                <TableRow2
                  key={item.id}
                  rowData={{
                    ...item,
                    // statusCounts: data.statusCounts, // Pass entire statusCounts for dynamic rendering
                    ouvert: statusData.statusCounts.ouvert[index],
                    encours: statusData.statusCounts.encours[index],
                    cloture: statusData.statusCounts.cloture[index],
                    rejete: statusData.statusCounts.rejete[index],
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
        <div className="flex flex-col items-center">
          <h2 className="block text-sm  font-sm leading-6 pb-1">Priorité</h2>
          <table className="table table-xs  w-full rounded-sm border border-base-300/20">
            <thead className="text-pretty text-base-content">
              <TableHeader2
                columnLabels={(PriorityColumns || []).map(
                  (column) => column.label
                )}
              />
            </thead>
            <tbody>
              {priorityData.administratifGeneral.map((item, index) => (
                <TableRow2
                  key={item.id}
                  rowData={{
                    ...item,
                    // statusCounts: data.statusCounts, // Pass entire statusCounts for dynamic rendering
                    Majeur: priorityData.priorityCounts.Majeur[index],
                    Moyen: priorityData.priorityCounts.Moyen[index],
                    Mineur: priorityData.priorityCounts.Mineur[index],
                  }}
                  columns={PriorityColumns.map((col) => ({
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
        <div className="m-3 w-fit-content h-fit  w-full rounded-sm border border-base-300/20 ">
          {/* <Line data={chartData} options={options} /> */}
        </div>
        <div></div>
      </div>
    </>
  );
};

export default ActionTable;
