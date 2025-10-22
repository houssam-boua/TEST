import { History } from "lucide-react";
import React from "react";
import { TabsContent } from "@/components/ui/tabs";
import { ItemIcon } from "./item-icon";
const SheetVersionSection = ({ versions }) => {
  return (
    <TabsContent value="version">
      <div className="flex flex-col gap-3">
        {versions.length === 0 ? (
          <div className="text-xl text-muted-foreground/70 flex flex-col items-center gap-5 pt-4">
            <History strokeWidth={0.75} size={70} />
            <span>No Versions.</span>
          </div>
        ) : (
          versions.map((it, idx) => (
            <ItemIcon
              key={idx}
              icon={it.icon}
              title={it.title}
              description={it.description}
            />
          ))
        )}
      </div>
    </TabsContent>
  );
};

export default SheetVersionSection;
