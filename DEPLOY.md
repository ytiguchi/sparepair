# Firebase Hosting デプロイ手順

## 1. ビルド
```powershell
npm run build
```

## 2. Firebaseにログイン
```powershell
firebase login
```

## 3. デプロイ
```powershell
firebase deploy --only hosting
```

## 完了！
デプロイが完了すると、URLが表示されます。
通常: `https://ledianspa-repare.web.app`
