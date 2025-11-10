import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function Avatarr({ fstName, lstName, src, alt, className }) {
  // safely get first character of first and last name
  const first =
    typeof fstName === "string" && fstName.trim() ? fstName.trim()[0] : "";
  const last =
    typeof lstName === "string" && lstName.trim() ? lstName.trim()[0] : "";
  const initials = (first + last).toUpperCase();

  return (
    <Avatar className={className ?? "h-8 w-8 rounded-full bg-primary"}>
      {src ? <AvatarImage src={src} alt={alt ?? initials} /> : null}
      <AvatarFallback className="rounded-full text-primary">{initials}</AvatarFallback>
    </Avatar>
  );
}
