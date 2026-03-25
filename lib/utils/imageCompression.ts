import imageCompression from 'browser-image-compression';

export async function compressImage(file: File): Promise<File> {
  const options = {
    maxSizeMB: 0.6,
    maxWidthOrHeight: 1200,
    useWebWorker: true,
  };
  try {
    return await imageCompression(file, options);
  } catch {
    return file;
  }
}

export async function uploadListingImage(
  supabase: ReturnType<typeof import('@/lib/supabase/client').createClient>,
  file: File,
  listingId: string,
  position: number
): Promise<{ url: string; storage_path: string }> {
  const compressed = await compressImage(file);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const ext = compressed.type === 'image/webp' ? 'webp' : compressed.name.split('.').pop() ?? 'jpg';
  const storage_path = `${user.id}/${listingId}/${position}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from('listing-images')
    .upload(storage_path, compressed, { upsert: true, contentType: compressed.type });

  if (uploadError) throw uploadError;

  const { data } = supabase.storage
    .from('listing-images')
    .getPublicUrl(storage_path);

  return { url: data.publicUrl, storage_path };
}
