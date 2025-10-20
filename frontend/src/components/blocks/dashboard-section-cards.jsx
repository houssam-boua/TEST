import React from "react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import CostumeCardTitle from "../collection/costume-card-title";
import { CircleAlert, FileText } from "lucide-react";
import useIcon from "../../Hooks/useIcon";
import ChartBarMultiple from "../charts/chart-bar-multiple";
import useIconColor from "../../Hooks/useIconColor";

// Render a status-based icon using hooks inside a proper component
const StatusIcon = React.memo(function StatusIcon({
  status,
  className,
  IconComponent,
}) {
  const color = useIconColor(status);
  const iconEl = useIcon(status, color, IconComponent, className);
  return iconEl || null;
});

const recentDocuments = [
  {
    title: "Document 1",
    size: "2MB",
    day: "Today",
    status: "approved",
    icon: FileText,
  },
  {
    title: "Document 2",
    size: "1MB",
    day: "Yesterday",
    status: "pending",
    icon: FileText,
  },
  {
    title: "Document 3",
    size: "3MB",
    day: "Last Week",
    status: "rejected",
    icon: FileText,
  },
];

const recentActivities = [
  {
    title: "User A uploaded Document 1",
    time: "2 hours ago",
    status: "approved",
    icon: CircleAlert,
  },
  {
    title: "User B commented on Document 2",
    time: "5 hours ago",
    status: "pending",
    icon: CircleAlert,
  },
];

const DashboardSectionCards = () => {
  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4  *:data-[slot=card]:shadow-xs *:data-[slot=card]:bg-card *:data-[slot=card]:border-border lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-3">
      <Card className="@container/card ">
        <CardHeader>
          <CostumeCardTitle title="Recent documents" />
        </CardHeader>
        <CardContent>
          <ul>
            {recentDocuments.map((doc, index) => (
              <li
                key={index}
                className="mb-2 flex items-center justify-start gap-2"
              >
                <StatusIcon
                  status={doc.status}
                  className="h-6 w-6"
                  IconComponent={doc.icon}
                />
                <div className="flex-1 flex flex-col ">
                  <span className="text-xs">{doc.title}</span>
                  <span className="text-xs text-muted-foreground">
                    {doc.size}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">{doc.day}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card className="@container/card ">
        <CardHeader>
          <CostumeCardTitle title="Recent Activities" />
        </CardHeader>

        <CardContent>
          <ul>
            {recentActivities.map((doc, index) => (
              <li
                key={index}
                className="mb-2 flex items-center justify-start gap-2"
              >
                <StatusIcon
                  status={doc.status}
                  className="h-6 w-6"
                  IconComponent={doc.icon}
                />
                <div className="flex-1 flex flex-col ">
                  <span className="text-xs">{doc.title}</span>
                  <span className="text-xs text-muted-foreground">
                    {doc.status}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {doc.time}
                </span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
      <Card className="@container/card ">
        <CardHeader>
          <CostumeCardTitle title="Analysis" />
        </CardHeader>

        <CardContent>
          <ChartBarMultiple />
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardSectionCards;
