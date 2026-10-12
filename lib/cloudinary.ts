import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export async function uploadImageToCloudinary(
  fileBase64OrUrl: string,
  folder: string = "shebabd_uploads"
): Promise<{ url: string; publicId: string }> {
  // If Cloudinary credentials are not set, return simulated upload URL
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY) {
    // Check if it's already a URL or generate mock
    if (fileBase64OrUrl.startsWith("http")) {
      return {
        url: fileBase64OrUrl,
        publicId: "mock_public_id_" + Date.now(),
      };
    }
    // Return base64 or placeholder
    return {
      url: fileBase64OrUrl,
      publicId: "mock_public_id_" + Date.now(),
    };
  }

  try {
    const result = await cloudinary.uploader.upload(fileBase64OrUrl, {
      folder,
      resource_type: "image",
    });

    return {
      url: result.secure_url,
      publicId: result.public_id,
    };
  } catch (error) {
    console.error("Cloudinary upload failed:", error);
    throw new Error("Image upload failed");
  }
}

export default cloudinary;
