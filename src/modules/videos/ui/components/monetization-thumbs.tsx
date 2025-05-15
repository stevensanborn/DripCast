import {monetization, monetizationPayments} from "@/db/schema"
import {  CircleCheckIcon,  CircleMinusIcon,    VideoIcon, VideoOffIcon } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Donut } from "@/components/donut";
import { timeLeftForPayment, toTime } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface MonetizationThumbsProps{
    monetizations: typeof monetization.$inferSelect[]
    payments: typeof monetizationPayments.$inferSelect[];
    onClickThumb: (m: typeof monetization.$inferSelect) => void;
    purchaseMonetization: (m: typeof monetization.$inferSelect) => void;
}

interface MonetizationThumbProps {
    m: typeof monetization.$inferSelect;
    payments: typeof monetizationPayments.$inferSelect[];
    onClickThumb: (m: typeof monetization.$inferSelect) => void;
    purchaseMonetization: (m: typeof monetization.$inferSelect) => void;
}

export const MonetizationThumbs = ({monetizations, payments, onClickThumb, purchaseMonetization}:MonetizationThumbsProps) => {
    return (
        <div className="flex gap-2 w-full justify-end mt-2">
            {monetizations.map((monetization)=>(
              <MonetizationThumb key={monetization.id} m={monetization} payments={payments} onClickThumb={onClickThumb} purchaseMonetization={purchaseMonetization} />
            ))}
        </div>
    )
}

export const MonetizationThumb = ({m, payments, onClickThumb, purchaseMonetization}:MonetizationThumbProps) => {
    const [timeLeft, setTimeLeft] = useState(m.duration)
    
    //get payments related to the monetization soerted by date
    const paymentsForMonetization = useMemo(()=>{  return payments.filter((payment)=>payment.monetizationId === m.id).sort((a,b)=>new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())}
    ,[payments,m])

    const paymentStatus=useMemo(()=>{
       
        const obj:{
            expired:boolean,
            expiredAt:number,
            payment:typeof monetizationPayments.$inferSelect | null
        }={
            expired:false,
            expiredAt:0,
            payment:null
        }
       
        if(paymentsForMonetization.length === 0)
            return obj
        else
            obj.payment = paymentsForMonetization[0] //grab the latest payment

        if(!!m.duration === false) return obj
        
        const secondsLeft = timeLeftForPayment(m,obj.payment)
        console.log('secondsLeft:',secondsLeft)
        obj.expiredAt = new Date(obj.payment.updatedAt).getTime() + (m.duration *1000)
        if(secondsLeft < 0){
            obj.expired = true
        }
        return obj
    },[paymentsForMonetization,payments,timeLeft])

    

    useEffect(()=>{
        if(paymentStatus.payment){
        let timer:NodeJS.Timeout | null = null
        const onTick = ()=>{
            timer=setTimeout(()=>{
                if(paymentStatus.payment){
                    const t = timeLeftForPayment(m,paymentStatus.payment)
                    setTimeLeft(t<0?0:t)
                }
                onTick()
            },1000)
        }
        if(paymentStatus.payment){
            setTimeLeft(timeLeftForPayment(m,paymentStatus.payment))
        }
       timer = setTimeout(()=>{  onTick() },1000)
       if(timer) return ()=>clearTimeout(timer!)
       }
    },[paymentStatus.payment])

    return (
        <Popover key={m.id}>
        <PopoverTrigger asChild>
               
                {
                (paymentStatus.expired || !!paymentStatus.payment === false ) ? (
                     <div onClick={()=>onClickThumb(m)} className="w-10 h-10 bg-gray-700 rounded-full border-[1px] border-gray-700 cursor-pointer flex items-center justify-center text-muted-foreground hover:text-white transition-all duration-200 hover:bg-gray-700">
                        <VideoOffIcon className="w-4 h-4  " />
                     </div>
                    
                ) : (
                    <div  
                        onClick={()=>onClickThumb(m)} 
                        className={cn( paymentStatus.expired?'border-crayola_red-500':' border-emerald-500' ,"w-10 h-10 bg-gray-800 relative rounded-full border-[1px] cursor-pointer flex items-center justify-center text-muted-foreground hover:text-white transition-all duration-200 hover:bg-gray-700 ")}>
                            <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
                            { (timeLeft!=null && !!m.duration) && (<Donut progress={ (timeLeft/m.duration!)} />)}
                        </div>
                        <VideoIcon className="w-4 h-4 " />
                    </div>
                )}
            
        </PopoverTrigger>
        <PopoverContent className="border-[1px] border-gray-700 bg-secondary rounded-md ">
            <div className="flex flex-col gap-2 items-start ">
            <p className="text-sm font-medium leading-none">{m.title}</p>
            {m.description && <p className="text-sm text-muted-foreground leading-none">{m.description}</p>}
            <p className="text-sm font-medium leading-none text-dripcast_blue"><span className="text-xs text-foreground-muted">cost: </span>{m.cost/1_000_000_000}</p>
            <p className="text-xs font-medium leading-none text-muted-foreground flex items-start gap-2 justify-center">
                <span className="text-xs text-foreground-muted">Purchased: </span> 
                <span className={`text-xs text-foreground-muted ${paymentStatus.payment?'text-green-700':'text-crayola_red'}`}>{paymentStatus.payment?<CircleCheckIcon className="w-4 h-4" />:<CircleMinusIcon className="w-4 h-4" />}</span>
                {paymentStatus.payment && (<span className="text-xs text-foreground-muted">{new Intl.DateTimeFormat("en-US",{ dateStyle: "short",
    timeStyle: "short",}).format(paymentStatus.payment.updatedAt)} </span>)}
            </p>
            
            {!!m.duration && (
                <p className="text-xs font-medium leading-none text-muted-foreground flex items-start gap-2 justify-center">
                    <span className="text-xs text-foreground-muted"> Time Left: </span>
                    <span className="text-xs text-foreground-muted">{ paymentStatus.expired?<span className="text-crayola_red">Expired</span>:<span className="text-green-700">Active</span>}</span>
                    {!paymentStatus.expired?<span className="text-xs text-foreground-muted">{ timeLeft!=null?toTime(timeLeft):'0' } </span> :<span className="text-xs text-foreground-muted">{ timeLeft!=null && toTime(timeLeft)} </span>}    
                </p>
            )}
            
            {
                paymentStatus.payment && paymentStatus.payment.transactionId && (
                    <p className="text-xs font-medium leading-none text-muted-foreground flex items-start gap-2 justify-center">
                        <span className="text-xs text-foreground-muted">Transaction ID: </span>
                        <span className="text-xs text-foreground-muted"><Link href={`https://explorer.solana.com/tx/${paymentStatus.payment.transactionId}?cluster=devnet`} target="_blank" className="text-dripcast_blue underline">{paymentStatus.payment.transactionId.slice(0,4)}...{paymentStatus.payment.transactionId.slice(-4)}</Link></span>
                    </p>
                )
            }
            { (paymentStatus.expired || !!paymentStatus.payment === false ) &&
                (
                <Button variant="outline" className="rounded-full contain-content" onClick={
                ()=>{
                    purchaseMonetization(m)
                }
            }>  Purchase</Button>
            )}
            </div>
        </PopoverContent>
    </Popover>
    )
}

