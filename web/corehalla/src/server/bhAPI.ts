import * as functions from 'firebase-functions';
import { createApiConnection } from 'corehalla.js';

const apiKey = functions?.config()?.bh_api?.key || process.env.BH_API_KEY;

export const bhAPI = createApiConnection(apiKey);
