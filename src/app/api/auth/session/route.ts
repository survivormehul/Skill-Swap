
import {getAuth} from 'firebase-admin/auth';
import {revalidateTag} from 'next/cache';
import {NextRequest, NextResponse} from 'next/server';

import {auth} from 'firebase-admin';
import {cookies} from 'next/headers';

import {
  initializeFirebaseAdmin,
} from '@/firebase/firebase-admin';
import { getApp } from 'firebase/app';

initializeFirebaseAdmin();

export async function POST(request: NextRequest) {
  const authorization = request.headers.get('Authorization');
  if (authorization?.startsWith('Bearer ')) {
    const idToken = authorization.split('Bearer ')[1];
    const decodedToken = await getAuth().verifyIdToken(idToken);

    if (decodedToken) {
      //Generate session cookie
      const expiresIn = 60 * 60 * 24 * 5 * 1000;
      const sessionCookie = await getAuth().createSessionCookie(idToken, {
        expiresIn,
      });
      const options = {
        name: '__session',
        value: sessionCookie,
        maxAge: expiresIn,
        httpOnly: true,
        secure: true,
      };

      //Add the cookie to the browser
      cookies().set(options);
    }
  }

  return NextResponse.json({}, {status: 200});
}

export async function DELETE(request: NextRequest) {
  const sessionCookie = cookies().get('__session');
  if (sessionCookie) {
    const decodedToken = await auth()
      .verifySessionCookie(sessionCookie.value, true)
      .catch(() => null);
    if (decodedToken) {
      await auth().revokeRefreshTokens(decodedToken.sub);
    }
  }
  cookies().delete('__session');
  return NextResponse.json({status: 'success'});
}
