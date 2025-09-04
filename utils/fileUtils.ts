
export const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          // The result is a data URL like "data:image/png;base64,iVBORw0KGgo...".
          // We need to strip the prefix to get only the base64 part.
          const base64String = reader.result.split(',')[1];
          resolve(base64String);
        } else {
          reject(new Error("Failed to read file as base64 string."));
        }
      };
      reader.onerror = (error) => reject(error);
    });
  };
