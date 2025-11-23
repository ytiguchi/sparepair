# CSVデータをFirebaseにインポートする方法

## 手順

### 1. Firebase サービスアカウントキーを取得

1. [Firebase Console](https://console.firebase.google.com) にアクセス
2. プロジェクトを選択
3. 左上の⚙️（歯車アイコン）をクリック → **プロジェクトの設定**
4. **サービス アカウント** タブを選択
5. **新しい秘密鍵の生成** ボタンをクリック
6. ダウンロードされたJSONファイルを `serviceAccountKey.json` という名前で `c:\Dev` フォルダに保存

### 2. インポートスクリプトを実行

```powershell
cd c:\Dev
node import-csv.js
```

### 3. 確認

- スクリプトが正常に完了すると、29件のレポートがFirebaseにインポートされます
- アプリを開いて確認してください（`npm run dev`）
- または Firebase Console の Firestore Database で確認できます

## 注意事項

- このスクリプトは既存のデータに**追加**します（上書きではありません）
- すでにデータがある場合は、重複を避けるため、Firebase Console で `reports` コレクションを削除してから実行してください
- `serviceAccountKey.json` は機密情報です。**絶対にGitにコミットしないでください**（.gitignoreに追加済み）

## トラブルシューティング

### エラー: serviceAccountKey.json not found
→ 手順1を完了してください

### エラー: Permission denied
→ Firebase プロジェクトの権限を確認してください

### データが表示されない
→ `src/lib/firebase.js` の設定が正しいか確認してください
