import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const { data, error } = await supabase
      .from('events')
      .select('invitation_url')
      .eq('id', id)
      .single();

    if (error || !data || !data.invitation_url || !data.invitation_url.startsWith('data:image')) {
      return new NextResponse('Image not found', { status: 404 });
    }

    const arr = data.invitation_url.split(',');
    const mimeMatch = arr[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg';
    
    // Convert base64 to buffer
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }

    return new NextResponse(u8arr, {
      headers: {
        'Content-Type': mime,
        'Cache-Control': 'public, max-age=86400, immutable'
      },
    });
  } catch (error) {
    console.error("Error serving image:", error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
