# BIBLE Sketch No.002 · カインとアベル / Cain and Abel

原典：旧約聖書・創世記4章1〜16節 / Source: Genesis 4:1–16.

作者の解釈：**自分の問題を解決する代わりに、他人を排除してしまう。しかし、他人を排除しても、自分の問題は解決しない。**

The artist’s interpretation: **We may remove someone else instead of facing our own problem. But removing another person does not resolve that problem.**

## 原典と作者の表現 / Source and interpretation

原典由来：カインは農耕、アベルは羊を飼う者。それぞれの捧げ物、アベルとその捧げ物への神の顧み、カインの怒り、弟の殺害という流れ。

**神がカインの捧げ物を受け入れなかった理由は、本文には明記されていません。**「自分の非を認められない」というテーマは作者独自の解釈であり、作物や整え方が劣っていたと断定しません。

本文にない演出：光による顧みの象徴、操作回数、マーパンの表情、赤い揺らぎ、籠を整える操作、弟を攻撃しない別の結末、弟が消えた後も光の当たらない籠と空白を見つめる兄。籠を整えても、神が認めたことを示す光や音は一切追加しません。

原典には、殺害後の問いかけ、罰、カインを守るしるし、追放も記されています。本作はそれら全てを再現せず、怒りの向かう先と残された問題に焦点を絞っています。聖書の翻訳本文は転載していません。宗教教育や捧げ物の善し悪しを採点する作品ではありません。

The passage does not explicitly state why Cain’s offering was not accepted. An inability to acknowledge one’s own faults is an artistic interpretation, not an explanation claimed by the biblical text. The alternative of tending the basket is entirely imagined by the artist. It never earns divine light or a reward sound. The lingering unlit offering and empty space are also interpretive imagery. The work focuses on this psychology rather than recreating every event in Genesis 4:1–16; no Bible translation is quoted.

## 実行 / Run

リポジトリルートでHTTP配信します。ビルド・追加依存不要。

```sh
python3 -m http.server 8000
```

`http://localhost:8000/002-cain-and-abel/` を開きます。シリーズトップからも移動できます。p5.jsと共通マーパンはローカル同梱。音はWeb Audio APIで合成し、外部ファイルを取得しません。

Serve the repository root, then open the work’s subdirectory. No build, runtime package install, external font, or remote sound asset is needed.

## 操作 / Interaction

1. 「捧げる / Offer」で2人が捧げ物を差し出す。
2. 弟の捧げ物だけに光が降りる。その後、兄の目と赤い揺らぎに怒りが表れる。
3. 左の籠を4回整えると、兄が落ち着いて籠に向き合う別の結末へ。
4. 右の弟を3回操作すると、短い暗転と静かな消失を経て、兄だけが残る結末へ。
5. 弟への3回目より前なら、籠へ向き直って別の結末へ進むこともできる。
6. 「はじめから / Start over」で冒頭へ戻る。別の結末も体験できる。

連打・二重イベントで意図せず結末へ進むのを抑えるため、分岐操作には0.35秒の受付間隔を設けています。PCのクリック、スマートフォンのタップ、Tabで操作対象に移動してEnter／Spaceに対応。籠・弟の透明なHTMLボタンは常時44px以上のタップ領域を保ち、フォーカス枠を表示します。

神そのものは描きません。弟への身体接触、血、傷、残酷な表現は描きません。兄のわずかな移動、暗転、弟と羊の象徴の消失で出来事を示します。結末では中央に説明を重ねず、兄は最初の約10秒、籠と空白を交互に見つめ、その後は籠の前にとどまります。

Choose Offer, then touch Cain’s basket or Abel. Four actions toward the basket lead to the imagined alternative; the third action toward Abel leads to darkness and his disappearance. Before that third action, you can still turn back to the basket. Start over lets you experience both endings. Keyboard input is supported through native buttons. There is no blood or explicit bodily contact, and no central moralizing message.

## 共通デザイン / Shared design

`../shared/marpan-25d.js` を変更せず直接参照。兄弟は同じ `bodyWidth:195` / `bodyHeight:132.6`、同じ身体色、同じ三つ目の形状と配置、口なし。区別は位置と捧げ物で行います。

怒り顔は共通描画の `expression:'angry'`、怯えは既存の `worried`。LIFESketch「怒りの炎」No.011と「怒りの伝染」No.013の表現を参照し、後者の通常の目から怒りの目へのクロスフェードと同じ方法を使用。共通ファイル自体や他シリーズには変更していません。

参照元：`sawanoto/LifeSketch` コミット `288484822d26f5ebfcb34e0636ab906082df60b1`。

- https://github.com/sawanoto/LifeSketch/tree/288484822d26f5ebfcb34e0636ab906082df60b1/011_anger-flame
- https://github.com/sawanoto/LifeSketch/tree/288484822d26f5ebfcb34e0636ab906082df60b1/013_anger-contagion

Both brothers use the same unmodified shared renderer. Anger and unease use its existing expressions; no new face, mouth, or eye arrangement is drawn.

## 音 / Sound

初回の「捧げる」または音ボタンでAudioContextを開始。差し出す音は柔らかく、弟の捧げ物には澄んだ高音。兄の捧げ物が顧みられないことには音を付けません。怒りは近い低周波のうなり、攻撃は0.25秒程度の短い重い音。どの音も有限の包絡を持ち、常時鳴るドローンや自動環境音はありません。

弟の消失後には全ての音源を停止し、その後は音をONに戻しても音を再開しません。タブ非表示・リセットでも音源と予約済みの初回再生を停止。音声開始に失敗しても体験は続けられます。システムの「動きを減らす」設定では身体の震えや粒子などの継続的な動きを抑えます。

Sound begins with a user gesture. Cain’s unregarded offering receives no sound. Every tone is finite; after Abel disappears, all sources are stopped and silence continues even when unmuted. Reset and hiding the tab also stop the sources. Audio failure never blocks the narrative.

## PNG / Kindle用素材

「場面の記録・作品について / Save a scene & about this work」から、体験した6場面を個別に出力します。

| 場面 | ファイル名の末尾 |
| --- | --- |
| 兄と弟の捧げ物 | `offerings` |
| 弟の捧げ物だけが認められる | `regarded` |
| 兄が怒り始める | `anger` |
| 兄が弟を排除する暗転中 | `excluding` |
| 兄だけが残された結末 | `alone` |
| 兄が籠に向き合う別の結末 | `attending` |

各場面へ到達した際の状態を記録し、静止画では読み取れる代表時刻で描画します。未体験の場面は選択不可。「はじめから」では記録を消さず、両方の結末を揃えられます。記録はsessionStorageに保持し、同じタブの再読み込みにも対応します。タブを閉じると失われ、端末間同期はありません。保存領域が使えない場合は、そのページを開いている間のみ記録を保持します。物語そのものは再読み込みで冒頭から始まります。

出力は2560×1600または3840×2400 PNG。HTMLで配置した操作ボタン・名前・ガイドを含まず、絵のみを出力。描画中だけCanvasを拡大し、直ちに通常サイズへ戻します。ストーリーの分岐・段階・操作回数と音声は変えません。端末によって生成時に一時的な処理負荷がかかるため、低メモリ機では2560を選んでください。プレビューからダウンロード・画像長押し保存・対応環境でファイル共有が可能です。Kindle最終組版・KDP入稿は別途必要です。

Export the six reached scenes at either resolution. Reached scenes remain available across Start over and reloads within the same tab. They are not synced between devices. PNGs contain artwork only; exporting does not change the narrative branch or restart audio. Use the lower resolution on devices with limited memory. Actual phone sharing and saving menus vary.

## 構成・検証・公開 / Files, validation, publishing

- `story.js`：描画・音・書き出しと独立した物語の状態遷移。
- `sketch.js`：描画、DOM操作、6場面記録・PNG共有。
- `sound.js`：有限の合成音と停止処理。
- `style.css`：本作品に限定したレスポンシブUI。
- `about.html`：日英の解説。
- `cover.png`：作品Canvasから生成したシリーズ用サムネイル。
- `../tests/cain-abel.cjs`：両分岐・再方向付け・音源停止・全PNG・リセット等のブラウザテスト。
- `../docs/002-verification.md`：動作確認と制約。

開発テストはPlaywright・Chromiumを用意し、HTTPサーバーを起動した上で `npm run test:cain-abel`。No.1の回帰確認は `npm test`。

公開は作業ブランチからPRを作成し、確認後に `main` へマージ。既存のGitHub Pages（main / root）で自動公開されます。想定URL：`https://sawanoto.github.io/BibleSketch/002-cain-and-abel/`。PRの段階では本番に未反映です。

After review, merge the work’s PR into `main`; the existing GitHub Pages configuration publishes the new subdirectory automatically. The work is not live merely because the branch or PR exists.
