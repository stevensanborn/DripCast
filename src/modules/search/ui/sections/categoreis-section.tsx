"use client"
import { FilterCarousel } from "@/components/filter-carousel"
import { trpc } from "@/trpc/client"
import { Suspense } from "react"
import { ErrorBoundary } from "react-error-boundary"
import { useRouter } from "next/navigation"

interface CategoriesSectionProps {
  categoryId?: string
}


export const CategoriesSection = ({categoryId}:CategoriesSectionProps) => {
  return (
    <Suspense fallback={<FilterCarousel isLoading value={categoryId} data={[]} onSelect={()=>{}} />}>
        <ErrorBoundary fallback={<p>Error...</p>}>
            <CategoriesSectionSuspense categoryId={categoryId}/>
        </ErrorBoundary>
    </Suspense>
  )
}


 const CategoriesSectionSuspense = ({categoryId}:CategoriesSectionProps) => {
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
      <FilterCarousel  value={categoryId} data={data} onSelect={onSelect} />
    </div>
  )
}