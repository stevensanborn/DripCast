import { MonetizationSection } from "../sections/monetization-section"

interface MonetizationViewProps {
    videoId: string
}

export const MonetizationView = ({videoId}:MonetizationViewProps) => {
    
    return (
        <div className="px-4 pt-2.5 max-w-screen-lg ">
            <div>
               <MonetizationSection videoId={videoId} />
            </div>
            
        </div>
    )
}   