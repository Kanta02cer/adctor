# AIクローラー検知システム要件

企業に提示するには、単なるbotアクセス数ではなく、以下を見せる必要があります。

- どのAI企業・crawlerが来ているか
- どのhost/path/patternが狙われているか
- verifiedか未検証か
- HTTP 200/402/403/5xxの内訳
- robots/llms方針との整合
- bytes transferred
- referrer経由のAI送客
- allow/block/pay_or_block/manual_reviewの次アクション

デモでは `AIクローラー検知` 画面に、operator別リスク、path pattern別分析、crawler event detail、policy auditを追加しています。
