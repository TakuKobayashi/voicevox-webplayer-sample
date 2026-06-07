import { atomWithStorage } from 'jotai/utils';
import { useEffect } from 'react';

export type SpeakerStyle = {
  id: number;
  name: string;
  type?: string;
};

export type Speaker = {
  name: string;
  speaker_uuid: string;
  styles: SpeakerStyle[];
  version?: string;
};

/**
 * Voicevox から取得したスピーカー一覧をセッション中キャッシュするatom。
 * null = 未取得, Speaker[] = 取得済み
 */
const speakersAtomBase = atomWithStorage<Speaker[] | null>('speakers', null);

// キャッシュの有効期限（12時間）
const CACHE_DURATION = 12 * 60 * 60 * 1000;

// ローカルストレージからキャッシュデータを取得
const getCachedSpeakers = (): { speakers: Speaker[] | null; timestamp: number } => {
  const cachedData = localStorage.getItem('speakersCache');
  if (cachedData) {
    const { speakers, timestamp } = JSON.parse(cachedData);
    return { speakers, timestamp };
  }
  return { speakers: null, timestamp: 0 };
};

// ローカルストレージにキャッシュデータを保存
const saveCachedSpeakers = (speakers: Speaker[]) => {
  const timestamp = Date.now();
  localStorage.setItem('speakersCache', JSON.stringify({ speakers, timestamp }));
};

// キャッシュの有効期限をチェックし、必要に応じてキャッシュをクリア
export const useSpeakerCache = () => {
  useEffect(() => {
    const { timestamp } = getCachedSpeakers();
    if (timestamp && Date.now() - timestamp > CACHE_DURATION) {
      localStorage.removeItem('speakersCache');
    }
  }, []);
};

// 拡張したatomWithStorageを使用
export const speakersAtom = atomWithStorage<Speaker[] | null>('speakers', null, {
  onGet: (value) => {
    const { speakers, timestamp } = getCachedSpeakers();
    if (timestamp && Date.now() - timestamp > CACHE_DURATION) {
      localStorage.removeItem('speakersCache');
      return null;
    }
    return speakers;
  },
  onSet: (newValue) => {
    saveCachedSpeakers(newValue);
  },
});
