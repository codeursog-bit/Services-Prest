import { NextRequest } from 'next/server';
import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { auth } from '@/auth';

function getS3() {
  return new S3Client({
    endpoint: `${process.env.MINIO_USE_SSL === 'true' ? 'https' : 'http'}://${process.env.MINIO_ENDPOINT}:${process.env.MINIO_PORT}`,
    region: 'us-east-1',
    credentials: {
      accessKeyId:     process.env.MINIO_ACCESS_KEY!,
      secretAccessKey: process.env.MINIO_SECRET_KEY!,
    },
    forcePathStyle: true,
  });
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return new Response('Non authentifié', { status: 401 });

  const key = req.nextUrl.searchParams.get('key');
  if (!key) return new Response('Clé manquante', { status: 400 });

  try {
    const s3  = getS3();
    const cmd = new GetObjectCommand({
      Bucket: process.env.MINIO_BUCKET_NAME!,
      Key:    key,
    });
    const obj = await s3.send(cmd);
    const body = obj.Body as ReadableStream;

    return new Response(body, {
      headers: {
        'Content-Type':        obj.ContentType ?? 'application/octet-stream',
        'Content-Disposition': `inline; filename="${key.split('/').pop()}"`,
      },
    });
  } catch (err) {
    console.error('file proxy error:', err);
    return new Response('Fichier introuvable', { status: 404 });
  }
}
