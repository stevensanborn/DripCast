import {monetization} from "@/db/schema"

interface MonetizationThumbsProps{
    videoId: string,
    monetizations: typeof monetization.$inferSelect[]
}
export const MonetizationThumbs = ({videoId,monetizations}:MonetizationThumbsProps) => {
    return (
        <div className="flex flex-col gap-2">
            {monetizations.map((monetization)=>(
                <div key={monetization.id}>
                    <div>{monetization.type}</div>
                </div>
            ))}
        </div>
    )
}