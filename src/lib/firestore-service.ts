// src/lib/firestore-service.ts
import { firestore } from './firebase';
import { collection, addDoc, query, orderBy, getDocs, Timestamp, where } from 'firebase/firestore';
import type { Message } from './types';

const CONVERSATIONS_COLLECTION = 'conversations';
const MESSAGES_SUBCOLLECTION = 'messages';

/**
 * Menyimpan pesan ke subkoleksi pesan dari percakapan tertentu.
 * @param phoneNumber - Nomor telepon pengguna, digunakan sebagai ID dokumen percakapan.
 * @param message - Objek pesan yang akan disimpan.
 */
export async function saveMessage(phoneNumber: string, message: Omit<Message, 'id' | 'timestamp'> & { timestamp?: number }): Promise<void> {
  try {
    const conversationRef = collection(firestore, CONVERSATIONS_COLLECTION, phoneNumber, MESSAGES_SUBCOLLECTION);
    
    // Firestore akan secara otomatis menangani konversi timestamp
    const docData = {
        ...message,
        timestamp: Timestamp.fromMillis(message.timestamp || Date.now()),
    };
    
    await addDoc(conversationRef, docData);
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
    const messagesRef = collection(firestore, CONVERSATIONS_COLLECTION, phoneNumber, MESSAGES_SUBCOLLECTION);
    const q = query(messagesRef, orderBy('timestamp', 'asc'));
    
    const querySnapshot = await getDocs(q);
    
    const messages: Message[] = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        text: data.text,
        sender: data.sender,
        recipient: data.recipient,
        // Konversi Firestore Timestamp ke Unix timestamp (milidetik)
        timestamp: (data.timestamp as Timestamp).toMillis(),
      } as Message;
    });

    console.log(`Mengambil ${messages.length} pesan untuk ${phoneNumber}.`);
    return messages;
  } catch (error) {
    console.error(`Gagal mengambil pesan untuk ${phoneNumber} dari Firestore:`, error);
    throw new Error('Gagal mengambil pesan dari database.');
  }
}
