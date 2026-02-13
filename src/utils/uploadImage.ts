export const handleImageUpload = async (
  file: File,
  setUser: React.Dispatch<React.SetStateAction<any>>,
  setUploadError: (msg: string) => void,
  setUploading: (state: boolean) => void,
  fileInputRef: React.RefObject<HTMLInputElement>
) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  if (!allowedTypes.includes(file.type)) {
    setUploadError('Please select a valid image file (JPEG, PNG, WebP, or GIF)');
    return;
  }

  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    setUploadError('File size must be less than 5MB');
    return;
  }

  setUploading(true);
  setUploadError('');

  try {
    const token = localStorage.getItem("token"); // 🔑 get token

    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/profile/uploadImage`, {
      method: 'POST', // ✅ explicitly POST
      credentials: 'include', // ✅ send cookies
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}), // ✅ send token if available
      },
      body: formData,
    });

    const data = await res.json();

    if (!res.ok) {
      setUploadError(data.error || 'Upload failed');
      return;
    }

    setUser((prev: any) => prev ? { ...prev, profileImage: data.imageUrl } : null);

    window.dispatchEvent(new Event('profileUpdated'));

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  } catch (err) {
    console.error('Upload error:', err);
    setUploadError('Network error. Please try again.');
  } finally {
    setUploading(false);
  }
};