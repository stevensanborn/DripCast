"use client"

import { UploadDropzone } from "@/lib/uploadthing";
import { ResponsiveModal } from  "@/modules/studio/ui/components/responsive-modal"
import { trpc } from "@/trpc/client";
import { toast } from "sonner";

interface BannerUploadModalProps{
    userId:string;
    open:boolean;
    onOpenChange:(open:boolean)=>void;
}


export const BannerUploadModal = ({userId,open,onOpenChange}:BannerUploadModalProps) => {

    const utils = trpc.useUtils();
    const onUploadComplete = ()=>{
        onOpenChange(false); 
        utils.users.getOne.invalidate({id:userId})
        toast.success("Banner uploaded successfully")
    }
    return (
        <ResponsiveModal title="Upload a Banner" open={open} onOpenChange={onOpenChange}>
            <UploadDropzone 
            endpoint={"bannerUploader"}
            onClientUploadComplete={onUploadComplete}
            onUploadError={(error:Error)=>{
                console.log(error)
            }}
            />
        </ResponsiveModal>
    )
}
