# Carry: onepager-coldread

## Anchor
AXIOMS one-pager 投影：讀者冷讀一頁後接到中心模型（注意力稀缺 → 漂的機制 → 巢狀整件交出去 + 同一份紀錄 + 看現實再決定，讓光留在目標上），能對自己的事起反思、能動。之後冷派 journey-simulation 三個 ICP 量。

## Read first
- `drafts/axioms-prose.zh.md` — 母文（母；用戶對它的異議仍未說，見 `SESSION-STATE/prose-carousel-461d6ce3.md`）
- `drafts/onepager-v4.html` — 最新失敗版：鏈對、載體錯（蓋房子類比吃掉主題，讀起來像教蓋房子）
- `docs/walkthroughs/onepager-v4_20260924-1731/_prompts/personas.md` + `sandbox.md` — 已封好的 Layer-3 prompt；sandbox 要換成 v5 內容再派
- `.claude/skills/journey-simulation/SKILL.md` — Phase 5 funnel-trace 規格（已 serve，gitignored）

## State
- v1 法條轉錄／v2 委派技巧+要點才懂／v3 有道理的廢話／v4 類比成主角 — 同一病：載體吃掉主題。
- v5 方向（用戶未確認，session 尾聲提出）：主題 = 讀者自己的目標，第二人稱現在式，不借世界；模型寫成「漂的機制 → 止漂的結構」；用詞不命名迴圈/正本，直接寫動作（做一點、看一下、再決定／同一份紀錄／整件交出去）；圖 = 一道光 + 目標點，三態：光分散目標滑掉 → 光只照目標、旁邊方塊各有小光、結果流回一份紀錄 → 放大方塊同畫面。
- 用戶硬約束：台灣口語；不用「不是xx是yy」；不先給反面；不逐條列七公理；AI drift 只能當非主體例；不要 micromanage——給結果，他雕結果。
- 用戶給的鏈（v4/v5 骨架）：目標 → 怎麼達到 → ground 有限、未知 → 怎麼專注、分配、delegate offload → SoC/atomic/routing → 怎麼累積（揮發、bandaid）→ 整套巢狀 loop steady grounded 朝目標，with probe。
- `walkthrough-narrator` agent 已熱載入可用（本 session 尾聲確認）。

## Next step
1. 寫 v5（`drafts/onepager-v5.html`）照上面方向；本機預覽用 `python -m http.server` 開（Chrome 開不了 file://）。
2. 用戶過目 v5 → 把 `_prompts/sandbox.md` 的段落描述換成 v5 → 三個 persona 並行 dispatch `walkthrough-narrator` → 每人一份 funnel trace（不合併）→ 拿 cut-test 量。

## Watch-outs
- Gateway-private cut-test（不進 prompt）：C1 注意力有限、切換漏掉／C2 整件交出去、不進去看／C3 交出去三條件（整件、一種事、問題往哪送）／C4 同一份紀錄累積，沒紀錄=重做+補了又裂／C5 看紀錄+看現實再決定；試了才知道／C6 每層同形，最上面只留目標／C7 讀者換成自己的事、對收尾問句有反應。
- 用戶假設：形式是主因。sim 不可被 prime。不可 fallback 到 general-purpose。
- 本機 http.server 8765 背景任務可能還活著。
