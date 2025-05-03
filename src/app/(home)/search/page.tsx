import { INFINITE_QUERY_LIMIT } from "@/constants"
import { SearchView } from "@/modules/search/ui/views/search-view"
import { HydrateClient, trpc } from "@/trpc/server"

export const dynamic = "force-dynamic"


interface SearchPageProps{
    searchParams:Promise<{
        query:string | undefined,
        category_id:string | undefined,
    }>
}

const SearchPage = async ({searchParams}:SearchPageProps)=>{
    const {query,category_id} = await searchParams
    void trpc.search.getMany.prefetchInfinite({query:decodeURIComponent(query!),limit:INFINITE_QUERY_LIMIT,categoryId:category_id})
    

    return(
        <HydrateClient>
            <SearchView query={query} categoryId={category_id}/>
        </HydrateClient>
    )
}

export default SearchPage