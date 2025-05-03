import { cn } from "@/lib/utils"


import {Tooltip, TooltipContent, TooltipTrigger} from "@/components/ui/tooltip"
import { cva, VariantProps } from "class-variance-authority"


const userInfoVariants = cva("flex items0center gap-1",{
variants:{
    variant:{
        default:"[&_p]:text-sm [&_svg]:size-4",
        lg:"[&_p]:text-base [&_svg]:size-5 [&_p]:font-medium [&_p]:text-black",
        sm:"[&_p]:text-xs [&_svg]:size-3.5",
    },
    },
    defaultVariants:{
        variant:"default"
    }
})

interface UserInfoProps extends VariantProps<typeof userInfoVariants>{
    name:string;
    className?:string;
    
};

export const UserInfo = ({name,className,variant}:UserInfoProps)=>{

    return <div className={cn(userInfoVariants({variant}),className)}>
       
            <Tooltip>
                <TooltipTrigger asChild>
                    <p className="text-gray-500 hover:text-gray-700 line-clamp-1">{name}</p>
                </TooltipTrigger>
                 <TooltipContent align="center" className="bg-black/70">
                    <p>{name}</p>
                </TooltipContent>
            </Tooltip>
       
    </div>
}
        