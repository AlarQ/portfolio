import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export interface AuthorInfoProps {
  readonly name: string;
  readonly title?: string;
  readonly avatarSrc?: string;
  readonly fallback: string;
}

/**
 * Bespoke molecule composing the shadcn `Avatar` primitive with author
 * name/title text. Binds only to semantic Tailwind classes.
 */
export function AuthorInfo({ name, title, avatarSrc, fallback }: AuthorInfoProps) {
  return (
    <div className="flex items-center gap-3">
      <Avatar>
        {avatarSrc ? <AvatarImage src={avatarSrc} alt={name} /> : null}
        <AvatarFallback>{fallback}</AvatarFallback>
      </Avatar>
      <div className="flex flex-col">
        <span className="text-sm font-medium text-foreground">{name}</span>
        {title ? <span className="text-sm text-muted-foreground">{title}</span> : null}
      </div>
    </div>
  );
}
