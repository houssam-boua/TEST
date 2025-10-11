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
import { Eye, History, Info, Lock, MessageCircleMore } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ItemIcon } from "./item-icon";
export function SheetDemo({
  infos = [],
  comments = [],
  versions = [],
  access = [],
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

  const infoItems = safeMap(infos);
  const accessItems = safeMap(access);
  const commentItems = safeMap(comments);
  const versionItems = safeMap(versions);
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Eye strokeWidth={0.5} size={20} />
      </SheetTrigger>
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
            <TabsContent value="info">
              <div className="flex flex-col gap-3">
                {infoItems.length === 0 ? (
                  <span className="text-sm text-muted-foreground">
                    Aucune information.
                  </span>
                ) : (
                  infoItems.map((it, idx) => (
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
            <TabsContent value="comments">
              <div className="flex flex-col gap-3">
                {commentItems.length === 0 ? (
                  <span className="text-sm text-muted-foreground">
                    Aucun commentaire.
                  </span>
                ) : (
                  commentItems.map((it, idx) => (
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
            <TabsContent value="version">
              <div className="flex flex-col gap-3">
                {versionItems.length === 0 ? (
                  <span className="text-sm text-muted-foreground">
                    Aucune version.
                  </span>
                ) : (
                  versionItems.map((it, idx) => (
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
          </Tabs>{" "}
        </div>
      </SheetContent>
    </Sheet>
  );
}
