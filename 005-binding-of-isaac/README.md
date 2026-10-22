# No.005 イサクの燔祭 / The Binding of Isaac

原典：旧約聖書・創世記22章1〜19節 / Genesis 22:1–19.

「神の命令に従って子供を捧げようとすることと、神の命令に背いて子供を守ろうとすること。どちらも親にとって正しいと信じられる選択である。それなのに、結果は不公平に分かれる。そもそも、この二択を迫ること自体が理不尽ではないか。」

“Obeying the command to offer a child, or refusing it to protect that child: the parent can believe either choice to be right. Yet the outcomes are unequal. Is demanding this choice itself unjust?”

原典ではアブラハムが命令に従おうとしたところ、神の使いに制止され、イサクは助かります。原典に、命令を拒否したアブラハムが殺される展開は存在しません。「いいえ」で親が倒れるのは作者独自の架空の分岐であり、拒否に対する罰を象徴しています。聖書の出来事や神の性質についての主張ではありません。

In the biblical text, Abraham attempts to obey and is stopped by an angel; Isaac survives. There is no episode in which Abraham refuses and is killed. The parent falling after “No” is an invented branch symbolizing punishment for refusal, not a claim about biblical events or the nature of God.

本作は信仰への服従を推奨するものでも、信仰自体を否定するものでもありません。選択と権力の関係を考えるための寓意です。原典の祭壇、雄羊などは省略し、二人と剣に絞っています。剣と立ち姿、ポップアップは作品上の演出です。

This is neither an endorsement of religious obedience nor a rejection of faith. It is a parable about choice and power. The altar and ram are omitted to focus on two figures and a sword; the sword, standing poses and dialog are artistic staging.

## 操作 / Controls

親・子どちらをタップ／クリックしても同じ問いが開きます。キーボードではTabで人物を選び、Enter、続いて選択肢を選べます。Escで選択を閉じられます。はい／いいえは同じ色・大きさで、正誤評価はありません。約6.5秒で結末へ自動進行し、操作をロックします。終了後にリセットできます。

Tap/click either figure for the same question. Use Tab and Enter with a keyboard; Escape dismisses the dialog. Both choices have equal styling and no judgment. The ending unfolds over about 6.5 seconds with input locked. Reset afterward to try the other branch.

音は初回操作から開始。結末では全音源を停止します。消音・音声API非対応でも体験できます。タブ非表示とPNGプレビュー中は進行を止めます。OSの動きを減らす設定では呼吸の揺れを省略します。

Audio starts with interaction; all sources stop at the ending. Mute and audio API failure do not block the story. Hidden tabs and PNG previews pause time. Reduced motion disables idle breathing.

## PNG / Kindle

「場面の記録」から体験済みの9場面を2560×1600または3840×2400で保存できます。人物だけの画像は命令文なし。選択場面のみ問いと同等のはい／いいえボタンを描き、通常の操作ボタンは入りません。両分岐の記録はリセット後もこのページを開いている間残ります。ページ再読込で消えます。記録はブラウザ内で再描画し、サーバーへ送信しません。

Export nine reached scenes at 2560×1600 or 3840×2400. The first omits the command; only the choice scene includes the question and equal Yes/No buttons. Other UI is excluded. Both branches remain recorded across resets during this page session, but not after reload. Rendering is local; nothing is uploaded.

スマートフォンは画像長押し、PNG保存、対応機種では共有を使用できます。Kindleの最終組版・入稿は別途必要です。

Use touch-and-hold, the download link, or supported file sharing on phones. Final Kindle layout and submission are separate.

## 開発と公開 / Development & publication

ルートで `python3 -m http.server 8000`、`http://localhost:8000/005-binding-of-isaac/` を開く。ビルド不要、p5.jsは同梱。`npm install` 後 `npm run test:isaac`（Chromium: `/usr/bin/chromium`）。GitHub Pagesは既存のmain / root設定で、変更をmainへマージすると公開されます。

Serve the repository root with `python3 -m http.server 8000`. No build required; p5.js is vendored. After `npm install`, run `npm run test:isaac` with Chromium at `/usr/bin/chromium`. Merge into main to publish through the existing GitHub Pages main/root configuration.
