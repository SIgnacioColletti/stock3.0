import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Sube una imagen a Cloudinary
 */
export async function uploadImage(file: string): Promise<string> {
  try {
    const result = await cloudinary.uploader.upload(file, {
      folder: 'ecommerce',
    });
    return result.secure_url;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw new Error('Error al subir la imagen');
  }
}

/**
 * Elimina una imagen de Cloudinary
 */
export async function deleteImage(url: string): Promise<void> {
  try {
    const publicId = url.split('/').pop()?.split('.')[0];
    if (publicId) {
      await cloudinary.uploader.destroy(`ecommerce/${publicId}`);
    }
  } catch (error) {
    console.error('Error deleting image:', error);
  }
}

export default cloudinary;
