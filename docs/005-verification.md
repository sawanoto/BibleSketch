# No.005 verification / 検証

Chromium、PC 1440×1000、タッチ390×844、最小幅320pxで確認。

- 親と子の両方から同じモーダルが開く。はい／いいえの幅・高さ・背景色が一致。Escで閉じて再選択可能。
- 両分岐が約6.5秒で終了。進行中は人物入力とリセットを無効化。終了後リセットして別分岐を体験可能。
- 「はい」では制止の光を挟んで親子が残る。「いいえ」では剣を子から離す方向に下げ、親が傾き、子が見つめる。血、剣の接触、評価文なし。
- 両結末でWeb Audioの音源数が0。初回操作でAudioContextを開始。風は初期状態だけ。
- 9場面すべてPCで3840×2400、タッチで2560×1600 PNGを生成。記録はリセット後も残る。通常Canvasの大きさに復帰。
- PC・タッチのブラウザJavaScriptエラーなし。320pxでページの横はみ出しなし。
- 共通描画ファイルとNo.001〜004のソースを変更していない。

Automated tests: `npm run test:isaac` uses real Chromium pointer/touch events, both branches, equal button dimensions/colors, audio source cleanup, all nine PNGs, reset and narrow layout. Generated stills are `005-scene-*.png` alongside this document. Viewport screenshots are generated in the workspace scratch folder.

既存作品の回帰テスト：`npm test`、`npm run test:cain-abel`、`npm run test:noah`、`npm run test:babel`。

未確認：実機iOS／Androidでの音の聴感・音量、OSの共有・長押し保存画面、低メモリ端末性能。Kindle用の最終組版・入稿は別途必要。キーボード操作とAudioContextを無効にしたブラウザでも結末へ到達しました。

Not verified on physical iOS/Android hardware: speaker listening, OS sharing/touch-and-hold UI and low-memory performance. Kindle layout and submission are separate. Keyboard operation and the AudioContext-unavailable fallback also reached an ending.
