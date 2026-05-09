export const generateThumbnail = async (file: File): Promise<Blob | null> => {
    return new Promise((resolve) => {
        const type = file.type;
        
        if (type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    const size = 200;
                    canvas.width = size;
                    canvas.height = size;
                    
                    if (ctx) {
                        const scale = Math.max(size / img.width, size / img.height);
                        const x = (size / 2) - (img.width / 2) * scale;
                        const y = (size / 2) - (img.height / 2) * scale;
                        ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
                        canvas.toBlob((blob) => resolve(blob), 'image/jpeg', 0.7);
                    } else {
                        resolve(null);
                    }
                };
                img.src = e.target?.result as string;
            };
            reader.readAsDataURL(file);
        } else if (type.startsWith('video/')) {
            const video = document.createElement('video');
            video.preload = 'metadata';
            video.src = URL.createObjectURL(file);
            video.onloadedmetadata = () => {
                video.currentTime = 1; // Seek to 1 second
            };
            video.onseeked = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                const size = 200;
                canvas.width = size;
                canvas.height = size;
                
                if (ctx) {
                    const scale = Math.max(size / video.videoWidth, size / video.videoHeight);
                    const x = (size / 2) - (video.videoWidth / 2) * scale;
                    const y = (size / 2) - (video.videoHeight / 2) * scale;
                    ctx.drawImage(video, x, y, video.videoWidth * scale, video.videoHeight * scale);
                    canvas.toBlob((blob) => {
                        URL.revokeObjectURL(video.src);
                        resolve(blob);
                    }, 'image/jpeg', 0.7);
                } else {
                    resolve(null);
                }
            };
            video.onerror = () => resolve(null);
        } else {
            // Fallback for documents or other types
            resolve(null);
        }
    });
};
