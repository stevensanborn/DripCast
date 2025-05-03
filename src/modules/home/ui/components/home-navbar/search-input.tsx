"use client"

import { Input } from "@/components/ui/input"
import { SearchIcon, XIcon } from "lucide-react"
import { Suspense, useState } from "react"
import { useRouter } from "next/navigation"
import { APP_URL } from "@/constants"
import { Button } from "@/components/ui/button"
import { useSearchParams } from "next/navigation"
import { Skeleton } from "@/components/ui/skeleton"

export const SearchInput = () => {
    return(
        <Suspense fallback={<Skeleton className="w-full h-10"/>}>
            <SearchInputSuspense />
        </Suspense>
    )
}

 const SearchInputSuspense = () => {
    const searchParams = useSearchParams()
    const query = searchParams.get("query") || ""
    const categoryId = searchParams.get("category_id") || ""

    const [value, setValue] = useState(query)
    const router = useRouter()
    const handleSearch = (e:React.FormEvent<HTMLFormElement>)=>{
       e.preventDefault()

       const url = new URL("/search",APP_URL)
       const newQuery = value.trim()
        
       url.searchParams.set("query",encodeURIComponent(newQuery))
       if(newQuery==""){
        url.searchParams.delete("query")
       }
       if(categoryId){
        url.searchParams.set("category_id",categoryId)
       }
       setValue(newQuery)
       router.push(url.toString())
    }

    //add search functionality
    return (
        <form className="flex relative w-full max-w-[600]" onSubmit={handleSearch}>
            <div className=" relative w-full">
                <Input 
                type="text" 
                placeholder="Search for products, categories, brands and more" 
                className="w-full  pl-4 py-2 pr-12 rounded-l-full border focus:outline-none focus:border-blue-500"
                value={value}
                onChange={(e)=>setValue(e.target.value)}
                />
                {
                    value && (
                        <Button type="button" 
                        variant="ghost"
                        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full" onClick={()=>setValue("")}>
                            <XIcon className="text-gray-500"/>
                        </Button>
                    )
                }
                
            </div>
            <button type="submit" 
            disabled={!value.trim()}
            className="bottom-0 px-5 bg-gray-100 border-l-0  rounded-r-full  border disabled:opacity-50 disabled:cursor-not-allowed ">
                <SearchIcon className="size-5"/>
            </button>
        </form>
        
    )  
}