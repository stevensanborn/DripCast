import { CategoriesSection } from "../sections/categories-section"
import { HomeVideosSection } from "../sections/home-videos-section"

interface HomeViewProps {
  category_id?: string
}

export const HomeView = ({category_id}:HomeViewProps) => {
  return ( 
  
    <div className="max-w-[2400px] mx-auto mb-10 px-4 pt-2.5 flex flex-col gap-y-6">

        <CategoriesSection category_id={category_id}/>

        <HomeVideosSection category_id={category_id}/>
        
    </div>
     
  )
}