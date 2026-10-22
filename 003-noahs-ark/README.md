# BIBLE Sketch No.003 · ノアの方舟 / Noah’s Ark

原典：旧約聖書・創世記6〜9章 / Source: Genesis 6–9.

**作者の解釈：世界が大災害によって失われても、一部の生命が生き残り、次の世界へ生命をつないでいく。生き残った生命そのものを方舟として捉える。**

**The artist’s interpretation: Even when catastrophe destroys a world, some lives endure and carry life into the next. The survivors themselves become the ark.**

## 原典との区別 / Source and fiction

洪水を隕石衝突に置き換えた創作です。隕石衝突がノアの洪水の歴史的原因だった、あるいは両者が同じ歴史的出来事だったと主張する作品ではありません。ノアや家族、木造の船、原典の全場面は描きません。聖書の翻訳本文は引用していません。

生存数・分類・隠れ場所の効果・植物の減少・再生の時間圧縮は作品上の仮想シナリオであり、実際の隕石衝突や大量絶滅の生存結果を科学的に予測するものではありません。実際の大量絶滅を踏まえ、非鳥類型恐竜は全ての落下点で絶滅し、一部の鳥類・小型哺乳類・爬虫類・昆虫・魚・貝類・甲殻類が生き残る構成です。生物は分類を示す図案で、個々の種や特定の年代の生態系を厳密に再現しません。

This work is a fictional reinterpretation, not a claim that an asteroid caused the Flood or that the two were one historical event. Outcomes and time compression are artistic scenarios, not scientific predictions. Non-avian dinosaurs always disappear. Other creatures are simplified category symbols rather than exact reconstructions of species or a dated ecosystem. No Bible translation is quoted.

## 実行 / Run

リポジトリルートをHTTP配信します。ビルド・追加の実行時依存は不要です。

```sh
python3 -m http.server 8000
```

`http://localhost:8000/003-noahs-ark/` を開くか、トップのNo.003カードから移動します。p5.js・共通マーパン描画はローカル同梱。音はWeb Audio APIの合成で外部取得しません。

## 操作 / Interaction

- 上空の隕石を左右にドラッグし、森林・海・草原の好きな位置で手を離します。落下点の縦線・照準・環境名を表示します。同じ環境の中でも連続的な位置を選べます。隕石は上空を保ち、縦の照準で落下点を示します。
- 一度離して落下を確定すると操作不能になり、衝突 → 暗い時期 → 小さな生存者 → 幾世代もの時間 → 再生後の世界まで自動進行します。追加の「次へ」はありません。
- 単なるクリック、画面外での解放、pointercancelは落下を確定しません。
- キーボードでは隕石にTabで移動し、左右矢印で位置を選び、Enter / Spaceで落とします。キーの押しっぱなしによる再落下も起こりません。
- 「はじめから」は落下前へ戻り、今回の場面記録も初期化します。違う地点を比較できます。
- 音ボタンでON/OFF。最初の隕石操作か音ボタンから音声を有効化します。
- 「光と揺れを抑える」はOSの動きを減らす設定を初期値に使い、手動変更も可能です。閃光を弱め、画面の揺れ・継続的な動きを抑えます。

Drag and release the meteor once to choose an impact site. A prediction line and habitat name appear while choosing. The rest unfolds automatically; no additional action is needed to reach the renewed world. Clicks without a drag, canceled input, and release outside the scene do not drop it. Arrow keys plus Enter/Space provide a keyboard alternative. Start over clears the current run and allows another impact site.

## 生存の設計 / Survival design

乱数だけで結果を決めません。落下した環境ごとに分類・環境別の生存枠を設け、その枠内で距離と避難場所の保護度に基づいて個体を選びます。近い場所ほど不利ですが、地中・海底・岩陰といった生息場所に保護効果があり、身体の大きさだけでは決まりません。海への衝突では沿岸の候補にも不利な補正を与えます。近い個体ほど早く直接被害を受け、離れた非鳥類型恐竜も、粉塵・日照不足・食物の減少を表す暗い時期までに消えます。

| 落下先 | 森林の生存数 | 海の生存数 | 草原の生存数 | 合計 | 子孫を含む再生後 |
| --- | ---: | ---: | ---: | ---: | ---: |
| 森林 | 3 | 13 | 11 | 27 | 68 |
| 海 | 7 | 4 | 8 | 19 | 50 |
| 草原 | 9 | 14 | 3 | 26 | 65 |

初期の生命は52個体。表は作品内の仮想個体数で、実際の種数・歴史上の個体数ではありません。分類別の内訳は `world.js` の `ARK_SCENARIOS` と画面の「生命の記録」で確認できます。

- 森林への衝突：森林の大型生物と植物が大きく失われ、深い水や離れた草原に生命が残る。
- 海への衝突：海中の生存数が減り、大波が沿岸へ広がる。巣穴・岩陰の小型陸上生物が中心になる。
- 草原への衝突：草原の大型生物・植生が失われ、森林と海底の生命が多く残る。

同じ地点なら同じ結果になります。同じ環境でも落下点が変わると、距離の順位により選ばれる個体が変わる場合があります。全ての恐竜を絶滅させるルールは、落下点から遠い個体にも適用します。

During renewal, only descendants of actual survivors appear. Each descendant carries a surviving parent ID and the same category and habitat as its parent; extinct kinds never reappear. A hard population cap of 128 prevents unlimited growth. The current scenarios end with 68, 50, or 65 individuals. Counts are fictional, not historical abundance or species counts.

## 時間と再生 / Time and renewal

画面上の時間は象徴的です。落下1.3秒、衝突2.6秒、静かな暗期3.2秒、生存者4.5秒、幾世代もの再生8.5秒。その後は制限なく眺められます。地球史の時間を実秒に対応づけるものではありません。

「幾世代もの時」と明記した段階で、同じ分類の子孫が段階的に増えます。短期間で新しい種類が生まれる演出はありません。草木や水草は、残った植物・種子・地下部からの成長を象徴します。再生後の約3.2秒だけ生命を包む二本の柔らかな曲線が浮かび、方舟の象徴となります。船体・甲板・帆・乗船者は描きません。

The sequence compresses a long, unspecified passage of time. The renewal stage explicitly says that many generations pass. Plants symbolize regrowth from surviving plants, seeds, and underground parts. The ark is only a brief outline embracing the living world, never a literal ship.

## マーパンのモチーフ / Marpan motif

`../shared/marpan-25d.js` を変更せず参照し、隕石上の図案に `Marpan25D.drawEyes` を使用します。既存と同じ三つ目の形状・配置です。人間に相当するマーパンの身体は登場させません。この図案はシリーズの印であり、恐竜と現代人が同時代にいたという表現ではありません。

## 音 / Sound

衝突前は小さな風と水のフィルタノイズ、間隔を空けた鳥の合成音。落下時の低音、衝突の短い重い音、広がる風・粉塵の音を有限の包絡で鳴らします。暗期では全音源を止め、解析波形でも無音になるようにします。生存者段階は間隔を空けた非常に小さな音だけ。再生段階から風と水が徐々に戻り、鳥の合成音も戻ります。

音量はマスターゲインとコンプレッサーで抑えます。各個体ごとに鳴らさず、2つの環境音層と間隔を設けた小数の声に制限。消音・タブ非表示では音源を止め、非表示中は物語も進めません。表示復帰で衝突音を再演しません。音声APIが使えなくても進行可能です。

Audio uses synthesized wind, water, calls, and bounded impact sounds. The dark interval stops every source. Small sounds precede the gradual return of ambience. Muting and hiding the page stop the sources; returning does not replay an impact sound. Audio failure does not block the artwork. Real speakers and phone sound levels still need device testing.

## PNG / Kindle向け素材

今回のプレイで到達した6場面を個別に保存します。

1. 衝突前の世界 / `before`
2. 落下する瞬間 / `falling`
3. 衝突と衝撃波 / `impact`
4. 多くの生命が失われた世界 / `winter`
5. 生き残った小さな生命 / `survivors`
6. 再生後の世界 / `world`

2560×1600 / 3840×2400 PNG。操作ボタン、環境名、照準、案内・表はHTMLに分離し、画像には含めません。各段階で代表時刻を記録して描画するため、落下や衝撃波の短い瞬間も後から保存できます。サンプル6場面も検証資料に同梱します。

描画の一回だけCanvasを拡大し、直ちに通常寸法と描画密度へ戻します。書き出しで落下点や生存結果は変わりません。プレビューを開いている間は物語と音を止め、閉じると続きから再開。画像のダウンロード・長押し保存・対応OSでのファイル共有が可能です。

記録はメモリ内だけです。リセット・再読み込みで消え、端末間同期はありません。高解像度出力は一時的に処理負荷が増えるため、低メモリ端末では2560を選んでください。Kindle用の最終組版・色校正・KDP入稿は別途必要です。

Reached scenes can be exported individually without HTML controls or guides. Exporting does not change the impact or survivors. The image preview pauses the sequence and audio until closed. Records belong to this play and clear on reset or reload. For limited-memory devices, use the lower resolution. Kindle layout, color checks, and submission remain separate work.

## 構成・検証 / Structure and testing

- `world.js`：初期の52個体、生存枠、距離と避難場所の順位、子孫、1回だけの落下、時間進行。
- `sketch.js`：描画・ドラッグとキーボード・記録表・静止画共有。
- `sound.js`：合成音・環境音・無音区間・停止。
- `style.css` / `index.html` / `about.html`：日英の画面・解説。
- `cover.png`：作品のCanvasから生成したトップ用画像。
- `../tests/noah-model.cjs` / `../tests/noah.cjs`：3シナリオ、子孫の系譜、入力、無音、PNG等。
- `../docs/003-verification.md`：結果と制約。

HTTPサーバーを起動し、PlaywrightとChromiumのある開発環境で `npm run test:noah`。従来作品の回帰は `npm test` と `npm run test:cain-abel`。

## 公開 / Publishing

実際の既存リポジトリ名は `sawanoto/BibleSketch` です。新しいリポジトリは作成しません。No.1・No.2・共通素材は変更せず、新しいフォルダとトップのカードを追加します。

No.2のPRがまだ未マージのため、No.3はNo.2の完成ブランチ上に積んだPRとして作成します。No.2をmainへマージした後、No.3のPRのbaseをmainに変更してからマージしてください（GitHubが自動変更した場合はその内容を確認）。以後は既存のPages設定（main / root）で自動配信されます。

想定URL：`https://sawanoto.github.io/BibleSketch/003-noahs-ark/`。PR段階では本番には未反映です。
