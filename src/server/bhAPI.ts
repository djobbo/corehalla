import * as functions from 'firebase-functions';
import { createApiConnection } from 'corehalla.js';

const apiKey = functions.config().bh_api.key;

export const bhAPI = createApiConnection(apiKey);
