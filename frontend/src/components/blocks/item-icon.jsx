import { ShieldAlertIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";

export function ItemIcon({ icon, title, description }) {
  return (
    <div className="flex w-full flex-col gap-6 bg-white border border-muted rounded-md">
      <Item variant="outline">
        <ItemMedia variant="icon " className="border border-muted w-8 h-8 rounded-md">
          {icon}
        </ItemMedia>

        <ItemContent>
          <ItemTitle>{title}</ItemTitle>
          <ItemDescription>{description}</ItemDescription>
        </ItemContent>
        <ItemActions></ItemActions>
      </Item>
    </div>
  );
}
