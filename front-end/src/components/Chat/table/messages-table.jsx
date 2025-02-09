import React, { useEffect, useState } from "react";
import { fetchConsultations } from "../../../api/api";
import TableHeader2 from "../../common/TableHeader2";

function MessagesTable() {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetchConsultations();
        console.log(response);
        setData(response);
      } catch (error) {
        console.error("Error fetching messages data:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <>
      <table className=" table table-xs rounded-sm border border-base-300/20">
        <thead className="text-pretty text-base-content">
          <TableHeader2 columnLabels={["Nom", "Objet", "Date de reception"]} />
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item.id}>
              <td>{item.sender_email}</td>
              <td>{item.subject}</td>
              <td>{item.created_at}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

export default MessagesTable;
