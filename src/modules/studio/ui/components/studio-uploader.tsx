
import  MuxUploader from "@mux/mux-uploader-react";
// import { MuxUploaderProvider } from "@mux/mux-uploader-react";

interface StudioUploaderProps {
    endpoint?: string|null;
    onSuccess: () => void;
}

const UPLOADER_ID = "video-uploader";

 const StudioUploader = ({endpoint, onSuccess}: StudioUploaderProps) => {
    return (
        <div>
          
                <MuxUploader  endpoint={endpoint} className=" group/uploader" id={UPLOADER_ID} onSuccess={onSuccess} />
                
           
        </div>
    )
}

export default StudioUploader;