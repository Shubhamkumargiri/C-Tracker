import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

let currentKeyIndex = 0;
let keys = [];

const defaultKey = process.env.GEMINI_API_KEY;
const extraKeys = process.env.GEMINI_EXTRA_KEYS ? process.env.GEMINI_EXTRA_KEYS.split(',').map(k => k.trim()) : [];
keys = defaultKey ? [defaultKey, ...extraKeys] : extraKeys;
if (keys.length === 0) keys = ["dummy-key"];

export const getGenAI = () => {
    return new GoogleGenerativeAI(keys[currentKeyIndex]);
};

export const rotateKey = () => {
    currentKeyIndex = (currentKeyIndex + 1) % keys.length;
    // Silently rotate without front-end awareness
};
