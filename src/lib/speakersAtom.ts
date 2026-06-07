import { atomWithStorage } from 'jotai/utils';

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
export const speakersAtom = atomWithStorage<Speaker[] | null>('speakers', null);
