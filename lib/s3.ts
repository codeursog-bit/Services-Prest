import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

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

export async function uploadFile(file: File, folder: string): Promise<string> {
  const s3     = getS3();
  const key    = `${folder}/${Date.now()}-${file.name.replace(/\s+/g, '_')}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  await s3.send(new PutObjectCommand({
    Bucket:      process.env.MINIO_BUCKET_NAME!,
    Key:         key,
    Body:        buffer,
    ContentType: file.type,
  }));

  const proto = process.env.MINIO_USE_SSL === 'true' ? 'https' : 'http';
  return `${proto}://${process.env.MINIO_ENDPOINT}:${process.env.MINIO_PORT}/${process.env.MINIO_BUCKET_NAME}/${key}`;
}

export async function deleteFile(url: string): Promise<void> {
  try {
    const s3  = getS3();
    const key = url.split(`/${process.env.MINIO_BUCKET_NAME}/`)[1];
    if (!key) return;
    await s3.send(new DeleteObjectCommand({
      Bucket: process.env.MINIO_BUCKET_NAME!,
      Key:    key,
    }));
  } catch (err) {
    console.error('deleteFile error:', err);
  }
}

export function formatSize(bytes: number): string {
  if (bytes < 1024)        return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} Mo`;
}
