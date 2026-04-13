import { NextResponse } from 'next/server';
import supabase from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    // Expect a multipart/form-data request with a `file` field and optional `userId`
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const userId = (formData.get('userId') as string) || 'anon';

    if (!file) {
      return NextResponse.json({ error: 'Missing file' }, { status: 400 });
    }

    // Read file into buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const bucket = process.env.SUPABASE_STORAGE_BUCKET || 'audio';
    const fileName = `uploads/${userId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.wav`;

    const { data, error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(fileName, buffer, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type || 'audio/wav',
      });

    if (uploadError) {
      console.error('Supabase upload error', uploadError);
      return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
    }

    // Attempt to get a public URL (works if bucket is public). For private buckets,
    // callers should use signed URLs (you can implement createSignedUrl if needed).
    const publicUrlResult = supabase.storage.from(bucket).getPublicUrl(data.path || fileName);
    const urlData = publicUrlResult.data;

    return NextResponse.json({ success: true, path: data.path, url: urlData?.publicUrl || null }, { status: 201 });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Audio upload error', err);
    return NextResponse.json({ error: 'Server error during upload' }, { status: 500 });
  }
}
