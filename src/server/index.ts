import 'firebase-admin';
import * as functions from 'firebase-functions';

import { app } from './app';

exports.app = functions.https.onRequest(app);
