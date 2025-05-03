"use client"

import { UploadDropzone } from "@/lib/uploadthing";
import { ResponsiveModal } from "./responsive-modal";
import { trpc } from "@/trpc/client";
import { toast } from "sonner";

interface ThumbnailUploadModalProps{
    videoId:string;
    open:boolean;
    onOpenChange:(open:boolean)=>void;
}


export const ThumbnailUploadModal = ({videoId,open,onOpenChange}:ThumbnailUploadModalProps) => {

    const utils = trpc.useUtils();
    const onUploadComplete = ()=>{
        onOpenChange(false); 
        utils.studio.getOne.invalidate({id:videoId})
        utils.studio.getMany.invalidate()
        toast.success("Thumbnail uploaded successfully")
    }
    return (
        <ResponsiveModal title="Upload a Thumbnail" open={open} onOpenChange={onOpenChange}>
            <UploadDropzone 
            endpoint={"thumbnailUploader"}
            input={{videoId}}
            onClientUploadComplete={onUploadComplete}
            onUploadError={(error:Error)=>{
                console.log(error)
            }}
            />
        </ResponsiveModal>
    )
}
