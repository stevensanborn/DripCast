
import {HydrateClient, trpc} from "@/trpc/server"
import { INFINITE_QUERY_LIMIT } from "@/constants";
import { SubscriptionsView } from "@/modules/home/ui/views/subscriptions-view";
export const dynamic = "force-dynamic";


const Page = async () =>{
  
    await trpc.videos.getManySubscribed.prefetch({limit:INFINITE_QUERY_LIMIT})
 
  
  return (
    
    <div className="">
        <HydrateClient>
          <SubscriptionsView />
        </HydrateClient>
    </div>
    
  );
}     

export default Page
