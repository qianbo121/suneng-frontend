export const UPLOAD_STORAGE = Symbol('UPLOAD_STORAGE');

export interface UploadStorage {
  save(file: Express.Multer.File): Promise<string>;
  saveMany(files: Express.Multer.File[]): Promise<string[]>;
}
