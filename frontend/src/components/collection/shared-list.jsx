import { Button } from "@/components/ui/button";
import { BanIcon, MoreHorizontalIcon, Search } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
const SharedList = ({ users }) => {
  return (
    <div className="space-y-6" initial="hidden" animate="visible" exit="hidden">
      <InputGroup>
        <InputGroupInput placeholder="Type to search..." />
        <InputGroupAddon align="inline-end">
          <InputGroupButton variant="secondary">
            <Search />
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>

      {users.map(({ username, fullName }) => (
        <div key={username} className="flex items-center gap-1 justify-between">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-secondary" />
            <div>
              <span className="block text-sm leading-none font-semibold">
                {fullName}
              </span>
              <span className="text-xs leading-none">@{username}</span>
            </div>
          </div>
          <div className="flex items-center ">
            <Select>
              <SelectTrigger className="w-fit">
                <SelectValue placeholder="----" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Access</SelectLabel>
                  <SelectItem value="apple">Editor</SelectItem>
                  <SelectItem value="banana">Viewer</SelectItem>
                  <SelectItem value="pineapple">Owner</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SharedList;
