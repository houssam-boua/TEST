import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const SectionCards = () => {
  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4  *:data-[slot=card]:shadow-xs *:data-[slot=card]:bg-card *:data-[slot=card]:border-border lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      <Card className="@container/card ">
        <CardHeader>
          <CardDescription className="text-muted-foreground">
            Departement
          </CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            20
          </CardTitle>
          <CardAction>
            <Badge variant="secondary">Users</Badge>
          </CardAction>
        </CardHeader>
      </Card>
      <Card className="@container/card ">
        <CardHeader>
          <CardDescription>Units</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            3{" "}
          </CardTitle>
          <CardAction>
            <Badge variant="secondary">Teams</Badge>
          </CardAction>
        </CardHeader>
      </Card>
      <Card className="@container/card ">
        <CardHeader>
          <CardDescription>Teams</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            3{" "}
          </CardTitle>
          <CardAction>
            <Badge variant="secondary">Users</Badge>
          </CardAction>
        </CardHeader>
      </Card>
      <Card className="@container/card ">
        <CardHeader>
          <CardDescription>Documents</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            1034
          </CardTitle>
          <CardAction>
            <Badge variant="secondary">File</Badge>
          </CardAction>
        </CardHeader>
      </Card>
    </div>
  );
};

export default SectionCards;
