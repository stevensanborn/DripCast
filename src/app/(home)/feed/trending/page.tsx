
import {HydrateClient, trpc} from "@/trpc/server"
import { INFINITE_QUERY_LIMIT } from "@/constants";
import { TrendingView } from "@/modules/home/ui/views/trending-view";
export const dynamic = "force-dynamic";


const Page = async () =>{
  
    await trpc.videos.getManyTrending.prefetch({limit:INFINITE_QUERY_LIMIT})
 
  
  return (
    
    <div className="">
        <HydrateClient>
          <TrendingView />
        </HydrateClient>
    </div>
    
  );
}     

export default Page
