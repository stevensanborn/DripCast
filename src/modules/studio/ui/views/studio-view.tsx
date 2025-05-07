// import { Separator } from "@/components/ui/separator";
import VideosSection from "../sections/videos-section";


const StudioView = ({userId}:{userId:string}) => {
    return (
        <div className="flex flex-col gap-y-6 pt-2.5">
            <div className="px-4">
                <h1 className="text-2xl font-bold">Channel Content</h1>
                <p className=" text-xs text-muted-foreground">
                Manage your channel content and videos
                </p>
            </div>
            <VideosSection userId={userId} visibility={null}></VideosSection>
        </div>
    )
}



export default StudioView;