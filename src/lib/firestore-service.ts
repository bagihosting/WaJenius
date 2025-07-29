// src/lib/firestore-service.ts
import { firestore, getAdminFirestore } from './firebase';
import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  getDocs, 
  Timestamp, 
  serverTimestamp
} from 'firebase/firestore';
import type { Message } from './types';
import type { Firestore, DocumentReference, QuerySnapshot, CollectionReference } from 'firebase-admin/firestore';

const CONVERSATIONS_COLLECTION = 'conversations';
const MESSAGES_SUBCOLLECTION = 'messages';

// Menentukan apakah kode berjalan di server
const isServer = typeof window === 'undefined';

/**
 * Menyimpan pesan ke subkoleksi pesan dari percakapan tertentu.
 * @param phoneNumber - Nomor telepon pengguna, digunakan sebagai ID dokumen percakapan.
 * @param message - Objek pesan yang akan disimpan.
 */
export async function saveMessage(phoneNumber: string, message: Omit<Message, 'id' | 'timestamp'> & { timestamp?: number }): Promise<void> {
  try {
    let conversationRef: CollectionReference | FirebaseFirestore.CollectionReference<FirebaseFirestore.DocumentData>;
    let docData;

    if (isServer) {
        // --- Logika sisi server menggunakan Admin SDK ---
        const adminDb: Firestore = getAdminFirestore();
        conversationRef = adminDb.collection(CONVERSATIONS_COLLECTION).doc(phoneNumber).collection(MESSAGES_SUBCOLLECTION);
        docData = {
            ...message,
            // Admin SDK menggunakan objeknya sendiri untuk timestamp
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
        };
        await conversationRef.add(docData);
    } else {
        // --- Logika sisi klien menggunakan Client SDK ---
        conversationRef = collection(firestore, CONVERSATIONS_COLLECTION, phoneNumber, MESSAGES_SUBCOLLECTION);
        docData = {
            ...message,
            // Client SDK menggunakan fungsi yang diimpor
            timestamp: serverTimestamp(),
        };
        await addDoc(conversationRef, docData);
    }
    
    console.log(`Pesan untuk ${phoneNumber} berhasil disimpan ke Firestore.`);
  } catch (error) {
    console.error(`Gagal menyimpan pesan untuk ${phoneNumber} ke Firestore:`, error);
    throw new Error('Gagal menyimpan pesan ke database.');
  }
}

/**
 * Mengambil semua pesan untuk nomor telepon tertentu, diurutkan berdasarkan timestamp.
 * @param phoneNumber - Nomor telepon pengguna.
 * @returns Array dari objek pesan.
 */
export async function getMessages(phoneNumber: string): Promise<Message[]> {
  try {
    let querySnapshot: QuerySnapshot | FirebaseFirestore.QuerySnapshot<FirebaseFirestore.DocumentData>;

    if (isServer) {
        // --- Logika sisi server menggunakan Admin SDK ---
        const adminDb = getAdminFirestore();
        const messagesRef = adminDb.collection(CONVERSATIONS_COLLECTION).doc(phoneNumber).collection(MESSAGES_SUBCOLLECTION);
        const q = messagesRef.orderBy('timestamp', 'asc');
        querySnapshot = await q.get();

    } else {
        // --- Logika sisi klien menggunakan Client SDK ---
        const messagesRef = collection(firestore, CONVERSATIONS_COLLECTION, phoneNumber, MESSAGES_SUBCOLLECTION);
        const q = query(messagesRef, orderBy('timestamp', 'asc'));
        querySnapshot = await getDocs(q);
    }
    
    const messages: Message[] = querySnapshot.docs.map(doc => {
      const data = doc.data();
      // Admin dan Client SDK memiliki cara berbeda untuk menangani timestamp
      const timestamp = data.timestamp;
      const millis = timestamp && typeof timestamp.toMillis === 'function' ? timestamp.toMillis() : (timestamp?._seconds * 1000 + timestamp?._nanoseconds / 1000000) || Date.now();

      return {
        id: doc.id,
        text: data.text,
        sender: data.sender,
        recipient: data.recipient,
        timestamp: millis,
      } as Message;
    });

    console.log(`Mengambil ${messages.length} pesan untuk ${phoneNumber}.`);
    return messages;
  } catch (error) {
    console.error(`Gagal mengambil pesan untuk ${phoneNumber} dari Firestore:`, error);
    throw new Error('Gagal mengambil pesan dari database.');
  }
}
