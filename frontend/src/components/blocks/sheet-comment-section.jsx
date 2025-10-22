import { TabsContent } from "@/components/ui/tabs";
import { ItemIcon } from "./item-icon";
import CommentsInputGroup from "./comments-input-group";
import { MessagesSquare } from "lucide-react";

const SheetCommentSection = ({ comments }) => {
  return (
    <TabsContent value="comments">
      <div className="flex flex-col gap-3">
        <CommentsInputGroup />
        {comments.length === 0 ? (
          <div className="text-xl text-muted-foreground/70 flex flex-col items-center gap-5 pt-4">
            <MessagesSquare strokeWidth={0.75} size={70} />
            <span>No Comments.</span>
          </div>
        ) : (
          comments.map((it, idx) => (
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
  );
};
export default SheetCommentSection;
