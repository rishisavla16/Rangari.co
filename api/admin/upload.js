import { handleUpload } from '@vercel/blob/client';
import { requireAdmin } from '../_lib/auth.js';
import { allowMethod } from '../_lib/http.js';

export default async function handler(req, res) {
  if (!allowMethod(req, res, ['POST'])) return;
  if (!await requireAdmin(req, res)) return;
  try {
    const jsonResponse = await handleUpload({
      body: req.body,
      request: req,
      onBeforeGenerateToken: async () => ({
        allowedContentTypes: ['image/jpeg', 'image/png', 'image/webp'],
        addRandomSuffix: true,
        maximumSizeInBytes: 10 * 1024 * 1024,
        tokenPayload: 'rangari-admin-upload'
      }),
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        if (tokenPayload !== 'rangari-admin-upload') throw new Error('Invalid upload token.');
        console.info('Uploaded Rangari image', { url: blob.url });
      }
    });
    return res.status(200).json(jsonResponse);
  } catch (error) {
    console.error('Upload failed', error);
    return res.status(400).json({ error: 'Image upload failed.' });
  }
}
