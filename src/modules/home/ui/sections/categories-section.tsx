"use client"
import { FilterCarousel } from "@/components/filter-carousel"
import { trpc } from "@/trpc/client"
import { Suspense } from "react"
import { ErrorBoundary } from "react-error-boundary"
import { useRouter } from "next/navigation"

interface CategoriesSectionProps {
  category_id?: string
}


export const CategoriesSection = ({category_id}:CategoriesSectionProps) => {
  return (
    <Suspense fallback={<FilterCarousel isLoading value={category_id} data={[]} onSelect={()=>{}} />}>
        <ErrorBoundary fallback={<p>Error...</p>}>
            <CategoriesSectionSuspense category_id={category_id}/>
        </ErrorBoundary>
    </Suspense>
  )
}


 const CategoriesSectionSuspense = ({category_id}:CategoriesSectionProps) => {
    const router = useRouter()
    const [categories] = trpc.categories.getMany.useSuspenseQuery()

    const data = categories.map((category) => ({
        value:category.id,
        label:category.name,
    }))

    const onSelect = (value:string|null) => {
        console.log(value)
        const url = new URL(window.location.href)

        if(value){
            url.searchParams.set("category_id",value)
        }else{
            url.searchParams.delete("category_id")
        }
        router.push(url.toString())
    }
  return (
    

    <div>
      <FilterCarousel  value={category_id} data={data} onSelect={onSelect} />
    </div>
  )
}