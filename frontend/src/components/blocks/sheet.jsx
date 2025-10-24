import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  ChevronRight,
  Eye,
  History,
  Info,
  Lock,
  MessageCircleMore,
  MessagesSquare,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ItemIcon } from "./item-icon";
import SheetCommentSection from "./sheet-comment-section";
import SheetVersionSection from "./sheet-version-section";
import SheetInfoSection from "./sheet-info-section";
export function SheetDemo({
  infos = [],
  comments = [],
  versions = [],
  access = [],
  // optional controlled open state
  open,
  onOpenChange,
}) {
  const safeMap = (list) =>
    Array.isArray(list)
      ? list.map((it) => ({
          icon: it && typeof it === "object" ? it.icon ?? null : null,
          title: it && typeof it === "object" ? String(it.title ?? "") : "",
          description:
            it && typeof it === "object" ? String(it.description ?? "") : "",
        }))
      : [];

  // pass raw infos to the Info tab so it can display full document objects
  const infoItems = Array.isArray(infos) ? infos : [];
  const accessItems = safeMap(access);
  const commentItems = safeMap(comments);
  const versionItems = safeMap(versions);
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      {/* Only render the trigger when uncontrolled (no open/onOpenChange passed) */}
      {typeof open === "undefined" && typeof onOpenChange === "undefined" ? (
        <SheetTrigger asChild>
          <Button variant="secondary" className="w-6 h-6">
            <ChevronRight strokeWidth={0.5} size={20} />
          </Button>
        </SheetTrigger>
      ) : null}
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Document Information</SheetTitle>
          <SheetDescription></SheetDescription>
        </SheetHeader>
        <div className="grid flex-1 auto-rows-min gap-6 px-4 ">
          <Tabs defaultValue="info" className=" ">
            <TabsList className="bg-white">
              <TabsTrigger value="info">
                Info
                <Info className="text-primary" strokeWidth={1.5} />
              </TabsTrigger>
              <TabsTrigger value="access">
                <Lock className="text-primary" strokeWidth={1.5} />
                Access
              </TabsTrigger>
              <TabsTrigger value="comments">
                <MessageCircleMore className="text-primary" strokeWidth={1.5} />
                Comments
              </TabsTrigger>
              <TabsTrigger value="version">
                <History className="text-primary" strokeWidth={1.5} />
                Version
              </TabsTrigger>
            </TabsList>
            <SheetInfoSection infos={infoItems} />
            <TabsContent value="access">
              <div className="flex flex-col gap-3">
                {accessItems.length === 0 ? (
                  <span className="text-sm text-muted-foreground">
                    Aucun accès.
                  </span>
                ) : (
                  accessItems.map((it, idx) => (
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
            <SheetCommentSection comments={commentItems} />
            <SheetVersionSection versions={versionItems} />
          </Tabs>{" "}
        </div>
      </SheetContent>
    </Sheet>
  );
}
