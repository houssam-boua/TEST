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
import React from "react";
import {
  useGetDashboardUsersCountQuery,
  useGetDashboardDocumentsCountQuery,
} from "@/Slices/dashboardSlices";

const safeExtractCount = (data) => {
  if (data == null) return null;
  if (typeof data === "number") return data;
  if (typeof data.count === "number") return data.count;
  if (typeof data.count_total === "number") return data.count_total;
  if (Array.isArray(data)) return data.length;
  if (Array.isArray(data.results)) return data.results.length;
  if (Array.isArray(data.data)) return data.data.length;
  // some endpoints wrap payload: { data: { count: N } }
  if (data.data && typeof data.data.count === "number") return data.data.count;
  return null;
};

const SectionCards = () => {
  // First card -> users count
  const { data: usersCountData, isLoading: loadingUsers } =
    useGetDashboardUsersCountQuery();
  // Fourth card -> documents count
  const { data: docsCountData, isLoading: loadingDocs } =
    useGetDashboardDocumentsCountQuery();

  const usersCount = safeExtractCount(usersCountData);
  const docsCount = safeExtractCount(docsCountData);

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4  *:data-[slot=card]:shadow-xs *:data-[slot=card]:bg-card *:data-[slot=card]:border-border lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      <Card className="@container/card ">
        <CardHeader>
          <CardDescription className="text-muted-foreground">
            Users
          </CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {loadingUsers ? "…" : usersCount ?? "-"}
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
            3
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
            3
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
            {loadingDocs ? "…" : docsCount ?? "-"}
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
