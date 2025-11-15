import { ShoppingCartIcon } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const IconAvatar = ({ icon, className }) => {
  return (
    <div className="relative w-fit">
      <Avatar className={`size-9 rounded-sm`}>
        <AvatarFallback className={`rounded-sm ${className}`}>
          {icon}
        </AvatarFallback>
      </Avatar>
    </div>
  );
};

export default IconAvatar;
