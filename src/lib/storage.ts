import { supabase } from "./supabase"

/**
 * Upload a file to Supabase Storage
 */
export async function uploadFile(bucket: string, path: string, file: File) {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      cacheControl: "3600",
      upsert: true,
    })

  if (error) throw error

  const { data: publicUrlData } = supabase.storage
    .from(bucket)
    .getPublicUrl(data.path)

  return {
    path: data.path,
    publicUrl: publicUrlData.publicUrl,
  }
}

/**
 * Track file record in database
 */
export async function createFileRecord({
  messageId,
  storagePath,
  fileName,
  fileSize,
  mimeType,
}: {
  messageId: string
  storagePath: string
  fileName: string
  fileSize: number
  mimeType: string
}) {
  const { data, error } = await supabase
    .from("files")
    .insert({
      message_id: messageId,
      storage_path: storagePath,
      file_name: fileName,
      file_size: fileSize,
      mime_type: mimeType,
    } as any)
    .select()
    .single()

  if (error) throw error
  return data
}
