
import {HydrateClient, trpc} from "@/trpc/server"
import { HomeView } from "@/modules/home/ui/views/home-view"
import { INFINITE_QUERY_LIMIT } from "@/constants";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{
   category_id?: string
  }>
}

const Page = async ({searchParams}:PageProps) =>{
  
  const {category_id} = await searchParams;
  
    await trpc.categories.getMany.prefetch()
    await trpc.videos.getMany.prefetch({limit:INFINITE_QUERY_LIMIT,categoryId:category_id})
 
  
  return (
    
    <div className="">
        <HydrateClient>
          <HomeView category_id={category_id}/>
        </HydrateClient>
    </div>
    
  );
}     

export default Page
