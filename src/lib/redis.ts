import { Redis } from "@upstash/redis";

export const redis = new Redis({
	url: import.meta.env.VITE_UPSTASH_REDIS_REST_URL,
	token: import.meta.env.VITE_UPSTASH_REDIS_REST_TOKEN,
});

export const POPULARITY_KEY = "bang_popularity";
