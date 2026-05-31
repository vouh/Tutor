import { storage } from './firebase';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';

export type UploadResult = {
  fullPath: string;
  downloadURL: string;
};

/**
 * Upload a PDF `File` to Firebase Storage.
 * - `destPath` is optional and should be a path inside the bucket (e.g. "pdfs/courseId/filename.pdf").
 * - `onProgress` receives percentage numbers (0-100).
 */
export function uploadPdfFile(
  file: File,
  destPath?: string,
  onProgress?: (percent: number) => void
): Promise<UploadResult> {
  if (file.type !== 'application/pdf') {
    return Promise.reject(new Error('Only PDF files are allowed'));
  }

  const path = destPath || `pdfs/${Date.now()}_${file.name}`;
  const storageRef = ref(storage, path);

  return new Promise((resolve, reject) => {
    const task = uploadBytesResumable(storageRef, file, { contentType: 'application/pdf' });

    task.on(
      'state_changed',
      (snapshot) => {
        if (snapshot.totalBytes) {
          const percent = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
          onProgress?.(percent);
        }
      },
      (error) => reject(error),
      async () => {
        try {
          const url = await getDownloadURL(storageRef);
          resolve({ fullPath: path, downloadURL: url });
        } catch (e) {
          reject(e);
        }
      }
    );
  });
}

export async function getPdfUrl(fullPath: string): Promise<string> {
  const storageRef = ref(storage, fullPath);
  return getDownloadURL(storageRef);
}

export async function deleteFile(fullPath: string): Promise<void> {
  const storageRef = ref(storage, fullPath);
  await deleteObject(storageRef);
}

export default {
  uploadPdfFile,
  getPdfUrl,
  deleteFile,
};
