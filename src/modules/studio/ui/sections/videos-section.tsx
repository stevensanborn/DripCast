"use client"

import { trpc } from "@/trpc/client";
import { INFINITE_QUERY_LIMIT } from "@/constants";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { InfiniteScroll } from "@/components/infinite-scroll";
import { Table, TableBody, TableHead, TableHeader, TableRow, TableCell } from "@/components/ui/table";
import Link from "next/link";
import { VideoThumbnail } from "@/modules/videos/ui/components/video-thumbnail";
import { snakeCaseToTitleCase } from "@/lib/utils";
import { format } from "date-fns";
import { Banknote, CircleCheckIcon, LockIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

interface VideosSectionProps{
    userId:string
    visibility:"public" | "private" | null | undefined
}

export const VideosSection = ({userId,visibility}:VideosSectionProps) => {
    return (
        <Suspense fallback={<VideoSectionSkeleton />}>
            <ErrorBoundary fallback={<p>Error</p>}>
            <VideosSectionSuspense userId={userId} visibility={visibility} />
            </ErrorBoundary>
        </Suspense>
    )
}

const VideoSectionSkeleton = () => {
    return  (
        <>
        <div>
        <div className="border border-y ">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="pl-6 w-[510px]">Video</TableHead>
                            <TableHead>Visibility</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead  className="text-right ">Views</TableHead>
                            <TableHead className="text-right pr-6   ">Likes</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                            
                        </TableRow>
                    </TableHeader>  
                    <TableBody>

                        {Array.from({length:5}).map((_,index)=>(
                            <TableRow key={index}>
                                <TableCell  className="pl-6" >

                                    <div className="flex items-center gap-4">
                                        <Skeleton  className="h-20 w-36 " />
                                        <div className="flex flex-col gap-2">
                                                <Skeleton className="h-4 w-[100px]" />
                                                <Skeleton className="h-4 w-[150px]" />
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                   <Skeleton className="h-4 w-20" />
                                </TableCell>
                                <TableCell>
                                <Skeleton className="h-4 w-16" />
                                </TableCell>
                                <TableCell>
                                    <Skeleton className="h-4 w-20" />
                                </TableCell>
                                <TableCell className="text-right">
                                    <Skeleton className="h-4 w-16" />
                                </TableCell>
                             
                                <TableCell className="text-right">
                                    <Skeleton className="h-4 w-16 pr-6" />
                                </TableCell>
                                <TableCell className="text-right">
                                   <Skeleton className="h-4 w-16" />
                                </TableCell> 
                            </TableRow>
                        ))}
                    </TableBody>
            </Table>        
            </div>
        </div>
        </>
    )
}



const VideosSectionSuspense = ({userId,visibility}:VideosSectionProps) => {

    const [data,query] = trpc.videos.getMany.useSuspenseInfiniteQuery({
        limit: INFINITE_QUERY_LIMIT,
        userId:userId,
        visibility:visibility   
    },{
        getNextPageParam: (lastPage) => lastPage.nextCursor,
    })
    
    return (
        <div>
            <div className="border border-y ">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="pl-6 w-[510px]">Video</TableHead>
                            <TableHead>Visibility</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead  className="text-right ">Views</TableHead>
                            <TableHead className="text-right">Comments</TableHead>
                            <TableHead className="text-right pr-6   ">Likes</TableHead>
                            
                        </TableRow>
                    </TableHeader>  
                    <TableBody>
                        {data.pages.flatMap((page) => page.items).map((video) => (
                                <Link prefetch  href={`/studio/videos/${video.id}`}  key={video.id} legacyBehavior>
                                     <TableRow className="cursor-pointer">
                           
                                        <TableCell className="pl-6 ">
                                          <div className="flex items-center gap-4">
                                            <div className="aspect-video relative h-36 shrink-0">
                                                <VideoThumbnail 
                                                imageURL={video.thumbnailUrl}
                                                previewURL={video.previewUrl} 
                                                title={video.title}
                                                duration={video.duration || 0}
                                                />
                                            </div>
                                            <div className="flex flex-col gap-y-1 overflow-hidden">
                                                <span className="font-medium truncate line-clamp-1"> {video.title}</span>
                                                <span className="text-sm text-muted-foreground truncate line-clamp-2"> {video.description || "No description"}</span>
                                            </div>
                                          </div>
                                        </TableCell>
                                        <TableCell className="pl-6 ">
                                            <div className="flex items-center">
                                            {
                                            video.visibility=="private"?<LockIcon className="size-4 mr-2" />:
                                            <CircleCheckIcon className="size-4 mr-2" />
                                            }
                                            {snakeCaseToTitleCase(video.visibility)}
                                            </div>
                                        </TableCell>
                                        <TableCell className="pl-6 ">
                                           <div className="flex items-center ">{snakeCaseToTitleCase(video.muxStatus || "error")}</div>
                                        </TableCell>
                                        <TableCell className="text-sm truncate ">
                                            {format(new Date(video.createdAt),"MMM d, yyyy")}
                                        </TableCell>
                                        <TableCell className="pl-6 text-right text-sm">
                                         {video.viewCount}
                                        </TableCell>
                                        
                                        <TableCell className="pl-6 text-right text-sm pr-6">
                                           {video.likeCount}
                                        </TableCell>
                                        <TableCell className="pl-6 text-right text-sm">
                                           <Link href={`studio/videos/${video.id}/monetization`} className="text-blue-500 hover:underline">
                                            <Button variant="outline" size="sm"><Banknote className="size-4 mr-2"></Banknote> Monetize</Button>
                                           </Link>
                                        </TableCell>
                                </TableRow>
                                </Link>
                                
                           
                        ))}
                    </TableBody>
                </Table>
            </div>
            
            <InfiniteScroll
            isManual={false}
            hasNextPage={query.hasNextPage}
            isFetchingNextPage={query.isFetchingNextPage}
            fetchNextPage={query.fetchNextPage}
            />
        </div>
    )
}

export default VideosSection;   