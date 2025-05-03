import { useUser,useClerk} from "@clerk/nextjs"
import  UserAvatar  from "@/components/user-avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {  useForm } from "react-hook-form"
import { Form, FormField, FormItem, FormControl, FormMessage } from "@/components/ui/form"
import { z } from "zod"
import {toast} from "sonner"
import { trpc } from "@/trpc/client"
import { commentInsertSchema } from "@/db/schema"

interface CommentFormProps{
    videoId:string,
    variant?: "comment" | "reply",
    parentId?:string,
    onSuccess?:()=>void,
    onCancel?:()=>void
}

export const CommentForm = ({videoId,variant="comment",parentId,onSuccess,onCancel}:CommentFormProps) => {
    const utils = trpc.useUtils()
    const clerk = useClerk()
    const {user} = useUser()

    type CommentFormData = {
        videoId: string;
        parentId: string | null;
        value: string;
    };
    
    const form = useForm<CommentFormData>({
        defaultValues: {
            videoId: videoId,
            parentId: parentId,
            value: ""
        }
    });

    const createComment = trpc.comments.create.useMutation({
        onSuccess:()=>{
            utils.comments.getMany.invalidate({videoId:videoId})
            utils.comments.getMany.invalidate({videoId:videoId,parentId:parentId}) //replies refetch
            form.reset()
            toast.success("Comment created successfully")
            onSuccess?.()
        },

        onError:(error)=>{
            
            if(error.data?.code === "UNAUTHORIZED"){
                clerk.openSignIn({redirectUrl:window.location.href})
            }
            else{
                toast.error("Failed to create comment")
            }
        }
    })

    const handleSubmit = form.handleSubmit(async (values: CommentFormData) => {
        if(!user) {
            toast.error("You must be logged in to comment");
            return;
        }

        try {
            const commentData: z.infer<typeof commentInsertSchema> = {
                ...values,
                userId: user.id
            };
            console.log(commentData)
            await createComment.mutateAsync(commentData);
        } catch(error) {
            console.error(error)
            toast.error("Failed to create comment");
        }
    });

    const handleCancel = ()=>{
        form.reset()
        onCancel?.()
    }

    return (
        <div>
            <Form {...form}>
            <form className="flex gap-4 group" onSubmit={handleSubmit}>
                <UserAvatar size="lg" imageUrl={user?.imageUrl || "/user-placeholder.svg"} name={user?.username || "user"} />

                <div className="flex-1">
                    <FormField control={form.control} name="value" 
                    render={({field})=>(
                        <FormItem>
                            <FormControl>
                                <Textarea className="resize-none bg-transparent overflow-hidden min-h-0 w-full"
                                    placeholder={variant === "comment" ? "Add a comment..." : "Add a reply..."}
                                    {...field}
                                ></Textarea>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}></FormField>

                    <div className="justify-end mt-2 gap-2 flex">
                        {onCancel && (
                            <Button type="button" size="sm"  onClick={handleCancel}>
                                Cancel
                            </Button>
                        )}
                        <Button type="submit" size="sm" disabled={createComment.isPending}>
                            {variant === "comment" ? "Comment" : "Reply"}
                            {createComment.isPending ?? "..." }
                        </Button>
                    </div>
                </div>
            </form>
            </Form>
        </div>
    )
}