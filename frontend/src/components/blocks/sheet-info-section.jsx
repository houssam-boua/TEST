import React from "react";
("use client");
import TextareaAutosize from "react-textarea-autosize";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
} from "@/components/ui/input-group";
import { TabsContent } from "@/components/ui/tabs"; 
import { ItemIcon } from "./item-icon";
const SheetInfoSection = ({ infos }) => {
  return (
    <TabsContent value="info">
      ;
      <div className="flex flex-col gap-3">
        {infos.length === 0 ? (
          <span className="text-sm text-muted-foreground">
            Aucune information.
          </span>
        ) : (
          infos.map((it, idx) => (
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

export default SheetInfoSection;
