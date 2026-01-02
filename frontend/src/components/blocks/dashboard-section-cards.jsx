"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import CostumeCardTitle from "../collection/costume-card-title";
import { 
  CircleAlert, 
  FileText, 
  Building2, 
  TrendingUp, 
  Clock,
  Activity,
  Sparkles,
  FileEdit,
  FileCheck,
  FileSignature,
  Send,
  ChevronRight,
  Workflow as WorkflowIcon
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from "recharts";

import useIcon from "../../Hooks/useIcon";
import useIconColor from "../../Hooks/useIconColor";
import useRelativeTime from "../../Hooks/useRelativeTime";
import useActionLog from "../../Hooks/useActionLog";

import {
  useGetDashboardDocumentsByDepartementQuery,
  useGetDashboardDocumentsRecentQuery,
  useGetWorkflowsByStateQuery,
} from "../../slices/dashboardslices";
import { useGetLogsQuery } from "../../slices/logsSlice";

const StatusIcon = React.memo(function StatusIcon({ status, className, IconComponent }) {
  const normalized = String(status || "").toLowerCase();
  const color = useIconColor(normalized);
  const iconEl = useIcon(normalized, color, IconComponent, className);
  return iconEl || null;
});

function RelativeTimeDisplay({ date }) {
  const rel = useRelativeTime(date);
  return <span className="text-[11px] text-muted-foreground whitespace-nowrap">{rel}</span>;
}

function ActivityItem({ log, index }) {
  const sentence = useActionLog(log);
  const action = String(log?.action || "").toLowerCase();

  return (
    <motion.li
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05, type: "spring", stiffness: 300, damping: 25 }}
      whileHover={{ 
        x: 4, 
        backgroundColor: "rgba(59, 130, 246, 0.04)",
        transition: { duration: 0.2 }
      }}
      className="flex items-start gap-3 py-2.5 px-2 -mx-2 rounded-lg transition-colors cursor-pointer group"
    >
      <motion.div
        whileHover={{ scale: 1.1, rotate: 5 }}
        transition={{ type: "spring", stiffness: 400 }}
      >
        <StatusIcon status={action} className="h-5 w-5 mt-0.5" IconComponent={CircleAlert} />
      </motion.div>
      <div className="min-w-0 flex-1">
        <div className="text-xs leading-5 text-foreground break-words group-hover:text-blue-600 transition-colors">
          {sentence}
        </div>
        <div className="mt-1 flex items-center gap-1.5">
          <Clock className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
          <RelativeTimeDisplay date={log?.timestamp} />
        </div>
      </div>
    </motion.li>
  );
}

// Workflow State Configuration
const WORKFLOW_STATES = {
  "Élaboration": { 
    icon: FileEdit, 
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    label: "Élaboration"
  },
  "Vérification": { 
    icon: FileCheck, 
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    label: "Vérification"
  },
  "Approbation": { 
    icon: FileSignature, 
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    label: "Approbation"
  },
  "Diffusion": { 
    icon: Send, 
    color: "text-green-600",
    bgColor: "bg-green-50",
    label: "Diffusion"
  },
};

// Workflow Item Component - Consistent with Activity/Document items
function WorkflowItem({ workflow, index }) {
  const state = workflow.etat || "Unknown";
  const config = WORKFLOW_STATES[state] || {
    icon: FileEdit,
    color: "text-muted-foreground",
    bgColor: "bg-muted",
    label: state,
  };

  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05, type: "spring", stiffness: 300, damping: 25 }}
      whileHover={{ 
        x: 4, 
        backgroundColor: "rgba(59, 130, 246, 0.04)",
        transition: { duration: 0.2 }
      }}
      className="flex items-start gap-3 py-2.5 px-2 -mx-2 rounded-lg transition-colors cursor-pointer group"
    >
      <motion.div
        whileHover={{ scale: 1.1, rotate: 5 }}
        transition={{ type: "spring", stiffness: 400 }}
        className={`p-1.5 rounded ${config.bgColor} mt-0.5`}
      >
        <Icon className={`h-4 w-4 ${config.color}`} />
      </motion.div>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium truncate text-foreground group-hover:text-blue-600 transition-colors">
          {workflow.document?.title || "Sans titre"}
        </div>
        <div className="mt-1 flex items-center gap-1.5">
          <span className="text-[11px] text-muted-foreground">
            {config.label}
          </span>
          {workflow.document?.code && (
            <>
              <span className="text-[11px] text-muted-foreground opacity-50">•</span>
              <span className="text-[11px] text-muted-foreground truncate">
                {workflow.document.code}
              </span>
            </>
          )}
        </div>
      </div>
      <div className="flex flex-col items-end gap-1.5 shrink-0">
        <Badge 
          variant="secondary" 
          className={`text-[10px] ${config.bgColor} border-${config.color.replace('text-', '')} ${config.color}`}
        >
          {config.label}
        </Badge>
      </div>
    </motion.div>
  );
}

// Enhanced Custom Tooltip
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white/95 backdrop-blur-xl border border-blue-100 rounded-xl shadow-2xl p-4"
        style={{
          boxShadow: '0 20px 60px -15px rgba(59, 130, 246, 0.3), 0 0 0 1px rgba(255,255,255,0.5)'
        }}
      >
        <div className="flex items-center gap-2 mb-2">
          <div className="h-3 w-3 rounded-full bg-gradient-to-br from-blue-500 to-purple-500" />
          <p className="text-sm font-semibold text-foreground">{data.name}</p>
        </div>
        <p className="text-xs text-muted-foreground">
          <span className="font-bold text-lg text-blue-600">{data.count}</span> documents
        </p>
      </motion.div>
    );
  }
  return null;
};

const CHART_COLORS = [
  "hsl(217, 91%, 60%)",  // Blue
  "hsl(262, 83%, 58%)",  // Purple
  "hsl(340, 82%, 52%)",  // Pink
  "hsl(142, 71%, 45%)",  // Green
  "hsl(48, 96%, 53%)",   // Yellow
];

// Cleaner 3D Card Component
const Card3D = ({ children, delay = 0, className = "" }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay,
        type: "spring",
        stiffness: 100,
        damping: 15
      }}
      whileHover={{
        y: -4,
        transition: { duration: 0.2, type: "spring", stiffness: 300 }
      }}
      className={`group ${className}`}
    >
      <div className="relative transform-gpu transition-all duration-300">
        {/* Subtle glow on hover */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-400/20 via-purple-400/20 to-pink-400/20 rounded-2xl opacity-0 group-hover:opacity-100 blur-lg transition-opacity duration-300" />
        
        {/* Main card */}
        <div className="relative bg-white border border-gray-200/80 rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden">
          {/* Gradient overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-transparent to-purple-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          <div className="relative z-10">
            {children}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Section Header Component
const SectionHeader = ({ icon: Icon, title, subtitle, delay = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.5 }}
      className="flex items-center gap-3 mb-6"
    >
      <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 shadow-lg">
        <Icon className="h-5 w-5 text-white" />
      </div>
      <div>
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
      </div>
    </motion.div>
  );
};

const DashboardSectionCards = ({ departmentCounts, onOpenFolder }) => {
  const {
    data: recentDocumentsResponse,
    isLoading: recentLoading,
    isError: recentError,
  } = useGetDashboardDocumentsRecentQuery();

  const {
    data: byDeptResponse,
    isLoading: byDeptLoading,
    isError: byDeptError,
  } = useGetDashboardDocumentsByDepartementQuery();

  const { 
    data: workflowsResponse, 
    isLoading: workflowsLoading, 
    isError: workflowsError 
  } = useGetWorkflowsByStateQuery();

  const { data: logsResponse, isLoading: logsLoading, isError: logsError } = useGetLogsQuery();

  const recentDocs = React.useMemo(() => {
    const items = Array.isArray(recentDocumentsResponse)
      ? recentDocumentsResponse
      : recentDocumentsResponse?.data || [];

    return items.map((it) => {
      const title = it?.title ?? it?.name ?? "Untitled";
      const type = it?.type ?? it?.doc_type ?? it?.doc_format ?? "-";
      const owner = it?.owner ?? it?.towner ?? "Unknown";
      const status = String(it?.status ?? it?.doc_status_type ?? "pending");
      const rawDate = it?.createdAt ?? it?.created_at ?? null;

      return { title, type, owner, status, rawDate, raw: it };
    });
  }, [recentDocumentsResponse]);

  const deptItems = React.useMemo(() => {
    const source = departmentCounts ?? byDeptResponse?.data ?? [];
    const arr = (Array.isArray(source) ? source : [])
      .map((d) => ({
        name: d?.dep_name ?? d?.depname ?? d?.name ?? "Unknown",
        count: d?.count ?? 0,
      }))
      .filter((d) => d.count > 0)
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    return arr;
  }, [departmentCounts, byDeptResponse]);

  // Flatten workflows into a single list
  const allWorkflows = React.useMemo(() => {
    const source = Array.isArray(workflowsResponse) ? workflowsResponse : workflowsResponse?.data || [];
    
    // Flatten all workflows from all states
    const workflows = source.flatMap(state => 
      (state.workflows || []).map(wf => ({
        ...wf,
        etat: state.etat
      }))
    );

    // Order by workflow progression
    const order = ["Élaboration", "Vérification", "Approbation", "Diffusion"];
    return workflows.sort((a, b) => {
      const aIndex = order.indexOf(a.etat);
      const bIndex = order.indexOf(b.etat);
      return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex);
    });
  }, [workflowsResponse]);

  const logs = React.useMemo(() => {
    const arr = Array.isArray(logsResponse) ? logsResponse : logsResponse?.data;
    return (arr || []).slice(0, 6);
  }, [logsResponse]);

  const totalDocs = React.useMemo(
    () => deptItems.reduce((acc, d) => acc + d.count, 0),
    [deptItems]
  );

  return (
    <div className="space-y-10">
      {/* Section 1: Recent Activity Grid - 3 columns */}
      <section>
        <SectionHeader 
          icon={Activity} 
          title="Recent Activity" 
          subtitle="Latest documents, activities, and workflow status"
          delay={0.1}
        />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {/* Recent Documents */}
          <Card3D delay={0.15}>
            <Card className="border-0 bg-transparent shadow-none h-full">
              <CardHeader className="pb-4 pt-6 px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-blue-600" />
                    <CostumeCardTitle title="Recent Documents" />
                  </div>
                  <motion.div
                    animate={{ 
                      rotate: [0, 10, 0],
                      scale: [1, 1.1, 1]
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <Badge variant="outline" className="text-[10px] px-2">
                      {recentDocs.length}
                    </Badge>
                  </motion.div>
                </div>
              </CardHeader>

              <CardContent className="pt-0 pb-6 px-6">
                {recentLoading ? (
                  <div className="space-y-3">
                    {[...Array(4)].map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0.3, 0.6, 0.3] }}
                        transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.15 }}
                        className="h-16 bg-gradient-to-r from-blue-50 via-purple-50 to-blue-50 rounded-lg"
                      />
                    ))}
                  </div>
                ) : recentError ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center py-12 text-center"
                  >
                    <CircleAlert className="h-10 w-10 text-red-400 mb-2" />
                    <p className="text-xs text-destructive">Unable to load documents</p>
                  </motion.div>
                ) : recentDocs.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center py-12 text-center"
                  >
                    <Sparkles className="h-10 w-10 text-gray-300 mb-2" />
                    <p className="text-xs text-muted-foreground">No recent documents</p>
                  </motion.div>
                ) : (
                  <div className="space-y-2 max-h-[380px] overflow-auto pr-2 scrollbar-thin scrollbar-thumb-blue-200 scrollbar-track-transparent">
                    <AnimatePresence mode="popLayout">
                      {recentDocs.map((doc, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          transition={{ delay: idx * 0.05 }}
                          whileHover={{
                            scale: 1.01,
                            x: 4,
                            backgroundColor: "rgba(59, 130, 246, 0.04)",
                          }}
                          className="py-3 px-3 cursor-pointer rounded-lg transition-all duration-200 border border-gray-100 hover:border-blue-200 hover:shadow-sm group"
                          onClick={() => onOpenFolder?.(doc.raw)}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0 flex-1">
                              <div className="text-sm font-medium truncate text-foreground group-hover:text-blue-600 transition-colors">
                                {doc.title}
                              </div>
                              <div className="text-[11px] text-muted-foreground truncate mt-1 flex items-center gap-1.5">
                                <span>{doc.type}</span>
                                <span className="opacity-50">•</span>
                                <span>{doc.owner}</span>
                              </div>
                            </div>

                            <div className="flex flex-col items-end gap-1.5 shrink-0">
                              <Badge 
                                variant="secondary" 
                                className="text-[10px] bg-blue-50 border-blue-200 text-blue-700"
                              >
                                {doc.status}
                              </Badge>
                              <RelativeTimeDisplay date={doc.rawDate} />
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </CardContent>
            </Card>
          </Card3D>

          {/* Recent Activities */}
          <Card3D delay={0.2}>
            <Card className="border-0 bg-transparent shadow-none h-full">
              <CardHeader className="pb-4 pt-6 px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-purple-600" />
                    <CostumeCardTitle title="System Activity" />
                  </div>
                  <motion.div
                    animate={{
                      scale: [1, 1.2, 1],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <Badge variant="outline" className="text-[10px] px-2">
                      {logs.length}
                    </Badge>
                  </motion.div>
                </div>
              </CardHeader>

              <CardContent className="pt-0 pb-6 px-6">
                {logsLoading ? (
                  <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0.3, 0.6, 0.3] }}
                        transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.15 }}
                        className="h-14 bg-gradient-to-r from-purple-50 via-pink-50 to-purple-50 rounded-lg"
                      />
                    ))}
                  </div>
                ) : logsError ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center py-12 text-center"
                  >
                    <CircleAlert className="h-10 w-10 text-red-400 mb-2" />
                    <p className="text-xs text-destructive">Unable to load activities</p>
                  </motion.div>
                ) : logs.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center py-12 text-center"
                  >
                    <Clock className="h-10 w-10 text-gray-300 mb-2" />
                    <p className="text-xs text-muted-foreground">No recent activity</p>
                  </motion.div>
                ) : (
                  <ul className="space-y-1 max-h-[380px] overflow-auto pr-2 scrollbar-thin scrollbar-thumb-purple-200 scrollbar-track-transparent">
                    <AnimatePresence mode="popLayout">
                      {logs.map((log, idx) => (
                        <ActivityItem key={log?.id ?? idx} log={log} index={idx} />
                      ))}
                    </AnimatePresence>
                  </ul>
                )}
              </CardContent>
            </Card>
          </Card3D>

          {/* Workflow Status - UPDATED DESIGN */}
          <Card3D delay={0.25}>
            <Card className="border-0 bg-transparent shadow-none h-full">
              <CardHeader className="pb-4 pt-6 px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <WorkflowIcon className="h-4 w-4 text-indigo-600" />
                    <CostumeCardTitle title="Workflow Status" />
                  </div>
                  <motion.div
                    animate={{
                      scale: [1, 1.2, 1],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <Badge variant="outline" className="text-[10px] px-2">
                      {allWorkflows.length}
                    </Badge>
                  </motion.div>
                </div>
              </CardHeader>

              <CardContent className="pt-0 pb-6 px-6">
                {workflowsLoading ? (
                  <div className="space-y-3">
                    {[...Array(4)].map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0.3, 0.6, 0.3] }}
                        transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.15 }}
                        className="h-16 bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 rounded-lg"
                      />
                    ))}
                  </div>
                ) : workflowsError ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center py-12 text-center"
                  >
                    <CircleAlert className="h-10 w-10 text-red-400 mb-2" />
                    <p className="text-xs text-destructive">Unable to load workflows</p>
                  </motion.div>
                ) : allWorkflows.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center py-12 text-center"
                  >
                    <WorkflowIcon className="h-10 w-10 text-gray-300 mb-2" />
                    <p className="text-xs text-muted-foreground">No active workflows</p>
                  </motion.div>
                ) : (
                  <div className="space-y-1 max-h-[380px] overflow-auto pr-2 scrollbar-thin scrollbar-thumb-indigo-200 scrollbar-track-transparent">
                    <AnimatePresence mode="popLayout">
                      {allWorkflows.map((workflow, idx) => (
                        <WorkflowItem 
                          key={workflow.id ?? idx} 
                          workflow={workflow} 
                          index={idx} 
                        />
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </CardContent>
            </Card>
          </Card3D>
        </div>
      </section>

      {/* Section 2: Department Analytics - Full Width */}
      <section>
        <SectionHeader 
          icon={TrendingUp} 
          title="Department Analytics" 
          subtitle="Document distribution across departments"
          delay={0.3}
        />
        
        <Card3D delay={0.35}>
          <Card className="border-0 bg-transparent shadow-none">
            <CardHeader className="pb-4 pt-6 px-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-green-600" />
                  <CostumeCardTitle title="Documents by Department" />
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px] px-2">
                    {deptItems.length} departments
                  </Badge>
                  <Badge className="text-[10px] px-2 bg-gradient-to-r from-blue-500 to-purple-500 border-0">
                    {totalDocs} total
                  </Badge>
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-0 pb-6 px-6">
              {byDeptLoading ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="h-[320px] bg-gradient-to-br from-blue-50 via-green-50 to-purple-50 rounded-lg"
                />
              ) : byDeptError ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center py-16 text-center"
                >
                  <CircleAlert className="h-12 w-12 text-red-400 mb-2" />
                  <p className="text-sm text-destructive">Unable to load department stats</p>
                </motion.div>
              ) : deptItems.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center py-16 text-center"
                >
                  <Building2 className="h-12 w-12 text-gray-300 mb-2" />
                  <p className="text-sm text-muted-foreground">No department data available</p>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4 }}
                  className="h-[320px] relative"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={deptItems}
                      margin={{ top: 20, right: 30, left: 0, bottom: 80 }}
                      barSize={40}
                    >
                      <defs>
                        {CHART_COLORS.map((color, index) => (
                          <linearGradient 
                            key={index} 
                            id={`colorGradient${index}`} 
                            x1="0" 
                            y1="0" 
                            x2="0" 
                            y2="1"
                          >
                            <stop offset="0%" stopColor={color} stopOpacity={1}/>
                            <stop offset="100%" stopColor={color} stopOpacity={0.7}/>
                          </linearGradient>
                        ))}
                      </defs>
                      
                      <CartesianGrid 
                        strokeDasharray="3 3" 
                        stroke="#e5e7eb" 
                        vertical={false}
                        opacity={0.5}
                      />
                      
                      <XAxis
                        dataKey="name"
                        tick={{ fill: "#6b7280", fontSize: 12 }}
                        tickLine={false}
                        axisLine={{ stroke: "#e5e7eb", strokeWidth: 1 }}
                        angle={-45}
                        textAnchor="end"
                        height={80}
                      />
                      
                      <YAxis
                        tick={{ fill: "#6b7280", fontSize: 12 }}
                        tickLine={false}
                        axisLine={{ stroke: "#e5e7eb", strokeWidth: 1 }}
                      />
                      
                      <Tooltip 
                        content={<CustomTooltip />} 
                        cursor={{ fill: "rgba(59, 130, 246, 0.05)" }} 
                      />
                      
                      <Bar 
                        dataKey="count" 
                        radius={[10, 10, 0, 0]}
                        animationDuration={1000}
                        animationBegin={0}
                      >
                        {deptItems.map((_, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={`url(#colorGradient${index % CHART_COLORS.length})`}
                            style={{
                              filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))',
                            }}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </Card3D>
      </section>
    </div>
  );
};

export default DashboardSectionCards;
