import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  User, 
  signOut 
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import { GoogleDriveFile, Perkara, TaskItem } from '../types/leadAp';

// Target official Google Drive account specified by Bawaslu Provinsi Banten
export const TARGET_DRIVE_EMAIL = 'penangananpelanggaranbanten@gmail.com';

// Initialize Firebase App if not already initialized
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

// Provider with Google Drive File Scope (https://www.googleapis.com/auth/drive.file)
const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/drive.file');

// Pre-set login_hint for official account
provider.setCustomParameters({
  login_hint: TARGET_DRIVE_EMAIL,
  prompt: 'select_account'
});

// In-memory token cache (DO NOT store in localStorage as per security rules)
let cachedAccessToken: string | null = null;
let cachedUser: User | null = null;
let isSigningIn = false;

export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user && cachedAccessToken) {
      cachedUser = user;
      if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
    } else if (!isSigningIn) {
      cachedAccessToken = null;
      cachedUser = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Gagal mendapatkan access token dari Google OAuth');
    }
    cachedAccessToken = credential.accessToken;
    cachedUser = result.user;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Sign-in error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const googleSignOut = async () => {
  await signOut(auth);
  cachedAccessToken = null;
  cachedUser = null;
};

export const getCachedAccessToken = (): string | null => {
  return cachedAccessToken;
};

export const getCachedUser = (): User | null => {
  return cachedUser;
};

// ==========================================
// GOOGLE DRIVE API V3 INTEGRATION
// ==========================================

const DRIVE_API_URL = 'https://www.googleapis.com/drive/v3';
const DRIVE_UPLOAD_URL = 'https://www.googleapis.com/upload/drive/v3';
const BAWASLU_ROOT_FOLDER = 'LeAD-AP Bawaslu Banten';

export interface FolderHierarchy {
  rootId: string;
  databaseFolderId: string;
  dokumenFolderId: string;
  buktiFolderId: string;
}

/**
 * Mencari atau membuat folder root "LeAD-AP Bawaslu Banten" di Google Drive user (penangananpelanggaranbanten@gmail.com)
 */
export async function getOrCreateBawasluFolder(token: string): Promise<string> {
  // Cari apakah folder root sudah ada
  const query = encodeURIComponent(`name='${BAWASLU_ROOT_FOLDER}' and mimeType='application/vnd.google-apps.folder' and trashed=false`);
  const res = await fetch(`${DRIVE_API_URL}/files?q=${query}&fields=files(id,name)`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!res.ok) {
    throw new Error('Gagal memeriksa folder di Google Drive');
  }

  const data = await res.json();
  if (data.files && data.files.length > 0) {
    return data.files[0].id;
  }

  // Jika belum ada, buat folder baru
  const createRes = await fetch(`${DRIVE_API_URL}/files`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: BAWASLU_ROOT_FOLDER,
      mimeType: 'application/vnd.google-apps.folder',
      description: `Folder penyimpanan resmi data & berkas perkara LeAD-AP Bawaslu Banten (${TARGET_DRIVE_EMAIL})`
    })
  });

  if (!createRes.ok) {
    throw new Error('Gagal membuat folder LeAD-AP di Google Drive');
  }

  const newFolder = await createRes.json();
  return newFolder.id;
}

/**
 * Mencari atau membuat subfolder di dalam folder root
 */
export async function getOrCreateSubfolder(token: string, folderName: string, parentId: string): Promise<string> {
  const query = encodeURIComponent(`name='${folderName}' and '${parentId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`);
  const res = await fetch(`${DRIVE_API_URL}/files?q=${query}&fields=files(id,name)`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (res.ok) {
    const data = await res.json();
    if (data.files && data.files.length > 0) {
      return data.files[0].id;
    }
  }

  // Buat subfolder
  const createRes = await fetch(`${DRIVE_API_URL}/files`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: folderName,
      parents: [parentId],
      mimeType: 'application/vnd.google-apps.folder'
    })
  });

  if (!createRes.ok) {
    return parentId; // fallback ke parent jika gagal
  }

  const newSub = await createRes.json();
  return newSub.id;
}

/**
 * Upload dokumen atau file teks/PDF/JSON/Blob ke folder di Google Drive
 */
export async function uploadFileToGoogleDrive(
  token: string,
  fileName: string,
  content: string | Blob,
  mimeType: string = 'text/plain',
  customFolderId?: string
): Promise<GoogleDriveFile> {
  const folderId = customFolderId || (await getOrCreateBawasluFolder(token));

  const metadata = {
    name: fileName,
    parents: [folderId],
    mimeType: mimeType
  };

  const boundary = '-------314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  let fileData: string | ArrayBuffer;
  if (typeof content === 'string') {
    fileData = content;
  } else if (content instanceof Blob) {
    fileData = await content.text();
  } else {
    fileData = String(content);
  }

  const multipartRequestBody =
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    `Content-Type: ${mimeType}\r\n\r\n` +
    fileData +
    closeDelimiter;

  const response = await fetch(
    `${DRIVE_UPLOAD_URL}/files?uploadType=multipart&fields=id,name,mimeType,size,createdTime,webViewLink,webContentLink,thumbnailLink`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': `multipart/related; boundary=${boundary}`
      },
      body: multipartRequestBody
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gagal mengunggah file ke Google Drive: ${errorText}`);
  }

  const result = await response.json();
  return {
    id: result.id,
    name: result.name,
    mimeType: result.mimeType,
    size: result.size,
    createdTime: result.createdTime,
    webViewLink: result.webViewLink,
    webContentLink: result.webContentLink,
    thumbnailLink: result.thumbnailLink
  };
}

/**
 * Upload binary file (seperti PDF, Dokumen, Gambar) menggunakan FileReader
 */
export async function uploadBinaryFileToGoogleDrive(
  token: string,
  file: File,
  customFolderId?: string
): Promise<GoogleDriveFile> {
  const folderId = customFolderId || (await getOrCreateBawasluFolder(token));

  const metadata = {
    name: file.name,
    parents: [folderId],
    mimeType: file.type || 'application/octet-stream'
  };

  const boundary = '-------314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  // Read file as binary string / array buffer
  const fileArrayBuffer = await file.arrayBuffer();
  const uint8 = new Uint8Array(fileArrayBuffer);
  
  // Convert binary to binary string safely
  let binaryString = '';
  const chunkSize = 8192;
  for (let i = 0; i < uint8.length; i += chunkSize) {
    const chunk = uint8.subarray(i, i + chunkSize);
    binaryString += String.fromCharCode.apply(null, Array.from(chunk));
  }

  const multipartRequestBody =
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    `Content-Type: ${file.type || 'application/octet-stream'}\r\n` +
    'Content-Transfer-Encoding: binary\r\n\r\n' +
    binaryString +
    closeDelimiter;

  const response = await fetch(
    `${DRIVE_UPLOAD_URL}/files?uploadType=multipart&fields=id,name,mimeType,size,createdTime,webViewLink,webContentLink,thumbnailLink`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': `multipart/related; boundary=${boundary}`
      },
      body: multipartRequestBody
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gagal mengunggah file ${file.name}: ${errorText}`);
  }

  const result = await response.json();
  return {
    id: result.id,
    name: result.name,
    mimeType: result.mimeType,
    size: result.size,
    createdTime: result.createdTime,
    webViewLink: result.webViewLink,
    webContentLink: result.webContentLink,
    thumbnailLink: result.thumbnailLink
  };
}

/**
 * Cadangkan seluruh database perkara dan tugas ke subfolder Database di Google Drive
 */
export async function syncDatabaseToGoogleDrive(
  token: string,
  perkaraList: Perkara[],
  tasks: TaskItem[]
): Promise<GoogleDriveFile> {
  const rootId = await getOrCreateBawasluFolder(token);
  const dbFolderId = await getOrCreateSubfolder(token, '01_Database_dan_Cadangan', rootId);

  const now = new Date();
  const dateStr = now.toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const fileName = `Database_LeAD-AP_Bawaslu_Banten_${dateStr}.json`;

  const backupData = {
    app: 'LeAD-AP Bawaslu Banten',
    version: '1.0 - 2026',
    emailTujuan: TARGET_DRIVE_EMAIL,
    timestamp: now.toISOString(),
    totalPerkara: perkaraList.length,
    totalTugas: tasks.length,
    perkaraList: perkaraList,
    tasks: tasks
  };

  return uploadFileToGoogleDrive(
    token,
    fileName,
    JSON.stringify(backupData, null, 2),
    'application/json',
    dbFolderId
  );
}

/**
 * Upload dokumen persidangan (BA-REG, Putusan, SPS, dll) ke subfolder Dokumen Sidang
 */
export async function uploadDokumenSidangToDrive(
  token: string,
  nomorRegister: string,
  kodeDokumen: string,
  judul: string,
  content: string
): Promise<GoogleDriveFile> {
  const rootId = await getOrCreateBawasluFolder(token);
  const docFolderId = await getOrCreateSubfolder(token, '02_Dokumen_Sidang_Resmi', rootId);

  const cleanReg = nomorRegister.replace(/[\/\\]/g, '_');
  const fileName = `${kodeDokumen}_${cleanReg}.txt`;

  return uploadFileToGoogleDrive(
    token,
    fileName,
    content,
    'text/plain',
    docFolderId
  );
}

/**
 * Upload alat bukti berkas ke subfolder Berkas Alat Bukti
 */
export async function uploadBuktiToDrive(
  token: string,
  nomorRegister: string,
  kodeBukti: string,
  file: File | { name: string; content: string }
): Promise<GoogleDriveFile> {
  const rootId = await getOrCreateBawasluFolder(token);
  const buktiFolderId = await getOrCreateSubfolder(token, '03_Berkas_Alat_Bukti', rootId);

  if (file instanceof File) {
    return uploadBinaryFileToGoogleDrive(token, file, buktiFolderId);
  } else {
    const cleanReg = nomorRegister.replace(/[\/\\]/g, '_');
    const fileName = `Bukti_${kodeBukti}_${cleanReg}_${file.name}`;
    return uploadFileToGoogleDrive(token, fileName, file.content, 'text/plain', buktiFolderId);
  }
}

/**
 * Upload draft formulir resmi atau dokumen contoh ke subfolder 02_Dokumen_Sidang_Resmi
 */
export async function uploadDraftFormulirToDrive(
  token: string,
  file: File,
  kodeFormulir: string
): Promise<GoogleDriveFile> {
  const rootId = await getOrCreateBawasluFolder(token);
  const docFolderId = await getOrCreateSubfolder(token, '02_Dokumen_Sidang_Resmi', rootId);
  return uploadBinaryFileToGoogleDrive(token, file, docFolderId);
}

/**
 * Mengambil daftar file yang tersimpan di Google Drive dalam folder LeAD-AP
 */
export async function listBawasluDriveFiles(token: string): Promise<GoogleDriveFile[]> {
  const folderId = await getOrCreateBawasluFolder(token);

  // Ambil subfolder juga
  const query = encodeURIComponent(`'${folderId}' in parents and trashed=false`);
  const res = await fetch(
    `${DRIVE_API_URL}/files?q=${query}&fields=files(id,name,mimeType,size,createdTime,webViewLink,webContentLink,thumbnailLink)&orderBy=createdTime desc&pageSize=100`,
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );

  if (!res.ok) {
    throw new Error('Gagal mengambil daftar file dari Google Drive');
  }

  const data = await res.json();
  const items: GoogleDriveFile[] = data.files || [];

  // Ambil file di dalam subfolders juga jika ada
  const subfolders = items.filter(f => f.mimeType === 'application/vnd.google-apps.folder');
  for (const sub of subfolders) {
    try {
      const subQuery = encodeURIComponent(`'${sub.id}' in parents and trashed=false`);
      const subRes = await fetch(
        `${DRIVE_API_URL}/files?q=${subQuery}&fields=files(id,name,mimeType,size,createdTime,webViewLink,webContentLink,thumbnailLink)&orderBy=createdTime desc&pageSize=50`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (subRes.ok) {
        const subData = await subRes.json();
        if (subData.files) {
          items.push(...subData.files);
        }
      }
    } catch {
      // ignore individual subfolder query errors
    }
  }

  return items;
}

/**
 * Menghapus file di Google Drive dengan konfirmasi wajib (User Confirmation)
 */
export async function deleteFileFromGoogleDrive(token: string, fileId: string, fileName: string): Promise<boolean> {
  const confirmed = window.confirm(
    `Apakah Anda yakin ingin menghapus berkas "${fileName}" dari Google Drive (${TARGET_DRIVE_EMAIL})? Tindakan ini tidak dapat dibatalkan.`
  );
  if (!confirmed) return false;

  const res = await fetch(`${DRIVE_API_URL}/files/${fileId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!res.ok) {
    throw new Error('Gagal menghapus file dari Google Drive');
  }
  return true;
}
