import {monetization, monetizationPayments} from "@/db/schema"
import {  VideoIcon, VideoOffIcon } from "lucide-react"
import { monetization as monetizationType } from "@/db/schema"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
interface MonetizationThumbsProps{
    monetizations: typeof monetizationType.$inferSelect[]
    payments: typeof monetizationPayments.$inferSelect[];
    onClickThumb: (monetization: typeof monetizationType.$inferSelect) => void;
    purchaseMonetization: (monetization: typeof monetizationType.$inferSelect) => void;
}
export const MonetizationThumbs = ({monetizations, payments, onClickThumb, purchaseMonetization}:MonetizationThumbsProps) => {
    return (
        <div className="flex gap-2 w-full justify-end mt-2">
            {monetizations.map((monetization)=>(
                <Popover key={monetization.id}>
                    <PopoverTrigger asChild>
                            <div key={monetization.id} onClick={()=>onClickThumb(monetization)} className="w-10 h-10 bg-gray-800 rounded-full border-[1px] border-gray-700 cursor-pointer flex items-center justify-center text-muted-foreground hover:text-white transition-all duration-200 hover:bg-gray-700">
                            {
                            payments.find((payment)=>payment.monetizationId === monetization.id) ? (
                                <VideoIcon className="w-4 h-4 " />
                            ) : (
                                <VideoOffIcon className="w-4 h-4 " />
                            )}
                        </div>
                    </PopoverTrigger>
                    <PopoverContent className="border-[1px] border-gray-700 bg-secondary rounded-md ">
                        <div className="flex flex-col gap-4 items-start ">
                        <p className="text-sm font-medium leading-none">{monetization.title}</p>
                        <p className="text-sm text-muted-foreground leading-none">{monetization.description}</p>
                        <p className="text-sm font-medium leading-none text-dripcast_blue">{monetization.cost/1_000_000_000}</p>
                        <Button variant="outline" className="rounded-full contain-content" onClick={
                            ()=>{
                                purchaseMonetization(monetization)
                            }
                        }>Purchase</Button>
                        </div>
                    </PopoverContent>
                </Popover>
            ))}
        </div>
    )
}