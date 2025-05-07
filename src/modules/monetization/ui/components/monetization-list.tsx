import { Button } from "@/components/ui/button"
import { monetization } from "@/db/schema"
import { getMonetizationType } from "@/lib/utils"
import { trpc } from "@/trpc/client"
import { Edit2, Edit2Icon, PlusIcon, Trash2 } from "lucide-react"
import { toast } from "sonner"

interface MonetizationListProps {
    videoId: string
    monetizations: typeof monetization.$inferSelect[]
    setSelectedMonetization: (m: typeof monetization.$inferSelect | null) => void
}

export const MonetizationList = ({ monetizations, videoId, setSelectedMonetization }: MonetizationListProps) => {
    const utils = trpc.useUtils()


    const removeMonetization = trpc.monetization.remove.useMutation({
        onSuccess: () => {
            toast.success("Monetization removed")
            utils.monetization.getMany.invalidate({ videoId })
            utils.studio.getOne.invalidate({ id: videoId })
        },
        onError: (error) => {
            toast.error(error.message)
        }
    })

    
    return (
        <div className="flex flex-col gap-2 w-full ">
            <div className="flex flex-col gap-2">
                <Button onClick={() => setSelectedMonetization(null)}><PlusIcon className="w-4 h-4" /> Add New Monetization</Button>
            </div>
            {monetizations.map((monetization) => (
                
                <div key={monetization.id} className="flex flex-col gap-2  rounded-xl overflow-hidden h-fit bg-slate-700 p-4">
                    <h2 className="text-med font-bold">{monetization.title}</h2>
                    <p className="text-sm text-gray-500"><i> {getMonetizationType(monetization.type)}</i></p>  
                    <p className="text-sm text-gray-500">cost : {monetization.cost}</p>
                    <p className="text-sm text-gray-500">times : {monetization.startTime} - {monetization.endTime}</p>
                    <p className="text-sm text-gray-500">{monetization.creatorKey}</p>
                    <p className="text-xs text-gray-500 line-clamp-2">{monetization.description}</p>
                    <div className="flex gap-2 mt-2">
                        <Button onClick={() => setSelectedMonetization(monetization)} className="text-xs">
                        <Edit2Icon  /> Edit</Button>
                            <Button onClick={() => removeMonetization.mutate({ id: monetization.id })}>
                            <Trash2 size={16} />
                            Remove</Button>
                    </div>
                </div>
            ))}
        </div>

    )
}