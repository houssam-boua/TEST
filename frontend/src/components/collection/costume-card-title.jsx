import React from "react";
import { CardTitle } from "@/components/ui/card";
const CostumeCardTitle = ({title}) => {
  return (
    <>
      <CardTitle>{title}</CardTitle>
      <span
        aria-hidden="true"
        className="mt-1 block h-0.5 w-16 rounded bg-primary"
      />
    </>
  );
};

export default CostumeCardTitle;
