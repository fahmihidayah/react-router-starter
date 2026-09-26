import { DeleteObjectCommand, GetObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { Upload } from '@aws-sdk/lib-storage'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { mediaStorageConfig } from './config'
import type { MediaStorage } from './types'

let client: S3Client | undefined

function getClient(): S3Client {
  if (!mediaStorageConfig.s3.bucket) throw new Error('S3_BUCKET is required for S3 storage')

  client ??= new S3Client({
    region: mediaStorageConfig.s3.region,
    endpoint: mediaStorageConfig.s3.endpoint,
    forcePathStyle: mediaStorageConfig.s3.forcePathStyle,
  })
  return client
}

function getPublicUrl(key: string): string {
  const encodedKey = key.split('/').map(encodeURIComponent).join('/')
  if (mediaStorageConfig.s3.publicUrl) {
    return `${mediaStorageConfig.s3.publicUrl.replace(/\/$/, '')}/${encodedKey}`
  }

  return `https://${mediaStorageConfig.s3.bucket}.s3.${mediaStorageConfig.s3.region}.amazonaws.com/${encodedKey}`
}

export const s3MediaStorage: MediaStorage = {
  provider: 's3',
  async put(image) {
    const key = [mediaStorageConfig.s3.prefix, image.filename].filter(Boolean).join('/')
    await new Upload({
      client: getClient(),
      params: {
        Bucket: mediaStorageConfig.s3.bucket,
        Key: key,
        Body: image.buffer,
        ContentType: image.contentType,
        CacheControl: 'public, max-age=31536000, immutable',
      },
    }).done()

    return {
      filename: image.filename,
      originalFilename: image.originalFilename,
      contentType: image.contentType,
      size: image.size,
      width: image.width,
      height: image.height,
      provider: 's3',
      key,
      url: getPublicUrl(key),
    }
  },
  async delete(key) {
    await getClient().send(
      new DeleteObjectCommand({ Bucket: mediaStorageConfig.s3.bucket, Key: key }),
    )
  },
}

export async function createS3ReadUrl(key: string, expiresIn = 900): Promise<string> {
  return getSignedUrl(
    getClient(),
    new GetObjectCommand({ Bucket: mediaStorageConfig.s3.bucket, Key: key }),
    { expiresIn },
  )
}
