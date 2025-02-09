import React from "react";
import { render, screen } from "@testing-library/react";
import ReglementTable from "../../../components/Reglement/table/reglements-table";

test("renders reglement table", () => {
  render(<ReglementTable />);
  const tableElement = screen.getByRole("table");
  expect(tableElement).toBeInTheDocument();
});
