import React, { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useGetUsersQuery } from "@/slices/userSlice";

const EditTaskForm = ({ task, onSubmit, onCancel, loading }) => {
  const { data: usersData = {} } = useGetUsersQuery();
  const users = useMemo(() => {
    if (Array.isArray(usersData)) return usersData;
    if (Array.isArray(usersData?.results)) return usersData.results;
    return [];
  }, [usersData]);

  const normalizeDate = (d) => {
    if (!d) return "";
    if (typeof d === "string") {
      // Accept ISO or YYYY-MM-DD
      return d.slice(0, 10);
    }
    try {
      const dt = new Date(d);
      if (Number.isNaN(dt.getTime())) return "";
      return dt.toISOString().slice(0, 10);
    } catch {
      return "";
    }
  };

  const pickAssigneeId = (a) => {
    if (!a) return "";
    if (typeof a === "object") return a.id ? String(a.id) : "";
    return String(a);
  };

  const [form, setForm] = useState({
    task_name: task?.task_name || "",
    task_date_echeance: normalizeDate(task?.task_date_echeance),
    task_priorite: task?.task_priorite || "normal",
    task_statut: task?.task_statut || "not_started",
    task_assigned_to: pickAssigneeId(task?.task_assigned_to),
  });

  useEffect(() => {
    if (task) {
      setForm({
        task_name: task.task_name || "",
        task_date_echeance: normalizeDate(task.task_date_echeance),
        task_priorite: task.task_priorite || "normal",
        task_statut: task.task_statut || "not_started",
        task_assigned_to: pickAssigneeId(task.task_assigned_to),
      });
    }
  }, [task]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelect = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!onSubmit) return;
    const payload = {
      id: task?.id,
      task_name: form.task_name,
      task_date_echeance: form.task_date_echeance,
      task_priorite: form.task_priorite,
      task_statut: form.task_statut,
      task_assigned_to: form.task_assigned_to
        ? Number(form.task_assigned_to)
        : null,
    };
    return onSubmit(payload);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 w-full max-w-xl"
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-1">
          <Label htmlFor="task_name">Task Name</Label>
          <Input
            id="task_name"
            name="task_name"
            value={form.task_name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="flex flex-col gap-1">
          <Label htmlFor="task_date_echeance">Due Date</Label>
          <Input
            id="task_date_echeance"
            name="task_date_echeance"
            type="date"
            value={form.task_date_echeance}
            onChange={handleChange}
            required
          />
        </div>

        <div className="flex flex-col gap-1">
          <Label>Priority</Label>
          <Select
            value={form.task_priorite}
            onValueChange={(v) => handleSelect("task_priorite", v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Priority</SelectLabel>
                <SelectItem value="urgent">Urgent</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1">
          <Label>Status</Label>
          <Select
            value={form.task_statut}
            onValueChange={(v) => handleSelect("task_statut", v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Status</SelectLabel>
                <SelectItem value="not_started">Not started</SelectItem>
                <SelectItem value="in_progress">In progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1">
          <Label>Assigned To</Label>
          <Select
            value={form.task_assigned_to}
            onValueChange={(v) => handleSelect("task_assigned_to", v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a user" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Users</SelectLabel>
                {users.map((u) => (
                  <SelectItem key={u.id} value={String(u.id)}>
                    {u.first_name} {u.last_name} ({u.username})
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex gap-2 justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : "Save"}
        </Button>
      </div>
    </form>
  );
};

export default EditTaskForm;
