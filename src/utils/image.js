export function getDirectDriveUrl(url) {
    if (!url) return '/placeholder.jpg';

    const idMatch = url.match(/\/d\/(.+?)\/|\?id=(.+?)$/);

    if (idMatch) {
        const id = idMatch[1] || idMatch[2];
        return `https://drive.google.com/uc?export=view&id=${id}`;
    }

    return url;
}

export function getDrivePreviewUrl(url) {
    if (!url) return '';

    const idMatch = url.match(/\/d\/(.+?)\/|\?id=(.+?)$/);

    if (idMatch) {
        const id = idMatch[1] || idMatch[2];
        return `https://drive.google.com/file/d/${id}/preview`;
    }

    return url;
}

export const compressImage = (file, maxWidth = 1200, quality = 0.7) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                if (width > maxWidth) {
                    height = Math.round((height * maxWidth) / width);
                    width = maxWidth;
                }

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                canvas.toBlob(
                    (blob) => {
                        if (blob) {
                            const compressedFile = new File([blob], file.name, {
                                type: 'image/jpeg',
                                lastModified: Date.now(),
                            });
                            resolve(compressedFile);
                        } else {
                            reject(new Error('Canvas is empty'));
                        }
                    },
                    'image/jpeg',
                    quality
                );
            };
            img.onerror = (error) => reject(error);
        };
        reader.onerror = (error) => reject(error);
    });
};
