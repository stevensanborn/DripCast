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
                    <h3 className="text-dripcast-blue hover:text-dripcast-blue/70 line-clamp-1">{name}</h3>
                </TooltipTrigger>
                 <TooltipContent align="center" className="bg-dripcast_blue/70 text-dripcast-blue">
                    <p>{name}</p>
                </TooltipContent>
            </Tooltip>
       
    </div>
}
        