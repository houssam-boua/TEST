import React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { X, MoreHorizontalIcon, BanIcon, Link, Share } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DialogFooter,
  DialogClose,
  DialogTrigger,
} from "@/components/ui/dialog";
import SharedList from "../collection/shared-list";
const SharedWithDialog = ({ users, onSubmit }) => (
  <Dialog>
    <form>
      <DialogTrigger asChild>
        <Button variant="ghost">
          <Link size={16} /> shared
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Shares list</DialogTitle>
          <DialogDescription>
            Here you can manage the users with whom this document is shared.
          </DialogDescription>
        </DialogHeader>
        <SharedList users={users} />
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button type="submit">Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </form>
  </Dialog>
);

export default SharedWithDialog;
