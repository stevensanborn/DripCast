import { INFINITE_QUERY_LIMIT } from "@/constants";
import { SubscriptionsView } from "@/modules/subscriptions/ui/views/subscriptions-view";
import { trpc } from "@/trpc/server";
import { HydrateClient } from "@/trpc/server";

const SubscriptionsPage = () => {
    void trpc.subscriptions.getMany.prefetchInfinite({
        limit: INFINITE_QUERY_LIMIT,
    })      

    return (
        <HydrateClient>
            <SubscriptionsView />
        </HydrateClient>
    )
}   

export default SubscriptionsPage;