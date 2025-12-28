'use client';

import { useState, useEffect } from 'react';
import { Volume2, Loader2, Download, AlertCircle } from 'lucide-react';
import axios from 'axios';

const Home = () => {
  const [text, setText] = useState('');
  const [speaker, setSpeaker] = useState(3);
  const [speakers, setSpeakers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [loadingSpeakers, setLoadingSpeakers] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioRef, setAudioRef] = useState(null);

  const VOICEVOX_API = process.env.NEXT_PUBLIC_VOICEVOX_API_ROOT_URL;

  useEffect(() => {
    fetchSpeakers();
  }, []);

  const fetchSpeakers = async () => {
    const response = await axios.get(`${VOICEVOX_API}/speakers`).catch((error) => {
      setError('Voicevox APIに接続できません。ローカルでVoicevoxが起動しているか確認してください。');
      setLoadingSpeakers(false);
      return Promise.reject(error);
    });
    setSpeakers(response.data);
    setLoadingSpeakers(false);
  };

  const synthesize = async () => {
    if (!text.trim()) {
      setError('テキストを入力してください');
      return;
    }

    setLoading(true);
    setError('');
    setAudioUrl(null);

    try {
      const queryResponse = await fetch(`${VOICEVOX_API}/audio_query?text=${encodeURIComponent(text)}&speaker=${speaker}`, {
        method: 'POST',
      });

      if (!queryResponse.ok) throw new Error('音声クエリの作成に失敗しました');

      const queryData = await queryResponse.json();

      const synthesisResponse = await fetch(`${VOICEVOX_API}/synthesis?speaker=${speaker}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(queryData),
      });

      if (!synthesisResponse.ok) throw new Error('音声合成に失敗しました');

      const audioBlob = await synthesisResponse.blob();
      const url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);
    } catch (err) {
      setError('音声合成中にエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (audioUrl) {
      const a = document.createElement('a');
      a.href = audioUrl;
      a.download = 'voicevox_audio.wav';
      a.click();
    }
  };

  const handleAudioPlay = () => setIsPlaying(true);
  const handleAudioPause = () => setIsPlaying(false);
  const handleAudioEnded = () => setIsPlaying(false);

  return (
    <div style={styles.container}>
      <style>{`
        @keyframes wave {
          0%, 100% { height: 8px; }
          50% { height: 24px; }
        }
        @keyframes loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(400%); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>

      <div style={styles.contentWrapper}>
        <div style={styles.card}>
          <div style={styles.header}>
            <h1 style={styles.title}>
              <Volume2 size={36} />
              <span style={styles.titleText}>Voicevox 音声合成</span>
            </h1>
            <p style={styles.subtitle}>テキストを音声に変換します</p>
          </div>

          <div style={styles.body}>
            {error && (
              <div style={styles.errorBox}>
                <AlertCircle style={styles.errorIcon} size={20} />
                <p style={styles.errorText}>{error}</p>
              </div>
            )}

            <div style={styles.formGroup}>
              <label style={styles.label}>話者を選択</label>
              {loadingSpeakers ? (
                <div style={styles.loadingContainer}>
                  <Loader2 style={styles.spinningIcon} size={16} />
                  <span style={styles.loadingText}>話者情報を読み込み中...</span>
                </div>
              ) : (
                <select value={speaker} onChange={(e) => setSpeaker(Number(e.target.value))} style={styles.select} disabled={loading}>
                  {speakers.map((s) =>
                    s.styles.map((style) => (
                      <option key={style.id} value={style.id}>
                        {s.name} ({style.name})
                      </option>
                    )),
                  )}
                </select>
              )}
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>テキストを入力</label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="ここに音声合成したいテキストを入力してください..."
                style={styles.textarea}
                rows={6}
                disabled={loading}
              />
              <p style={styles.charCount}>{text.length} 文字</p>
            </div>

            <button
              onClick={synthesize}
              disabled={loading || !text.trim() || loadingSpeakers}
              style={{
                ...styles.button,
                ...(loading || !text.trim() || loadingSpeakers ? styles.buttonDisabled : {}),
              }}
            >
              {loading && <div style={styles.buttonPulse} />}
              <span style={styles.buttonContent}>
                {loading ? (
                  <>
                    <Loader2 style={styles.spinningIcon} size={20} />
                    <span>音声合成中...</span>
                  </>
                ) : (
                  <>
                    <Volume2 size={20} />
                    <span>音声合成を実行</span>
                  </>
                )}
              </span>
            </button>

            {loading && (
              <div style={styles.processingBox}>
                <div style={styles.processingHeader}>
                  <Loader2 style={styles.spinningIconBlue} size={20} />
                  <span style={styles.processingTitle}>処理中...</span>
                </div>
                <div style={styles.processingBody}>
                  <div style={styles.processingLabel}>
                    <span>音声クエリを作成中</span>
                  </div>
                  <div style={styles.progressBarContainer}>
                    <div style={styles.progressBar} />
                  </div>
                </div>
              </div>
            )}

            {audioUrl && (
              <div style={styles.audioBox}>
                <div style={styles.audioHeader}>
                  <h3 style={styles.audioTitle}>
                    <Volume2 style={styles.audioIcon} size={20} />
                    <span>音声が生成されました</span>
                  </h3>
                  {isPlaying && (
                    <div style={styles.playingBadge}>
                      <div style={styles.waveContainer}>
                        <div style={{ ...styles.waveBar, animationDelay: '0s' }} />
                        <div style={{ ...styles.waveBar, animationDelay: '0.1s' }} />
                        <div style={{ ...styles.waveBar, animationDelay: '0.2s' }} />
                      </div>
                      <span style={styles.playingText}>再生中</span>
                    </div>
                  )}
                </div>
                <audio
                  ref={setAudioRef}
                  controls
                  src={audioUrl}
                  style={styles.audio}
                  autoPlay
                  onPlay={handleAudioPlay}
                  onPause={handleAudioPause}
                  onEnded={handleAudioEnded}
                />
                <button onClick={handleDownload} style={styles.downloadButton}>
                  <Download size={20} />
                  <span>音声をダウンロード</span>
                </button>
              </div>
            )}
          </div>
        </div>

        <div style={styles.infoBox}>
          <p style={styles.infoTitle}>💡 使い方</p>
          <p style={styles.infoText}>ローカル環境でVoicevoxを起動してからご利用ください</p>
          <p style={styles.infoSubtext}>デフォルトポート: 50021</p>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #faf5ff 0%, #eff6ff 50%, #fdf2f8 100%)',
    padding: '48px 16px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  },
  contentWrapper: {
    maxWidth: '672px',
    margin: '0 auto',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '16px',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    overflow: 'hidden',
  },
  header: {
    background: 'linear-gradient(90deg, #9333ea 0%, #2563eb 100%)',
    padding: '24px 32px',
  },
  title: {
    fontSize: '30px',
    fontWeight: 'bold',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    margin: 0,
  },
  titleText: {
    display: 'inline-block',
  },
  subtitle: {
    color: '#e9d5ff',
    marginTop: '8px',
    marginBottom: 0,
  },
  body: {
    padding: '32px',
  },
  errorBox: {
    backgroundColor: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: '8px',
    padding: '16px',
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    marginBottom: '24px',
  },
  errorIcon: {
    color: '#ef4444',
    flexShrink: 0,
    marginTop: '2px',
  },
  errorText: {
    color: '#b91c1c',
    fontSize: '14px',
    margin: 0,
  },
  formGroup: {
    marginBottom: '24px',
  },
  label: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '8px',
  },
  loadingContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: '#6b7280',
  },
  spinningIcon: {
    animation: 'spin 1s linear infinite',
  },
  spinningIconBlue: {
    animation: 'spin 1s linear infinite',
    color: '#2563eb',
  },
  loadingText: {
    fontSize: '14px',
  },
  select: {
    width: '100%',
    padding: '12px 16px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '16px',
    outline: 'none',
    transition: 'all 0.2s',
    cursor: 'pointer',
  },
  textarea: {
    width: '100%',
    padding: '12px 16px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '16px',
    outline: 'none',
    resize: 'none',
    transition: 'all 0.2s',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
  },
  charCount: {
    fontSize: '14px',
    color: '#6b7280',
    marginTop: '8px',
    marginBottom: 0,
  },
  button: {
    width: '100%',
    background: 'linear-gradient(90deg, #9333ea 0%, #2563eb 100%)',
    color: 'white',
    padding: '16px',
    borderRadius: '8px',
    fontWeight: '600',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    transition: 'all 0.2s',
    position: 'relative',
    overflow: 'hidden',
    fontSize: '16px',
  },
  buttonDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
  buttonPulse: {
    position: 'absolute',
    inset: 0,
    background: 'linear-gradient(90deg, #c084fc 0%, #60a5fa 100%)',
    animation: 'pulse 2s ease-in-out infinite',
  },
  buttonContent: {
    position: 'relative',
    zIndex: 10,
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  processingBox: {
    backgroundColor: '#eff6ff',
    border: '1px solid #bfdbfe',
    borderRadius: '8px',
    padding: '16px',
    marginTop: '24px',
  },
  processingHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '12px',
  },
  processingTitle: {
    color: '#1e40af',
    fontWeight: '600',
  },
  processingBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  processingLabel: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '14px',
    color: '#1d4ed8',
  },
  progressBarContainer: {
    width: '100%',
    backgroundColor: '#bfdbfe',
    borderRadius: '9999px',
    height: '8px',
    overflow: 'hidden',
  },
  progressBar: {
    width: '70%',
    backgroundColor: '#2563eb',
    height: '100%',
    borderRadius: '9999px',
    animation: 'loading 1.5s ease-in-out infinite',
  },
  audioBox: {
    background: 'linear-gradient(90deg, #f0fdf4 0%, #eff6ff 100%)',
    borderRadius: '8px',
    padding: '24px',
    marginTop: '24px',
    border: '2px solid #bbf7d0',
  },
  audioHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '16px',
  },
  audioTitle: {
    fontWeight: '600',
    color: '#1f2937',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    margin: 0,
    fontSize: '16px',
  },
  audioIcon: {
    color: '#16a34a',
  },
  playingBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: '#dcfce7',
    padding: '4px 12px',
    borderRadius: '9999px',
  },
  waveContainer: {
    display: 'flex',
    gap: '4px',
  },
  waveBar: {
    width: '4px',
    height: '16px',
    backgroundColor: '#16a34a',
    borderRadius: '9999px',
    animation: 'wave 0.6s ease-in-out infinite',
  },
  playingText: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#15803d',
  },
  audio: {
    width: '100%',
    marginBottom: '16px',
  },
  downloadButton: {
    width: '100%',
    backgroundColor: '#16a34a',
    color: 'white',
    padding: '12px',
    borderRadius: '8px',
    fontWeight: '600',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    transition: 'background-color 0.2s',
    fontSize: '16px',
  },
  infoBox: {
    marginTop: '24px',
    textAlign: 'center',
    fontSize: '14px',
    color: '#4b5563',
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '16px',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
  },
  infoTitle: {
    fontWeight: '600',
    marginBottom: '4px',
    marginTop: 0,
  },
  infoText: {
    margin: '4px 0',
  },
  infoSubtext: {
    fontSize: '12px',
    marginTop: '4px',
    marginBottom: 0,
  },
};

export default Home;
