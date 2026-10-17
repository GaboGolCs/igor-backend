import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { env } from './env.js';


// Inicializamos Firebase solo si no ha sido inicializado previamente
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: env.FCM_PROJECT_ID,
      clientEmail: env.FCM_CLIENT_EMAIL,
      // Manejamos los saltos de línea en la clave privada de forma segura
      privateKey: env.FCM_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
  console.log('🔥 [Firebase] Admin SDK inicializado correctamente (Modo Modular).');
}

// Ya no exportamos la instancia global 'admin'. 
// Los servicios consumirán sus respectivos submódulos (ej. firebase-admin/messaging).