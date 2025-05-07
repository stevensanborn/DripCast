import { inferRouterOutputs} from "@trpc/server";

import {AppRouter} from "@/trpc/routers/_app";


export type StudioGetOneOutput = inferRouterOutputs<AppRouter>["studio"]["getOne"];


// export type VideoGetManyOutput = inferRouterOutputs<AppRouter>["suggestions"]["getMany"];




