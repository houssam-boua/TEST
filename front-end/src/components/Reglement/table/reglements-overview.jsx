import React, { useEffect, useState } from "react";
import { fetchReglementDomainsadministratifDetails } from "../../../api/api";
import TableHeader2 from "../../common/TableHeader2";
import TableRow2 from "../../common/TableRow2";
import { Loading } from "../../common/Loading";
import { Link } from "react-router-dom";

const ReglementsOverview = () => {
  const [data, setData] = useState({
    administratifGeneral: [],
    reglementsCounts: [],
    exigencesCounts: [],
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchReglements = async () => {
      setIsLoading(true);
      try {
        const response = await fetchReglementDomainsadministratifDetails();
        const { administratifGeneral, reglementsCounts, exigencesCounts } =
          response.data;
        setData({
          administratifGeneral,
          reglementsCounts,
          exigencesCounts,
        });
      } catch (error) {
        console.error("Error fetching reglements data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReglements();
  }, []);

  const columns = [
    // { field: "id", value: (val) => val }, // Plain value
    { field: "admin_general_name", value: (val) => val }, // Plain value
    {
      field: "reglementsCounts",
      value: (_, rowIndex) => data.reglementsCounts[rowIndex],
    }, // Index-based access
    {
      field: "exigencesCounts",
      value: (_, rowIndex) => data.exigencesCounts[rowIndex],
    }, // Index-based access
    {
      field: "id",
      value: (val) => (
        <Link
          to={`/reglements/list/${val}`}
          className="link link-primary no-underline flex items-center"
        >
          <button className="btn btn-xs btn-circle  outline-none btn-primary text-primary-content">
            {/* See more */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-4 stroke-primary-content"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m8.25 4.5 7.5 7.5-7.5 7.5"
              />
            </svg>
          </button>
          <span className="ml-2 text-base-content">Voir plus</span>
        </Link>
      ),
    }, // Custom JSX
  ];

  return (
    <>
      <div className="overflow-x-auto">
        {isLoading ? (
          <Loading />
        ) : (
          <table className="table table-xs  w-full rounded-sm border border-base-300/20 border-l-0 shadow-xs ">
            <thead className="text-pretty text-base-content">
              <TableHeader2
                columnLabels={["Name", "Règlements", "Exigences", "Voir plus"]}
              />
            </thead>
            <tbody>
              {data.administratifGeneral.map((item, index) => (
                <TableRow2
                  key={item.id}
                  rowData={{
                    ...item,
                    reglementsCounts: data.reglementsCounts[index],
                    exigencesCounts: data.exigencesCounts[index],
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
        )}
      </div>
    </>
  );
};

export default ReglementsOverview;
