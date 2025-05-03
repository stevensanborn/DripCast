import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ListPlusIcon, MoreVerticalIcon, ShareIcon, TrashIcon } from "lucide-react";
import { toast } from "sonner";
import { APP_URL } from "@/constants";

interface VideoMenuProps{
    videoId: string;
    variant: "ghost" | "secondary";
    onRemove?: () => void;
}

export const VideoMenu = ({videoId,variant="ghost",onRemove}:VideoMenuProps) => {
 
    const onShare = () => {
        const fullUrl = `${APP_URL}/videos/${videoId}`;
        navigator.clipboard.writeText(fullUrl);
        toast.success("Link copied to clipboard");
    }
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant={variant} size="icon" className="rounded-full">
                    <MoreVerticalIcon  />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" onClick={(e)=>{e.stopPropagation();}}>
                <DropdownMenuItem onClick={()=>{onShare()}}>
                    <ShareIcon className="size-4 mr-2" /> Share
                </DropdownMenuItem>
                <DropdownMenuItem onClick={()=>{}}>
                    <ListPlusIcon className="size-4 mr-2" /> Add to playlist
                </DropdownMenuItem>
                {onRemove && (
                    <DropdownMenuItem onClick={()=>{onRemove()}}>
                        <TrashIcon className="size-4 mr-2" /> Remove
                    </DropdownMenuItem>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}