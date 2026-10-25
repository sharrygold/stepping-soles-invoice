/**
 * Process an image to remove white/near-white backgrounds,
 * making them transparent. Returns a data URL of the processed image.
 */
export function removeWhiteBackground(imageSrc, threshold = 240) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);

            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;

            for (let i = 0; i < data.length; i += 4) {
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];
                // If pixel is near-white, make it transparent
                if (r >= threshold && g >= threshold && b >= threshold) {
                    data[i + 3] = 0; // Set alpha to 0
                }
            }

            ctx.putImageData(imageData, 0, 0);
            resolve(canvas.toDataURL('image/png'));
        };
        img.onerror = reject;
        img.src = imageSrc;
    });
}

/**
 * Process an image: invert colors and remove resulting white background.
 * Useful for white-on-black logos → black-on-transparent.
 */
export function invertAndRemoveBackground(imageSrc, threshold = 230) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);

            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;

            for (let i = 0; i < data.length; i += 4) {
                // Invert colors
                data[i] = 255 - data[i];       // R
                data[i + 1] = 255 - data[i + 1]; // G
                data[i + 2] = 255 - data[i + 2]; // B

                // After inversion, remove near-white pixels (formerly near-black background)
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];
                if (r >= threshold && g >= threshold && b >= threshold) {
                    data[i + 3] = 0; // transparent
                }
            }

            ctx.putImageData(imageData, 0, 0);
            resolve(canvas.toDataURL('image/png'));
        };
        img.onerror = reject;
        img.src = imageSrc;
    });
}
