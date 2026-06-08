import { atom } from 'jotai';
import { atomWithStorage, createJSONStorage } from 'jotai/utils';

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

// ----------------------------------------------------------------
// ローカルストレージキャッシュ（有効期間 12 時間）
// ----------------------------------------------------------------

const CACHE_TTL_MS = 12 * 60 * 60 * 1000; // 12 hours

type SpeakersCache = {
  data: Speaker[];
  cachedAt: number;
};

/**
 * speakers のキャッシュを localStorage に保存する atom。
 * null = 未取得 or 期限切れ
 *
 * Next.js SSG では build 時に localStorage が存在しないため、
 * createJSONStorage の getItem をブラウザ側のみ実行させる。
 */
const speakersCacheStorage = createJSONStorage<SpeakersCache | null>(() => {
  // SSR / build 時は noop ストレージを返す
  if (typeof window === 'undefined') {
    return {
      length: 0,
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
      clear: () => {},
      key: () => null,
    } as unknown as Storage;
  }
  return localStorage;
});

const speakersCacheAtom = atomWithStorage<SpeakersCache | null>('voicevox_speakers_cache', null, speakersCacheStorage, {
  getOnInit: true, // マウント直後に localStorage から読み込む
});

// ----------------------------------------------------------------
// 公開 atom
// ----------------------------------------------------------------

/**
 * Voicevox スピーカー一覧。
 * 読み取り時にキャッシュ期限を検証し、期限切れなら null を返す派生 atom。
 */
export const speakersAtom = atom(
  (get) => {
    const cache = get(speakersCacheAtom);
    if (!cache) return null;
    const isExpired = Date.now() - cache.cachedAt > CACHE_TTL_MS;
    return isExpired ? null : cache.data;
  },
  (_get, set, speakers: Speaker[]) => {
    set(speakersCacheAtom, { data: speakers, cachedAt: Date.now() });
  },
);

export const slectSpeakerAtom = atomWithStorage<number>('voicevox_select_speaker_number', 3, undefined, {
  getOnInit: true, // マウント直後に localStorage から読み込む
});
