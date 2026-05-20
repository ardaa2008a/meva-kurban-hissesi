'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { addRecord } from '@/lib/supabase';
import { Send } from 'lucide-react';

export default function QuickAdd() {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const user = useStore((state) => state.user);
  const addRecordToStore = useStore((state) => state.addRecord);

  const parseInput = (text: string) => {
    const parts = text.trim().split(/\s+/);
    let name = '';
    let phone = '';
    let odemedurumu = 'Ödenmedi';
    let odemesekli = 'Nakit';
    let hisse = 1;
    let ilgilenen = '';

    // Parse logic
    const phoneRegex = /^0\d{3}\s?\d{3}\s?\d{2}\s?\d{2}$/;
    const numberRegex = /^\d+$/;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i].toLowerCase();

      // Check for phone
      if (phoneRegex.test(parts[i])) {
        phone = parts[i];
        continue;
      }

      // Check for payment status
      if (part === 'ödendi') {
        odemedurumu = 'Ödendi';
        continue;
      }
      if (part === 'ödenmedi') {
        odemedurumu = 'Ödenmedi';
        continue;
      }

      // Check for payment method
      if (part === 'nakit') {
        odemesekli = 'Nakit';
        continue;
      }
      if (part === 'banka') {
        odemesekli = 'Banka';
        continue;
      }

      // Check for number (hisse)
      if (numberRegex.test(parts[i]) && !phoneRegex.test(parts[i])) {
        const num = parseInt(parts[i]);
        if (num <= 100) {
          hisse = num;
          // Check if next part is "hisse"
          if (i + 1 < parts.length && parts[i + 1].toLowerCase() === 'hisse') {
            i++; // Skip "hisse"
          }
          continue;
        }
      }

      // Rest is name and ilgilenen
      if (!name) {
        name += parts[i];
      } else if (
        part !== 'ödendi' &&
        part !== 'ödenmedi' &&
        part !== 'nakit' &&
        part !== 'banka' &&
        part !== 'hisse' &&
        !numberRegex.test(parts[i])
      ) {
        if (ilgilenen) {
          ilgilenen += ' ' + parts[i];
        } else {
          name += ' ' + parts[i];
          // Check if this could be start of ilgilenen
          if (i === parts.length - 1 || (i < parts.length - 1 && !numberRegex.test(parts[i + 1]))) {
            // Might be ilgilenen
          }
        }
      }
    }

    // If we have enough parts, last non-keyword part is ilgilenen
    if (!ilgilenen && parts.length > 6) {
      ilgilenen = parts[parts.length - 1];
      name = parts.slice(0, parts.length - 1).filter(p => 
        p !== phone && 
        p.toLowerCase() !== 'ödendi' && 
        p.toLowerCase() !== 'ödenmedi' &&
        p.toLowerCase() !== 'nakit' &&
        p.toLowerCase() !== 'banka' &&
        p.toLowerCase() !== 'hisse' &&
        !numberRegex.test(p)
      ).join(' ');
    }

    return {
      name: name.trim(),
      phone: phone || '',
      odemedurumu,
      odemesekli,
      hisse,
      ilgilenen: ilgilenen.trim()
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !user) return;

    setLoading(true);
    try {
      const parsed = parseInput(input);
      
      if (!parsed.name) {
        alert('İsim soyisim gerekli');
        setLoading(false);
        return;
      }

      const newRecord = {
        id: Date.now().toString(),
        name: parsed.name,
        phone: parsed.phone,
        hisse_sayisi: parsed.hisse,
        odeme_durumu: parsed.odemedurumu,
        odeme_sekli: parsed.odemesekli,
        ilgilenen_kisi: parsed.ilgilenen,
        kaydı_ekleyen: user.username,
        created_at: new Date().toISOString()
      };

      const { error } = await addRecord(newRecord, user.username);
      
      if (!error) {
        addRecordToStore(newRecord);
        setInput('');
        alert('Kayıt başarıyla eklendi!');
      } else {
        alert('Hata: ' + error.message);
      }
    } catch (error) {
      alert('Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg p-4">
      <div className="max-w-7xl mx-auto">
        <p className="text-xs text-gray-600 mb-2">
          💡 Örnek: "Arda Türkmen 0555 111 22 33 ödendi banka 2 hisse Hayri" (Enter'a bas)
        </p>
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="İsim, telefon, ödeme durumu, ödeme şekli, hisse, ilgilenen kişi..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg flex items-center gap-2 font-medium transition"
          >
            <Send className="w-4 h-4" />
            Ekle
          </button>
        </form>
      </div>
    </div>
  );
}
