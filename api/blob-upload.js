import { handleUpload } from '@vercel/blob/next';

export default async function handler(request, response) {
  try {
    const jsonResponse = await handleUpload({
      body: request.body,
      request,
      onBeforeGenerateToken: async () => ({
        allowedContentTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'],
        tokenPayload: JSON.stringify({}),
        addRandomSuffix: true,
      }),
      onUploadCompleted: async ({ blob }) => {
        console.log('Upload success:', blob.url);
      },
    });

    return response.status(200).json(jsonResponse);
  } catch (error) {
    console.error('Blob Error:', error);
    return response.status(400).json({ error: error.message });
  }
}
