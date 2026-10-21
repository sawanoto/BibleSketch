# BIBLE Sketch No.004 · バベルの塔 / Tower of Babel

原典：旧約聖書・創世記11章1〜9節 / Source: Genesis 11:1–9.

**作者の解釈：「人間はもともと、それぞれ異なる考えを持っている。しかし、全員が一つの目的に向かうことができれば、巨大な塔を建てることもできるのではないか。」**

**The artist’s interpretation: People begin with different ideas. But if everyone can work toward a shared purpose, might they build even an enormous tower?**

## 原典と独自の解釈 / Source and interpretation

原典では、同じ言葉を話す人々が町と塔を建てようとし、神が言葉を混乱させたことで意思疎通ができなくなり、建設をやめ、各地へ散っていきます。

本作はその結末を逆転させ、最初は建設方針の異なるマーパンたちが、意思をそろえて塔を完成させる作者独自の解釈です。神が塔を破壊したり、完成後に言葉を乱したりする演出は加えません。操作・全員一致の条件・塔の完成・マーパン・音・カメラは独自の演出です。聖書の翻訳本文や既存絵画は転載していません。

**同じ言語を話すことと、同じ目的を共有することは必ずしも同じではありません。矢印は言語そのものではなく、各マーパンの建設方針や意思を象徴します。** 全ての考えが同一であるべきだと説くのではなく、この一つの建設に向かう協力を体験する作品です。

The original ends in confused language, interrupted construction, and scattering. This work reverses that ending: Marpans with different building intentions complete the tower through a shared goal. Speaking the same language is not identical to sharing a purpose. The arrows symbolize intentions, not languages, and the work does not claim that everyone should think alike in every respect. No Bible translation or existing painting is reproduced.

## 実行 / Run

リポジトリルートをHTTP配信します。追加のビルド・実行時パッケージは不要です。

```sh
python3 -m http.server 8000
```

`http://localhost:8000/004-tower-of-babel/` を開くか、トップページのNo.004カードから移動します。p5.jsと共通マーパン描画は同梱し、音はWeb Audio APIで合成。外部フォントや音声素材は取得しません。

## 操作 / Interaction

- 初期状態は全ての4方向が混在し、塔は土台だけ。
- 吹き出しをタップ／クリックするたびに、**左 → 下 → 右 → 上 → 左** と循環します。矢印だけを短く回転させ、操作対象自体は移動させません。
- 上向きは少し明るい吹き出しになります。全員一致前なら、上向きも再操作して左向きへ戻せます。
- 全員が上向きになるまで、経過時間にかかわらず建設しません。7/8や5/6では土台のままです。
- 最後の一人が上向きになったその操作で建設状態へ入り、全員の矢印操作を固定します。
- 全員の軽い輝き、中央への視線、小さな作業の動き・レンガの運搬、18層の建設を約6.8秒で表現します。カメラは上方へ引いて全景を映し、最上部が雲へ届きます。
- 完成後は全員が塔を見上げ、上向きの吹き出しが残ります。建築音は終わり、雲と穏やかな風だけが続きます。
- 「はじめから」で今回の進行・場面記録を初期化し、新しく向きを混在させます。
- キーボードはTabで吹き出しを選び、Enter／Spaceで一回ずつ変更できます。

Tap or click a bubble to cycle left, down, right, up, left. Upward arrows stay editable until everyone agrees. The final upward arrow starts construction immediately, and all bubble inputs then lock. Eighteen tiers rise over 6.8 seconds. After completion, only quiet wind and drifting clouds remain. Start over clears the run and reshuffles the starting directions. Native buttons support Tab and Enter/Space.

## レイアウト・共通マーパン / Layout and shared design

開始時のステージ幅が640px未満なら6体、それ以外は8体です。プレイ中のリサイズ・画面回転では人数も方向も変えません。リセット時に現在の幅で人数を決め直します。

6体は塔の左右に3体ずつ、8体は左右に2列×2段ずつの段状広場に整列。小さい画面では横長4:3、大きい画面では8:5の世界を表示し、縦横で共通のスケールを使うため身体や目は変形しません。吹き出しのHTML入力領域は46px以上、隣同士が重ならない配置です。カメラ移動中と完成後は入力領域を隠しますが、物語の吹き出しはCanvasに残ります。

`../shared/marpan-25d.js` を直接参照し、変更していません。全員に同じ身体色・大きさ・`expression:'pupil'`・三つ目・口なしを使用。目の形状と配置、身体の輪郭は共通描画そのものです。意思の違いを身体の色や別の顔で表現しません。

Small screens start with six members; larger ones with eight. Resizing preserves the cohort and choices. The artwork uses uniform scaling and stable targets of at least 46px. The unmodified shared renderer supplies every body and eye, with identical body color and proportions. Only the arrows express different intentions.

## 音 / Sound

初回操作または音ボタンから音を有効化します。

- 初期は各メンバーに異なる短い音を割り当て、約1.8秒おきに一人ずつ控えめに鳴らします。同時に全員を鳴らし続けません。
- 方向変更は短いクリック音、上向きでは澄んだ短音。
- 全員一致では複数音が一つの和音になり、建設へ進みます。
- 建設中は約0.34秒おきの短い積み上げ音。
- 完成時に作業音源を全て停止し、低音量の風だけを残します。和音や建築音を完成後に再生し直しません。

マスターゲインとコンプレッサーで音量を抑え、声・クリック・建築音は有限の包絡。消音・タブ非表示・リセットは音源と予約済みの再生を停止します。非表示中は建設も進みません。音声APIが使えなくても進行できます。動きを減らす設定では、矢印の回転・作業の揺れ・雲の継続的な動きを抑え、建設そのものは滑らかに進みます。

Short, distinct voices sound one at a time. Changes produce clicks, upward arrows clear tones, unanimity a chord, and construction a bounded brick rhythm. Completion stops all work sounds and leaves only quiet wind. Muting, reset, and hiding the page stop sources. Audio failure does not block the piece; reduced motion preserves the building sequence while reducing decorative motion.

## PNG / Kindle向け素材

今回のプレイで体験した6場面を個別に保存できます。

| 場面 | ファイル名 |
| --- | --- |
| バラバラな矢印 | `scattered` |
| 少しずつ上向きにそろう | `partial` |
| 全員が上向きになった瞬間 | `united` |
| 塔の建設中 | `building` |
| 雲まで届いた塔の全景 | `clouds` |
| 完成した塔を見上げる人物に寄った構図 | `gaze` |

初期・途中の意思の記録は実際の操作状態を保存します。部分的な統一は、その時点までの最多の上向き数（全員一致は除く）を記録します。建設・完成は代表時刻で描きます。上向きになった瞬間の画像では矢印の回転を完了させ、全員が上を向いたことを読めるようにします。

2560×1600または3840×2400の横長8:5 PNG。端末の画面とは別に静止画向けの配置で描き、方向と人数は維持します。リセット・音・保存などのHTML操作ボタン、ガイド、フォーカス枠は含みません。**吹き出しと矢印は物語の一部なので画像にも含めます。** `gaze`は完成した場面の寄りの構図で、塔の上部が画面外になる場合があります。全景は`clouds`で保存できます。

Canvasを一回だけ高解像度にし、直ちに通常サイズと描画密度へ戻します。出力で人数・方向・建設回数を変えません。プレビュー中は進行と音を停止し、閉じると再開。ダウンロード・画像長押し保存・対応端末でのファイル共有に対応します。

記録は今回のプレイのメモリ内だけです。リセット・再読み込みで初期化し、端末間同期はありません。低メモリ端末では2560を選択してください。Kindle最終組版、色校正、KDP入稿は別途必要です。

Six reached scenes can be exported in 8:5 at either resolution. Still-image layout may differ from the live phone composition, while preserving the members and directions. Control buttons and guides are excluded; narrative speech bubbles remain. Looking up together uses a closer crop, while The tower reaches the clouds shows the entire tower. Export does not alter the run. Records clear on reset or reload, and Kindle preparation remains separate work.

## 構成・検証 / Files and tests

- `story.js`：6/8体、方向循環、全員一致、建設の一回だけの開始、時間進行。
- `sketch.js`：共通描画、段状広場、18層の塔、カメラ、操作、6場面の記録・PNG。
- `sound.js`：短い声、方向変更、和音、建築音、完成後の風と停止処理。
- `index.html`・`style.css`・`about.html`：日英UI・解説とレスポンシブ配置。
- `cover.png`：作品Canvasから作成したトップ用カバー。
- `../tests/babel-model.cjs`・`../tests/babel.cjs`：判定・入力・音源停止・PNG等のテスト。
- `../docs/004-verification.md`：確認結果と制約。

HTTP配信し、PlaywrightとChromiumのある環境で `npm run test:babel`。実行だけにはnpmインストール不要です。

## 公開 / Publishing

実際の既存リポジトリ名は `sawanoto/BibleSketch`。No.1〜No.3の作品フォルダ・共通素材は変更しません。

No.2・No.3が未マージのため、No.4はNo.3完成ブランチ上の積み上げPRです。No.2、No.3を順にmainへ取り込み、No.4のPRのbaseもmainに変更してからマージします（GitHubの自動変更があれば確認）。既存のGitHub Pages（main / root）で自動公開されます。

予定URL：`https://sawanoto.github.io/BibleSketch/004-tower-of-babel/`。PRのpushだけでは本番へ反映されません。
