import type { StorageProvider } from "./types";
import { GoogleSheetsProvider } from "./google-sheets";

let provider: StorageProvider | null = null;

export function getStorageProvider(): StorageProvider {
  if (!provider) {
    provider = new GoogleSheetsProvider();
  }
  return provider;
}
