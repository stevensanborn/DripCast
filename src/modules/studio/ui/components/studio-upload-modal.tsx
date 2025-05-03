"use client"

import { Button } from "@/components/ui/button"
import { trpc } from "@/trpc/client";
import { Loader2, Loader2Icon, PlusIcon } from "lucide-react"
import { toast } from "sonner";
import { ResponsiveModal } from "./responsive-modal";
import StudioUploader from "./studio-uploader";
import { useRouter } from "next/navigation";

export const StudioUploadModal = () => {
    const router = useRouter();
    const utils = trpc.useUtils();
    const create = trpc.videos.create.useMutation({
        onSuccess: ()=>{
            toast.success("Video created");
            utils.studio.getMany.invalidate();
        },
        onError: ()=>{
            toast.error("Error creating video");
        }
    });

    const onSuccess = ()=>{
        if(!create.data?.video)return;
        create.reset();
        router.push(`/studio/videos/${create.data.video.id}`);
    }

    return (
        <>
        <ResponsiveModal title={"Upload Video"} open={!!create.data?.url}  onOpenChange={()=>{create.reset()}} >
                
            {
            create.data?.url ? 
                <StudioUploader endpoint={create.data?.url} onSuccess={onSuccess} />
                : <Loader2Icon className="animate-spin"></Loader2Icon>
            }
        </ResponsiveModal>
        
        <Button variant="outline"  onClick={()=>{
            create.mutate();
        }} disabled={create.isPending} >
            {create.isPending? <Loader2 className="animate-spin"></Loader2> : <PlusIcon className="size-4 mr-2"></PlusIcon>}
            Create
        </Button>
       </>
    )
}