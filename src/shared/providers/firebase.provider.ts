import { Global, Module } from '@nestjs/common';
import * as admin from 'firebase-admin';
import * as dotenv from 'dotenv';
import { Firestore } from 'firebase-admin/firestore';

dotenv.config();

@Global()
@Module({
  providers: [
    {
      provide: Firestore,
      useFactory: () => {
        if (!admin.apps.length) {
          admin.initializeApp({
            credential: admin.credential.cert({
              projectId: process.env.FIREBASE_PROJECT_ID,
              clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
              privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(
                /\\n/g,
                '\n',
              ),
            }),
            databaseURL: process.env.FIREBASE_DATABASE_URL,
            projectId: process.env.FIREBASE_PROJECT_ID,
          });
        }
        return admin.firestore();
      },
    },
  ],
  exports: [Firestore],
})
export class FirebaseModule {}
