import { createWriteStream } from 'node:fs'
import { access, mkdir } from 'node:fs/promises'
import { join, resolve } from 'node:path'

const UPLOAD_DIR = resolve(process.env.UPLOAD_DIR || './uploads')

/**
 * Ensure upload directory exists
 */
export async function ensureUploadDir(): Promise<void> {
  try {
    await mkdir(UPLOAD_DIR, { recursive: true })
  } catch (error) {
    console.error('Failed to create upload directory:', error)
    throw error
  }
}

/**
 * Check if a file exists
 */
async function fileExists(filePath: string): Promise<boolean> {
  try {
    await access(filePath)
    return true
  } catch {
    return false
  }
}

/**
 * Get available filename with conflict resolution
 * If file exists, appends -1, -2, etc. until available
 */
async function getAvailableFilename(
  baseFilename: string,
  extension: string,
  uploadDir: string,
): Promise<string> {
  const baseNameWithoutExt = baseFilename.replace(/\.[^/.]+$/, '')
  let filename = `${baseNameWithoutExt}.${extension}`
  let counter = 1

  while (await fileExists(join(uploadDir, filename))) {
    filename = `${baseNameWithoutExt}-${counter}.${extension}`
    counter++
  }

  return filename
}

/**
 * Save uploaded file to disk
 * @param file - File object from form data
 * @returns Object with filename, path, and url
 */
export async function saveUploadedFile(file: File | Blob): Promise<{
  filename: string
  path: string
  url: string
}> {
  if (!file) {
    throw new Error('No file provided')
  }

  try {
    await ensureUploadDir()
  } catch (dirError) {
    console.error('Failed to ensure upload directory:', dirError)
    throw new Error(
      `Failed to create upload directory: ${dirError instanceof Error ? dirError.message : String(dirError)}`,
    )
  }

  // Handle both File (with name) and Blob (without name)
  const fileName = 'name' in file ? file.name : 'uploaded'
  if (!fileName) {
    throw new Error('Cannot determine file name')
  }

  const fileExtension = fileName.split('.').pop() || ''
  let availableFilename: string

  try {
    availableFilename = await getAvailableFilename(fileName, fileExtension, UPLOAD_DIR)
  } catch (filenameError) {
    console.error('Failed to determine available filename:', filenameError)
    throw new Error(
      `Failed to determine available filename: ${filenameError instanceof Error ? filenameError.message : String(filenameError)}`,
    )
  }

  const filePath = join(UPLOAD_DIR, availableFilename)

  let buffer: ArrayBuffer
  try {
    buffer = await file.arrayBuffer()
  } catch (bufferError) {
    console.error('Failed to read file buffer:', bufferError)
    throw new Error(
      `Failed to read file: ${bufferError instanceof Error ? bufferError.message : String(bufferError)}`,
    )
  }

  return new Promise((resolve, reject) => {
    const writeStream = createWriteStream(filePath)

    writeStream.on('finish', () => {
      resolve({
        filename: fileName,
        path: filePath,
        url: `/uploads/${availableFilename}`,
      })
    })

    writeStream.on('error', (error) => {
      console.error('Write stream error:', error)
      reject(error)
    })

    try {
      writeStream.write(Buffer.from(buffer))
      writeStream.end()
    } catch (writeError) {
      console.error('Write error:', writeError)
      reject(writeError)
    }
  })
}

/**
 * Get upload directory path
 */
export function getUploadDir(): string {
  return UPLOAD_DIR
}
