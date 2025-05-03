"use client"
import {toast} from "sonner"

import { trpc } from "@/trpc/client"
import { useClerk } from "@clerk/nextjs"


interface UseSubscriptionProps{
    userId:string,
    isSubscribed:boolean,
    fromVideoId?:string  //tells you which to invalidate depending where you are coming from
}


export const useSubscription = ({userId,isSubscribed,fromVideoId}:UseSubscriptionProps)=>{
    
    const utils = trpc.useUtils()

    const clerk = useClerk()

    const subscribe = trpc.subscriptions.create.useMutation({
        onSuccess:()=>{
            
            toast.success("Subscribed to creator")
            utils.subscriptions.getMany.invalidate()
            utils.subscriptions.invalidate()
            utils.videos.getManySubscribed.invalidate()
           
            if(fromVideoId){
                utils.videos.getOne.invalidate({id:fromVideoId})
            }
            utils.users.getOne.invalidate({id:userId})
            
        },
        onError:(error)=>{
            toast.error(error.message)
            if(error.data?.code === "UNAUTHORIZED"){
                clerk.openSignIn({redirectUrl:window.location.href})
            }
        }
    })

    const unsubscribe = trpc.subscriptions.remove.useMutation({
        onSuccess:()=>{
            toast.success("Unsubscribed from creator")
            utils.subscriptions.invalidate()
            utils.subscriptions.getMany.invalidate()
            utils.videos.getManySubscribed.invalidate()
            if(fromVideoId){
                utils.videos.invalidate()
            }

            utils.users.getOne.invalidate({id:userId})
        }
    })

    const isPending = subscribe.isPending || unsubscribe.isPending

    const onClick = ()=>{
        if(isSubscribed){
            unsubscribe.mutate({userId})
        }
        else {
            subscribe.mutate({userId})
        }
        
        
    }   

    return {
        isPending,
        onClick
    }

}