import { Separator } from "@/components/ui/separator";
import { AccountSection } from "@/modules/studio/ui/sections/account-section";
export default function AccountPage(){
    return (
        <div className="flex flex-col gap-y-6 pt-2.5">
            <div className="px-4">
                <h1 className="text-2xl font-bold">Account</h1>
                <p className=" text-xs text-muted-foreground">
                 Your account information and settings
                </p>
                <Separator className="my-4" />

                <AccountSection />
            </div>
        </div>
    )
}