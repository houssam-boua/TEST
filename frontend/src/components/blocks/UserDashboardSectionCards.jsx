"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import CostumeCardTitle from "../collection/costume-card-title";
import { 
  FileText, 
  Building2, 
  TrendingUp, 
  Clock,
  Activity,
  CheckSquare,
  AlertCircle,
  Clock4,
  Briefcase,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  Users,
  FolderOpen,
  CalendarDays,
  PieChart as PieChartIcon,
  Zap,
  FileCheck,
  FileClock,
  FileX,
  Sparkles,
  LayoutDashboard
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  PieChart,
  Pie,
  Legend
} from "recharts";

import { useAuth } from "../../Hooks/useAuth";
import useRelativeTime from "../../Hooks/useRelativeTime";
import useActionLog from "../../Hooks/useActionLog";

import {
  useGetDashboardDocumentsByDepartementQuery,
  useGetDashboardDocumentsRecentQuery,
  useGetDashboardStatsQuery 
} from "../../slices/dashboardslices";
import { useGetLogsQuery } from "../../slices/logsSlice";

// Composants Helper
function RelativeTimeDisplay({ date }) {
  const rel = useRelativeTime(date);
  return <span className="text-xs text-muted-foreground whitespace-nowrap">{rel}</span>;
}

const StatCard = ({ icon: Icon, title, value, subtitle, trend, color = "blue", delay = 0 }) => {
  const colorClasses = {
    blue: "from-blue-500 to-blue-600",
    emerald: "from-emerald-500 to-emerald-600",
    amber: "from-amber-500 to-amber-600",
    red: "from-red-500 to-red-600",
    purple: "from-purple-500 to-purple-600",
    indigo: "from-indigo-500 to-indigo-600",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      className="group relative"
    >
      <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-2xl opacity-0 group-hover:opacity-100 blur transition-opacity duration-300" />
      
      <div className="relative bg-white rounded-xl border border-gray-200/80 p-6 shadow-sm hover:shadow-md transition-all duration-300">
        <div className="flex items-start justify-between mb-4">
          <div className={`p-3 rounded-xl bg-gradient-to-br ${colorClasses[color]} shadow-lg`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          
          {trend && (
            <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
              trend > 0 
                ? 'bg-emerald-50 text-emerald-700' 
                : 'bg-red-50 text-red-700'
            }`}>
              {trend > 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              {Math.abs(trend)}%
            </div>
          )}
        </div>

        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mb-1">{value}</p>
          {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
        </div>
      </div>
    </motion.div>
  );
};

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-xl p-3">
        <p className="text-sm font-semibold text-gray-900 mb-1">{data.name}</p>
        <p className="text-xs text-gray-600">
          <span className="font-bold" style={{ color: data.payload.fill || data.color }}>{data.value}</span> documents
        </p>
      </div>
    );
  }
  return null;
};

const CHART_COLORS = ["#3b82f6", "#8b5cf6", "#ec4899", "#10b981", "#f59e0b", "#6366f1"];

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return percent > 0.05 ? (
    <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" className="text-xs font-bold">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  ) : null;
};

// Composant Principal
const UserDashboardSectionCards = ({ onOpenFolder }) => {
  const { user, departmentName } = useAuth();

  const { data: statsResponse, isLoading: statsLoading } = useGetDashboardStatsQuery();
  const { data: recentDocsResponse, isLoading: recentLoading } = useGetDashboardDocumentsRecentQuery();
  const { data: deptResponse, isLoading: deptLoading } = useGetDashboardDocumentsByDepartementQuery();
  const { data: logsResponse, isLoading: logsLoading } = useGetLogsQuery();

  // Traitement des tâches
  const taskStats = React.useMemo(() => {
    const data = statsResponse?.data || statsResponse || {};
    return {
      pending: data.pending_tasks ?? 0,
      overdue: data.overdue_tasks ?? 0,
      total: data.total_tasks ?? 0,
      completed: data.completed_tasks ?? 0
    };
  }, [statsResponse]);

  // Statistiques du département
  const myDeptStats = React.useMemo(() => {
    const allDepts = Array.isArray(deptResponse) ? deptResponse : deptResponse?.data || [];
    const myDept = allDepts.find(d => (d.dep_name || d.name) === departmentName);
    return {
      name: departmentName || "Mon Département",
      count: myDept?.count || 0
    };
  }, [deptResponse, departmentName]);

  // Documents récents
  const myRecentDocs = React.useMemo(() => {
    const items = Array.isArray(recentDocsResponse) ? recentDocsResponse : recentDocsResponse?.data || [];
    const userDocs = items.filter(doc => (doc.owner || doc.towner) === user?.username);

    return userDocs.slice(0, 8).map((it) => ({
      title: it?.title ?? it?.name ?? "Sans titre",
      type: it?.type ?? it?.doc_type ?? "-",
      owner: it?.owner ?? "Moi",
      status: String(it?.status ?? "en attente"),
      rawDate: it?.createdAt ?? it?.created_at ?? null,
      raw: it
    }));
  }, [recentDocsResponse, user?.username]);

  // Répartition des statuts de documents
  const docStatusBreakdown = React.useMemo(() => {
    const statusCount = myRecentDocs.reduce((acc, doc) => {
      const status = doc.status.toLowerCase();
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});
    
    const statusColors = {
      'en attente': '#f59e0b',
      'pending': '#f59e0b',
      'approuvé': '#10b981',
      'approved': '#10b981',
      'rejeté': '#ef4444',
      'rejected': '#ef4444',
      'révision': '#3b82f6',
      'review': '#3b82f6',
      'brouillon': '#6b7280',
      'draft': '#6b7280'
    };

    return Object.entries(statusCount).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
      fill: statusColors[name] || '#8b5cf6'
    }));
  }, [myRecentDocs]);

  // Activité récente
  const myRecentActivity = React.useMemo(() => {
    const arr = Array.isArray(logsResponse) ? logsResponse : logsResponse?.data || [];
    return arr
      .filter(log => log?.user === user?.username || log?.userId === user?.id)
      .slice(0, 6);
  }, [logsResponse, user]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 p-6 space-y-6">
      
      {/* En-tête amélioré avec logo */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-2xl opacity-90" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzBoLTZ2LTZoNnYueiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
        
        <div className="relative backdrop-blur-sm bg-white/10 border border-white/20 rounded-2xl shadow-2xl p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
                className="relative"
              >
                <div className="absolute inset-0 bg-white/30 rounded-2xl blur-xl" />
                <div className="relative flex items-center justify-center w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md border border-white/40 shadow-xl">
                  <LayoutDashboard className="w-8 h-8 text-white" />
                </div>
              </motion.div>

              <div>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="flex items-center gap-2 mb-1"
                >
                  <h1 className="text-2xl font-bold text-white">
                    Bienvenue, {user?.username || 'Utilisateur'}
                  </h1>
                  <Sparkles className="w-5 h-5 text-yellow-300 animate-pulse" />
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="flex items-center gap-2 text-sm text-white/90"
                >
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm">
                    <Building2 className="w-3.5 h-3.5" />
                    <span className="font-medium">{departmentName || 'Département'}</span>
                  </div>
                  <span className="text-white/60">•</span>
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm">
                    <CalendarDays className="w-3.5 h-3.5" />
                    <span className="font-medium">
                      {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                  </div>
                </motion.div>
              </div>
            </div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
              className="hidden lg:flex items-center gap-6"
            >
              <div className="text-right">
                <p className="text-xs text-white/70 font-medium uppercase tracking-wider mb-1">Total des tâches</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-3xl font-bold text-white">{taskStats.total}</p>
                  <Badge className="bg-white/20 text-white border-white/30 text-xs">
                    Actif
                  </Badge>
                </div>
              </div>
              
              <div className="w-px h-12 bg-white/20" />
              
              <div className="text-right">
                <p className="text-xs text-white/70 font-medium uppercase tracking-wider mb-1">Documents</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-3xl font-bold text-white">{myRecentDocs.length}</p>
                  <Badge className="bg-white/20 text-white border-white/30 text-xs">
                    Créés
                  </Badge>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Vue d'ensemble - 4 cartes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={CheckSquare}
          title="Tâches en attente"
          value={taskStats.pending}
          subtitle="Nécessitent votre attention"
          color="amber"
          delay={0.1}
        />
        
        <StatCard
          icon={AlertCircle}
          title="Tâches en retard"
          value={taskStats.overdue}
          subtitle="Action immédiate requise"
          color="red"
          delay={0.15}
        />
        
        <StatCard
          icon={FileText}
          title="Mes documents"
          value={myRecentDocs.length}
          subtitle="Créés par vous"
          color="blue"
          delay={0.2}
        />
        
        <StatCard
          icon={Building2}
          title={myDeptStats.name}
          value={myDeptStats.count}
          subtitle="Documents du département"
          color="purple"
          delay={0.25}
        />
      </div>

      {/* Grille de contenu principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Colonne gauche - 2/3 */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Graphique des statuts */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600">
                  <PieChartIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Statut des documents</h3>
                  <p className="text-xs text-gray-500">Répartition par statut</p>
                </div>
              </div>

              {myRecentDocs.length === 0 ? (
                <div className="h-64 flex flex-col items-center justify-center text-gray-400">
                  <PieChartIcon className="w-12 h-12 mb-3" />
                  <p className="text-sm">Aucun document à afficher</p>
                </div>
              ) : (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={docStatusBreakdown}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={renderCustomizedLabel}
                        outerRadius={80}
                        dataKey="value"
                        animationBegin={0}
                        animationDuration={800}
                      >
                        {docStatusBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                      <Legend 
                        verticalAlign="bottom" 
                        height={36}
                        iconType="circle"
                        formatter={(value) => <span className="text-xs text-gray-700">{value}</span>}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </motion.div>

            {/* Activité récente */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Activité récente</h3>
                  <p className="text-xs text-gray-500">Vos dernières actions</p>
                </div>
              </div>

              {logsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="h-12 bg-gray-50 rounded-lg animate-pulse" />
                  ))}
                </div>
              ) : myRecentActivity.length === 0 ? (
                <div className="h-64 flex flex-col items-center justify-center text-gray-400">
                  <Activity className="w-12 h-12 mb-3" />
                  <p className="text-sm">Aucune activité récente</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-auto scrollbar-thin">
                  {myRecentActivity.map((log, idx) => {
                    const sentence = useActionLog(log);
                    return (
                      <motion.div
                        key={log?.id ?? idx}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="p-1.5 rounded-full bg-blue-50 mt-0.5">
                          <Activity className="w-3 h-3 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-gray-700 leading-relaxed">{sentence}</p>
                          <RelativeTimeDisplay date={log?.timestamp} />
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          </div>

          {/* Liste des documents récents */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600">
                  <FolderOpen className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Documents récents</h3>
                  <p className="text-xs text-gray-500">Vos derniers documents créés</p>
                </div>
              </div>
              
              <Badge variant="outline" className="text-xs">
                {myRecentDocs.length} Éléments
              </Badge>
            </div>

            {recentLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-16 bg-gray-50 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : myRecentDocs.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center text-gray-400">
                <FileText className="w-12 h-12 mb-3" />
                <p className="text-sm">Aucun document pour le moment</p>
                <p className="text-xs">Vos documents créés apparaîtront ici</p>
              </div>
            ) : (
              <div className="space-y-2">
                <AnimatePresence>
                  {myRecentDocs.map((doc, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: idx * 0.05 }}
                      whileHover={{ x: 4, backgroundColor: "rgba(249, 250, 251, 1)" }}
                      onClick={() => onOpenFolder?.(doc.raw)}
                      className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-emerald-200 hover:shadow-sm transition-all cursor-pointer group"
                    >
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className="p-2 rounded-lg bg-emerald-50 group-hover:bg-emerald-100 transition-colors">
                          <FileText className="w-5 h-5 text-emerald-600" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-gray-900 truncate group-hover:text-emerald-700 transition-colors">
                            {doc.title}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">{doc.type}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right hidden sm:block">
                          <RelativeTimeDisplay date={doc.rawDate} />
                        </div>
                        <Badge 
                          variant="secondary" 
                          className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200"
                        >
                          {doc.status}
                        </Badge>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </motion.div>
        </div>

        {/* Colonne droite - 1/3 */}
        <div className="space-y-6">
          
          {/* Répartition des tâches */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600">
                <CheckSquare className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Statut des tâches</h3>
                <p className="text-xs text-gray-500">Charge de travail actuelle</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="relative">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-amber-500" />
                    <span className="text-sm font-medium text-gray-700">En attente</span>
                  </div>
                  <span className="text-sm font-bold text-gray-900">{taskStats.pending}</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${taskStats.total > 0 ? (taskStats.pending / taskStats.total) * 100 : 0}%` }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                    className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full"
                  />
                </div>
              </div>

              <div className="relative">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-500" />
                    <span className="text-sm font-medium text-gray-700">En retard</span>
                  </div>
                  <span className="text-sm font-bold text-gray-900">{taskStats.overdue}</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${taskStats.total > 0 ? (taskStats.overdue / taskStats.total) * 100 : 0}%` }}
                    transition={{ delay: 0.6, duration: 0.8 }}
                    className="h-full bg-gradient-to-r from-red-400 to-red-500 rounded-full"
                  />
                </div>
              </div>

              {taskStats.completed > 0 && (
                <div className="relative">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span className="text-sm font-medium text-gray-700">Terminées</span>
                    </div>
                    <span className="text-sm font-bold text-gray-900">{taskStats.completed}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${taskStats.total > 0 ? (taskStats.completed / taskStats.total) * 100 : 0}%` }}
                      transition={{ delay: 0.7, duration: 0.8 }}
                      className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 pt-6 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Total des tâches</span>
                <span className="text-2xl font-bold text-gray-900">{taskStats.total}</span>
              </div>
            </div>
          </motion.div>

          {/* Infos département */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg p-6 text-white"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-blue-100">Votre département</h3>
                <p className="text-lg font-bold">{myDeptStats.name}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl bg-white/10 backdrop-blur-sm">
                <div>
                  <p className="text-xs text-blue-100 mb-1">Total des documents</p>
                  <p className="text-3xl font-bold">{myDeptStats.count}</p>
                </div>
                <div className="p-3 rounded-full bg-white/20">
                  <FileText className="w-6 h-6" />
                </div>
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-white/10 backdrop-blur-sm">
                <div>
                  <p className="text-xs text-blue-100 mb-1">Ma contribution</p>
                  <p className="text-3xl font-bold">{myRecentDocs.length}</p>
                </div>
                <div className="p-3 rounded-full bg-white/20">
                  <Users className="w-6 h-6" />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboardSectionCards;
