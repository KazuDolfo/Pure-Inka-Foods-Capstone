// src/main.ts
import { bootstrapApplication } from '@angular/platform-browser';
// Importa la clase App desde el archivo renombrado './app/app'
import { App } from './app/app'; 
import { appConfig } from './app/app.config';
import { injectSpeedInsights } from '@vercel/speed-insights';

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));

// Inject Vercel Speed Insights
injectSpeedInsights();
