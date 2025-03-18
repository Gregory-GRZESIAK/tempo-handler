import { App } from './modules/Handler/build/base/structure/App.js';
import { AppIntents } from './modules/Handler/build/base/structure/options/AppOptions.js';
import dotenv from 'dotenv';
dotenv.config();

const app = new App({ intents: [AppIntents.All]})