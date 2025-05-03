import { useIntersectionObserver } from "@/hooks/use-intersection-observer";
import { useEffect } from "react";
import { Button } from "./ui/button";


interface InfiniteScrollProps {
    isManual?: boolean;
    hasNextPage: boolean | undefined;
    isFetchingNextPage: boolean;
    fetchNextPage: () => void;
    
}

export const InfiniteScroll = ({
    isManual,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    
}: InfiniteScrollProps) => {
    const {targetRef,isIntersecting} = useIntersectionObserver({
        threshold: 0.5,
        rootMargin: '100px',

    });

    useEffect(()=>{
        if(isIntersecting && hasNextPage && !isFetchingNextPage && !isManual){
            fetchNextPage();
        }
    },[isIntersecting,hasNextPage,isFetchingNextPage,fetchNextPage,isManual])

    return (
        <div className="flex flex-col gap-4 items-center p-4">
            <div ref={targetRef} className="h-1">
            {
                hasNextPage ? (
                    <Button
                    variant="secondary"
                     onClick={fetchNextPage}
                     disabled={isFetchingNextPage}>
                        {isFetchingNextPage ? 'Loading...' : 'Load More'}
                    </Button>
                ) : (
                    <p className="text-sm text-muted-foreground">No more items</p>
                )
            }
            </div>
        </div>
    )
}