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
import {
  useGetDashboardDepartementsCountQuery,
  useGetDashboardWorkflowsCountQuery,
} from "../../Slices/dashboardSlices";
import IconAvatar from "./icon-avatar";
import { Building, FileText, Icon, Route, User } from "lucide-react";

const safeExtractCount = (data) => {
  if (data == null) return null;
  if (typeof data === "number") return data;
  if (typeof data.count === "number") return data.count;
  if (typeof data.count_total === "number") return data.count_total;
  if (typeof data.data === "number") return data.data;
  if (Array.isArray(data)) return data.length;
  if (Array.isArray(data.results)) return data.results.length;
  if (Array.isArray(data.data)) return data.data.length;
  // some endpoints wrap payload: { data: { count: N } }
  if (data.data && typeof data.data.count === "number") return data.data.count;
  return null;
};

const SectionCards = () => {
  // First card -> users count

  // Fourth card -> documents count
  const { data: docsCountData, isLoading: loadingDocs } =
    useGetDashboardDocumentsCountQuery();
  // Users count
  const { data: usersCountData, isLoading: loadingUsers } =
    useGetDashboardUsersCountQuery();

  const { data: departementsCountData, isLoading: loadingDepartements } =
    useGetDashboardDepartementsCountQuery();

  const { data: workflowsCountData, isLoading: loadingWorkflows } =
    useGetDashboardWorkflowsCountQuery();

  console.log("Users count data:", usersCountData);
  const usersCount = safeExtractCount(usersCountData);
  const docsCount = safeExtractCount(docsCountData);
  const departementsCount = safeExtractCount(departementsCountData);
  const workflowsCount = safeExtractCount(workflowsCountData);

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
            <IconAvatar
              icon={<User strokeWidth={1.25} />}
              className="bg-chart-2/15 text-chart-2"
            />
          </CardAction>
        </CardHeader>
      </Card>
      <Card className="@container/card ">
        <CardHeader>
          <CardDescription>Departement</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {loadingDepartements ? "…" : departementsCount ?? "-"}
          </CardTitle>
          <CardAction>
            <IconAvatar
              icon={<Building strokeWidth={1.25} />}
              className="bg-chart-3/15 text-chart-3"
            />
          </CardAction>
        </CardHeader>
      </Card>
      <Card className="@container/card ">
        <CardHeader>
          <CardDescription>Workflow</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {loadingWorkflows ? "…" : workflowsCount ?? "-"}
          </CardTitle>
          <CardAction>
            <IconAvatar
              icon={<Route strokeWidth={1.25} />}
              className="bg-chart-5/10 text-chart-5"
            />
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
            <IconAvatar
              icon={<FileText strokeWidth={1.25} />}
              className="bg-chart-1/15 text-chart-1"
            />
          </CardAction>
        </CardHeader>
      </Card>
    </div>
  );
};

export default SectionCards;
