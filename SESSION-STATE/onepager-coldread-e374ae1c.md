# Carry: onepager-coldread

## Anchor
AXIOMS one-pager 投影：讀者冷讀一頁後接到中心模型（注意力有限／揮發／不可逆 → 同一個迴圈對著目標 → 整件交出去 + 同一份紀錄 + 小步看結果再決定 → 每層同形），能對自己的事起反思、能動。之後冷派 journey-simulation 三個 ICP 量。

## Read first
- `drafts/onepager-v7.html` — 最新版。用戶判定：**方向對了，文字錯了**（哪裡錯還沒說，開場先問）
- `drafts/onepager-v3.html` — 用戶認可的問題 framing 與注意力三特性寫法；v7 的文字底本
- `drafts/axioms-prose.zh.md` — 母文（用戶對它的異議仍未說，見 `SESSION-STATE/prose-carousel-461d6ce3.md`）
- `docs/walkthroughs/onepager-v4_20260924-1731/_prompts/personas.md` + `sandbox.md` — 已封好的 Layer-3 prompt；sandbox 仍描述 v4，要換成定稿版再派
- `.claude/skills/journey-simulation/SKILL.md` — Phase 5 funnel-trace 規格（已 serve，gitignored）

## State
- 本 session 走過：v5（暫名「有限逼近」、無比擬、純口語）→ 用戶：太抽象，俗話化反而丟了焦點；理論派說法不是問題，delivery 才是。v6（注意力＋三特性回來、每段標「因為哪個特性」、共用 sticky 圖）→ 用戶：一頁一概念，共用 infographic 把 attention 割裂。v7（v6 文字 + v3 單欄，每段自帶一張只講該概念的小圖）→ 方向對。
- 定案的形：單欄；一頁一概念一圖；page 1 問題「忙了一整天，目標卻還是好遠。」；page 2 理論 = 注意力 + 有限／揮發／不可逆；page 3 迴圈；之後每段「因為 X → 做法」；收尾問句「我現在的注意力，有放在它上面嗎？」。
- 理論頁必備要件（用戶給）：目標、有限、循環／行動／前進、達成目標。名稱不拘泥，先易懂，之後再改名；「有限逼近」「注意力守恆」「一道光」都被否決當名字；「有限行動者」是舊名。
- 比擬：討論過蓋房子（v4 失敗）／自助旅行／看病／登山，用戶決定**先不用比擬**。
- 用戶硬約束：台灣口語但術語留著（注意力、有限、揮發、不可逆）；不用「不是xx是yy」；不先給反面；不逐條列七公理；AI drift 只能當非主體例；給結果他雕。
- v5、v6 留在 `drafts/` 供對照（gitignored）。

## Next step
1. 開場問：v7 文字哪裡錯——是理論頁的命題句、「因為 X」段的說法、還是整體語感；拿到後改 v7 文字（圖與結構不動），存 v8。
2. 用戶過目 → `_prompts/sandbox.md` 段落描述換成定稿版 → 三個 persona 並行 dispatch `walkthrough-narrator` → 每人一份 funnel trace（不合併）→ 拿 cut-test 量。

## Watch-outs
- Gateway-private cut-test（不進 prompt）：C1 注意力有限、切換漏掉／C2 整件交出去、不進去看／C3 交出去三條件（整件、一種事、問題往哪送）／C4 同一份紀錄累積，沒紀錄=重做+補了又裂／C5 看紀錄+看現實再決定；試了才知道／C6 每層同形，最上面只留目標／C7 讀者換成自己的事、對收尾問句有反應。
- 用戶假設：形式是主因。sim 不可被 prime。不可 fallback 到 general-purpose。
- 預覽：`cd drafts && python -m http.server 8765 --bind 127.0.0.1`，Chrome 開 http://127.0.0.1:8765/onepager-v7.html（file:// 開不了）。
- 一頁投影若定名，名字要掛回 AXIOMS.md／母文同步，避免 parallel truth。
