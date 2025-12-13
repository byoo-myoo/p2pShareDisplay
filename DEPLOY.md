# GitHub Pages へのデプロイ

このプロジェクトは、GitHub Actions を使用して GitHub Pages に自動的にデプロイされるように設定されています。

## 前提条件

1. **GitHub リポジトリ**: このプロジェクトが GitHub リポジトリにプッシュされていることを確認します。
2. **Package.json**: `package.json` の `homepage` フィールドを実際の G​​itHub Pages URL に更新します。
```json
"homepage": "https://<YOUR_USERNAME>.github.io/<YOUR_REPO_NAME>"
```

## GitHub Pages の有効化

1. GitHub 上のリポジトリに移動します。
2. **設定** > **ページ** に移動します。
3. **ビルドとデプロイ** で、ソースとして **GitHub Actions** を選択します。
* *注: 「GitHub Actions」が表示されない場合は、まず `.github/workflows/deploy.yml` ファイルをプッシュする必要がある可能性があります。*

## デプロイプロセス

1. 変更を `main` ブランチにプッシュします。
2. `.github/workflows/deploy.yml` で定義された GitHub Action が自動的に実行されます。
3. プロジェクトがビルドされ、`gh-pages` 環境にデプロイされます。
4. 完了すると、リポジトリ設定で指定した URL (通常は `[https://myooken.github.io/p2pShareDisplay](https://myooken.github.io/p2pShareDisplay)`) でサイトが公開されます。

## トラブルシューティング

- **404 エラー**: 404 エラーが表示された場合は、`vite.config.js` の `base` が `'./'` に設定されていること（設定されています）と、`package.json` の `homepage` が正しいことを確認してください。
- **ルーティングの問題**: アプリは `HashRouter` を使用しているため、GitHub Pages でページの再読み込みは正常に動作するはずです。