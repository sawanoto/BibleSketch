# BIBLE Sketch

聖書の物語を独自の解釈で体験するインタラクティブ作品シリーズ。No.001「天地創造」は創世記1章〜2章3節を題材に、同じ横構図の世界へ創造を積み重ねます。神の姿は描かず、体験者が創造を担います。

## リポジトリ

https://github.com/sawanoto/BibleSketch

作者が新設した `sawanoto/BibleSketch` 用の独立シリーズです。MovingSketch・LifeSketchなど既存シリーズは変更していません。従来の希望名 `bible-sketch` と異なり、GitHubのリポジトリ名・公開パスは `BibleSketch` を使用します。

## No.002 · カインとアベル / Cain and Abel

創世記4章1〜16節を題材に、怒りを弟へ向けるか、自分の捧げ物に向き合うかを操作する作品を追加しました。トップのNo.002カードから開けます。2つの結末と主要6場面の高解像度PNG出力に対応。

神が兄の捧げ物を受け入れなかった理由は原典に明記されていません。籠を整えて弟を攻撃しない分岐は作者独自の表現であり、改善が神の承認につながるとは表現しません。

An interactive interpretation of Genesis 4:1–16 with two endings and six high-resolution stills. The text does not state why Cain’s offering was not accepted. Tending the basket is an imagined alternative and never earns divine approval.

実行・操作・素材出典・原典との区別：[作品README](002-cain-and-abel/README.md)。ブラウザテスト：`npm run test:cain-abel`。検証記録：[No.002の確認結果](docs/002-verification.md)。No.1・共通マーパン描画は変更しません。

## No.003 · ノアの方舟 / Noah’s Ark

創世記6〜9章の「災害を生き延び、次の世界へ生命をつなぐ」構造を、隕石衝突に置き換えた作品です。隕石は一度だけ落とせ、森林・海・草原で生存する生命と再生後の姿が変わります。木造の船や現代人は登場しません。

洪水と隕石衝突を同一の歴史的出来事として扱いません。生存数は創作上の仮想シナリオで、科学的予測ではありません。再生する動物は生存者と同じ分類の子孫だけです。

A fictional reinterpretation of Genesis 6–9: surviving life itself becomes the ark. One impact, three distinct habitat scenarios, and renewal across many generations. This is not a historical or scientific claim connecting the Flood to an impact.

[作品README・操作・出典の区別](003-noahs-ark/README.md) ／ [確認結果](docs/003-verification.md)。開発テスト：`npm run test:noah`。主要6場面を高解像度PNGで出力できます。

## No.004 · バベルの塔 / Tower of Babel

創世記11章1〜9節の結末を逆転させた作品です。6〜8体の吹き出しを「左→下→右→上」と操作し、全員が上を向いた瞬間に協力して塔を完成させます。矢印は言語そのものではなく、建設方針や意思の象徴です。同じ言語を話すことと同じ目的を共有することを同一視しません。

A reversal of the ending in Genesis 11:1–9: different intentions become a shared building goal. Only unanimous upward arrows start the tower. The arrows symbolize intentions, not languages.

[操作・原典との区別・PNG保存](004-tower-of-babel/README.md) ／ [検証結果](docs/004-verification.md)。開発テスト：`npm run test:babel`。日英併記、共通マーパン、6場面の高解像度PNGに対応。

## 実行

ビルド・npmインストール不要。Python 3を使用する例：

```sh
cd BibleSketch
python3 -m http.server 8000
```

`http://localhost:8000/` を開きます。p5.jsはローカル同梱、音はWeb Audioによる合成です。通信不要で動作します。ファイル直開きよりHTTP配信を推奨します。

## 体験

1. 暗闇をタップし光を生む。
2. 水を上下に画面高さの約1/4以上ドラッグし空を開く。
3. 左右に画面幅の約1/4以上ドラッグし陸を作り、陸を3回以上タップし植物を育てる。
4. 太陽・月をそれぞれドラッグし空に配置、右半分の夜空を3回以上タップ。
5. 右下の海で魚2匹以上、上部の空で鳥2羽以上を生む。
6. 陸で動物3匹以上を生み「マーパンを迎える」。
7. 「次の日へ」で休息。新しいものは作れず、世界の動きと音が続く。

達成後もその日の範囲で追加可能。「次の日へ」は達成前には押せません。上限：植物70、星90、魚28、鳥24、動物18。CanvasをフォーカスしてEnter/Spaceでも創造可能（ドラッグ工程は代替操作で成立）。座標は正規化して保持します。

初回タップ／ドラッグ／音ボタンで音声を開始します。右上で消音可能。音量を抑えた合成音・フィルタノイズを日ごとに追加し、鳥・動物の音も抽象的な音色で表現します。実録の鳴き声ではありません。非表示タブでは音声を停止。音声非対応時は無音で続行できます。

進行と各日の完成記録はlocalStorageへ自動保存。端末間同期はなく、プライベートモード・ストレージ消去時は失われます。「はじめから」は確認後に現在の世界と記録を消します。

## PNG / Kindle向け素材

「世界の記録・作品について」を開き、完成済みの第1〜7日を個別に選択します。2560×1600 / 3840×2400のPNGを出力します。操作UIはHTMLに分離しており画像には含まれません。完成した日の最後の状態を保存し、過去の日を後の生物で上書きしません。植物の成長が完了した状態で描画します。

プレビューからダウンロード、対応端末のファイル共有、画像の長押し保存が可能です。書き出し専用の1回の描画後、即座に通常サイズへ戻します。高解像度生成時は一時的に処理負荷が上がります。端末メモリが少ない場合は2560を選択してください。日数や本文は画像に入れず、絵本編集時に組版できます。Kindleの最終入稿形式・余白・色校正は別途必要です。

## GitHub Pages公開

1. リポジトリ https://github.com/sawanoto/BibleSketch の Settings → Pages を開きます。
2. Build and deployment → Sourceを「Deploy from a branch」→ `main` / `/(root)` → Save。
3. GitHubが表示する公開URLで確認します。想定URLは `https://sawanoto.github.io/BibleSketch/`。Pagesの有効化・デプロイ成功前はこのURLで閲覧できません。
4. 反映後、PCと実機スマートフォンで音・保存まで確認してください。

GitHub側でプラン・組織ポリシーなどの制限があれば対応が必要です。静的配信のみで動作し、サーバーやAPIキーは不要です。

更新作業は、GitHub認証できる端末でリポジトリをcloneして行えます。

```sh
git clone https://github.com/sawanoto/BibleSketch.git
cd BibleSketch
python3 -m http.server 8000
```

## 構成・次の作品

- `index.html`：シリーズのトップページ
- `001-creation/`：天地創造のHTML・描画・音
- `shared/style.css`：シリーズの共通スタイル
- `shared/marpan-25d.js`：共通マーパン描画（出典は下記）
- `vendor/p5.min.js`：p5.js 1.9.4
- `docs/`：解説・検証記録
- `tests/`：ブラウザの主要な体験テスト

次作は `002-作品名/` の独立フォルダに `index.html`・JS・必要なCSSを作成し、トップページの `.work` カードを追加します。既存作品のURLは変更しません。共通素材はルート相対ではなく `../shared/` の相対参照を使用します。新作ごとに聖書の対象箇所と独自演出の区別を解説してください。

## 原典と独自演出

原典由来：光と闇、水の分離、陸と植物、天体、魚と鳥、陸の動物と人間、第7日の休息という順序。本文の翻訳は転載していません。

独自演出：タップ・ドラッグ、最低生成数と上限、自由配置、成長・遊泳・飛行、左右に共存する昼と夜、短い天体周期、色・山・花・動物の形、段階的な音、マーパンによる人間の象徴、PNG保存。科学的な宇宙形成の解説や特定宗派の解釈を提示する作品ではありません。

## マーパン・依存素材

マーパンは `sawanoto/LifeSketch` の `shared/marpan-25d.js`、コミット `f100f67ea05a6ad7230d96fbd14623e3f09a970f` を変更せずに本シリーズの共有ディレクトリへ取り込みました。三つ目の形・配置・口のない描画を新規に描き直していません。参照元：https://github.com/sawanoto/LifeSketch/blob/f100f67ea05a6ad7230d96fbd14623e3f09a970f/shared/marpan-25d.js

p5.js 1.9.4は同リポジトリ同梱版から取得。LGPL-2.1（`vendor/p5-LICENSE.txt`）。本作品・キャラクターの公開利用・出版の権利は作者に帰属し、第三者への自由利用許諾は付与していません。

## 検証

`docs/verification.md` を参照。開発用テストは `npm ci` とChromiumを用意し、HTTPサーバー起動後 `CHROMIUM_PATH=/usr/bin/chromium npm test` を実行します。npm依存は通常配信に不要です。実機iOS/Androidの音声出力と保存先UIは自動テストでは保証できません。

## 日本語・英語 / Japanese and English

トップ、操作案内、各日の名称、保存・共有、確認・エラー表示、作品解説は日本語と英語の併記です。言語切替は不要です。保存済みの世界を引き継げます。英語の文言はHTML、動的な案内は `001-creation/sketch.js`、音声エラーは `sound.js` で管理します。

The gallery, all seven days, interaction hints, controls, export and sharing dialogs, confirmation and error messages, and artist’s notes display Japanese and English together. No language switch is needed. Existing saved worlds remain compatible.

### Quick start

Serve the repository root with `python3 -m http.server 8000`, then open `http://localhost:8000/`. No build step or runtime package installation is required. p5.js is bundled locally; the soundscape uses Web Audio.

1. Tap the darkness to create light.
2. Drag the waters vertically to reveal the sky.
3. Drag horizontally to reveal land, then tap the land to grow at least three plants.
4. Drag both the sun and moon into the sky; tap the night sky on the right to add at least three stars.
5. Tap the sea for at least two fish and the sky for at least two birds.
6. Tap the land for at least three animals, then choose **Welcome Marpan**.
7. Choose **Next day** to rest and watch the completed world. No new creations are added on day seven.

The first interaction enables sound. Use the sound button to mute it. With the world focused, Enter or Space provides a keyboard alternative. Your world and each completed day are saved in this browser; clearing browser storage deletes them.

Open **Save your world & about this work** to export any completed day as a 2560×1600 or 3840×2400 PNG without controls. On phones, save the image from the preview or use supported file sharing. Actual device menus vary.

The creation sequence follows Genesis 1:1–2:3. Interactions, freedom of placement and number, completion thresholds, animation, coexisting day and night, short celestial cycles, sound, and Marpan as a symbol of humankind are artistic additions. God is not depicted, and no translated Bible text is quoted. This is an independent artistic interpretation, not religious instruction.

For GitHub Pages, select **Settings → Pages → Deploy from a branch → main → /(root)**. The site URL is https://sawanoto.github.io/BibleSketch/ . To add another work, create its own numbered folder (for example `002-title/`) and add a card to `index.html`. Keep existing work URLs stable.


## No.005 イサクの燔祭 / The Binding of Isaac

`005-binding-of-isaac/` — 創世記22:1–19。二つの選択と不公平な結果を体験する作者独自の寓意。拒否した親が倒れる結末は原典にはありません。日英解説・操作・9場面のPNGは [作品README](005-binding-of-isaac/README.md) を参照。 / A parable of choice and unequal outcomes; the refusal branch is invented, not biblical. See the work README for bilingual notes, controls and nine PNG exports.
