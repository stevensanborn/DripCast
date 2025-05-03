
import { Ratelimit } from "@upstash/ratelimit";
import redis from "./redis";

const limiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(50, '10s'),
})  

export default limiter; 