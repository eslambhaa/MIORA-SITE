import { supabase } from './supabase.js'

// Profile pictures are private: one small image per user in the "avatars" bucket.
// The picture is redrawn on a canvas before upload, which shrinks it to 256px and
// drops hidden metadata (camera, location) from the original file.
const SIZE = 256
const MAX_INPUT_BYTES = 10 * 1024 * 1024
export const AVATAR_ACCEPT = 'image/jpeg,image/png,image/webp'

export class AvatarError extends Error {}

export const avatarPath = (userId) => `${userId}/avatar.webp`

function encode(canvas, type) {
  return new Promise((resolve) => canvas.toBlob(resolve, type, 0.85))
}

export async function prepareAvatar(file) {
  if (!file || !AVATAR_ACCEPT.split(',').includes(file.type)) throw new AvatarError('type')
  if (file.size > MAX_INPUT_BYTES) throw new AvatarError('size')
  let bitmap
  try {
    bitmap = await createImageBitmap(file)
  } catch {
    throw new AvatarError('decode')
  }
  const side = Math.min(bitmap.width, bitmap.height)
  const canvas = document.createElement('canvas')
  canvas.width = SIZE
  canvas.height = SIZE
  const context = canvas.getContext('2d')
  context.imageSmoothingQuality = 'high'
  context.drawImage(bitmap, (bitmap.width - side) / 2, (bitmap.height - side) / 2, side, side, 0, 0, SIZE, SIZE)
  bitmap.close?.()
  let blob = await encode(canvas, 'image/webp')
  // Some browsers (older Safari) cannot encode WebP and silently return PNG.
  if (!blob || blob.type !== 'image/webp') blob = await encode(canvas, 'image/jpeg')
  if (!blob) throw new AvatarError('decode')
  return blob
}

export async function uploadAvatar(userId, blob) {
  const { error } = await supabase.storage
    .from('avatars')
    .upload(avatarPath(userId), blob, { upsert: true, contentType: blob.type, cacheControl: '3600' })
  if (error) throw error
  // The server stores its own clock here; the value we send only marks "changed".
  const { error: profileError } = await supabase
    .from('profiles')
    .update({ avatar_updated_at: new Date().toISOString() })
    .eq('id', userId)
  if (profileError) throw profileError
}

export async function removeAvatar(userId) {
  const { error } = await supabase.storage.from('avatars').remove([avatarPath(userId)])
  if (error) throw error
  const { error: profileError } = await supabase.from('profiles').update({ avatar_updated_at: null }).eq('id', userId)
  if (profileError) throw profileError
}

export async function avatarUrl(userId) {
  const { data, error } = await supabase.storage.from('avatars').createSignedUrl(avatarPath(userId), 3600)
  if (error) throw error
  return data.signedUrl
}
