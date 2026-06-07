# Voicevox Webplayer サンプルアプリ

このプロジェクトは、[Voicevox](https://voicevox.hiroshiba.com/) API を利用してテキストから音声を生成し、音声ファイルをダウンロードできるサンプルアプリケーションです。  
ローカルで Voicevox を起動してからご利用ください。

---

## 🎯 目的

- Voicevox API との連携方法をデモする
- テキスト入力から音声合成・ダウンロードの一連のフローを体験可能にする
- Next.js での API クライアント実装のサンプルを提供する

---

## 🚀 CLI での起動手順

1. **プロジェクトクローン**
   ```bash
   git clone https://github.com/takukobayashi/voicevox-webplayer-sample.git
   cd voicevox-webplayer-sample
   ```

2. **依存関係のインストール**
   ```bash
   npm install
   ```

3. **環境変数の設定**
   - `.env` ファイルを作成し、以下を設定:
     ```env
     NEXT_PUBLIC_VOICEVOX_API_ROOT_URL=http://localhost:50021
     ```

4. **ローカルでの起動**
   ```bash
   npm run dev
   ```
   - ブラウザで `http://localhost:3000` にアクセス

---

## 🧪 デモ環境

[デモサイトはこちら](https://takukobayashi.github.io/voicevox-webplayer-sample/)  
（GitHub Pages でホストされている公開バージョン）

---

## ⚠️ 注意事項

- ローカルで Voicevox サーバーを起動していないと動作しません
- デモ環境では `http://localhost:50021` を API エンドポイントとして使用しています
- プロダクション環境では `NEXT_PUBLIC_VOICEVOX_API_ROOT_URL` を適切な値に変更してください

---


## 📢 フィードバック

ご意見・ご質問は [GitHub Issues](https://github.com/takukobayashi/voicevox-webplayer-sample/issues) へご投稿ください。
