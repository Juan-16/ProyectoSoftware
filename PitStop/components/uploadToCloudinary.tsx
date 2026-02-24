export const uploadToCloudinary = async (imageUri: string): Promise<string | null> => {
  const formData = new FormData();
  formData.append("file", {
    uri: imageUri,
    type: "image/jpeg",
    name: "imagen.jpg",
  } as any);

  formData.append("upload_preset", "PitStop"); // Cambia si tienes otro preset

  try {
    const response = await fetch("https://api.cloudinary.com/v1_1/dacadzrez/image/upload", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    if (data.secure_url) {
      return data.secure_url;
    } else {
      console.error("❌ Error Cloudinary:", data);
      return null;
    }
  } catch (error) {
    console.error("❌ Error al subir imagen:", error);
    return null;
  }
};
