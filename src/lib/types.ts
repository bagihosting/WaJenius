export type Message = {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  recipient?: string; // Menyimpan nomor telepon penerima
  timestamp: number; // Unix timestamp
};
