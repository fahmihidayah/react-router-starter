import { HeadBucketCommand, S3Client } from '@aws-sdk/client-s3'
import { env } from '~/env'
import { mediaStorageConfig } from './config'

export type S3HealthResult = {
  healthy: boolean
  error?: string
}

/**
 * Check S3 bucket accessibility.
 * Returns a safe result object without exposing sensitive credentials.
 * Only runs if MEDIA_STORAGE_DRIVER is 's3'.
 */
export async function checkS3Health(): Promise<S3HealthResult> {
  // Skip check if S3 is not the configured storage driver
  if (env.MEDIA_STORAGE_DRIVER !== 's3') {
    return { healthy: true } // Not applicable, consider it healthy
  }

  if (!mediaStorageConfig.s3.bucket) {
    return {
      healthy: false,
      error: 'not_configured',
    }
  }

  try {
    const client = new S3Client({
      region: mediaStorageConfig.s3.region,
      endpoint: mediaStorageConfig.s3.endpoint,
      forcePathStyle: mediaStorageConfig.s3.forcePathStyle,
    })

    // Use HeadBucket to verify bucket access without downloading any objects
    await client.send(
      new HeadBucketCommand({
        Bucket: mediaStorageConfig.s3.bucket,
      }),
    )

    return { healthy: true }
  } catch (_error) {
    // Return generic error without leaking credentials or bucket details
    return {
      healthy: false,
      error: 'connection_failed',
    }
  }
}
