#!/bin/bash
# 建立並套用心宇宙商務中心 LINE OA 圖文選單（場地預約 / 課程報名）。
# 用法：bash scripts/create-rich-menu.sh
# 需要 .env.local 裡的 LINE_CHANNEL_ACCESS_TOKEN 有效。
set -euo pipefail
cd "$(dirname "$0")/.."

set -a; source .env.local; set +a
if [ -z "${LINE_CHANNEL_ACCESS_TOKEN:-}" ]; then
  echo "LINE_CHANNEL_ACCESS_TOKEN 未設定" >&2
  exit 1
fi

IMAGE_PATH="public/richmenu.png"
if [ ! -f "$IMAGE_PATH" ]; then
  echo "找不到 $IMAGE_PATH" >&2
  exit 1
fi

echo "建立 rich menu 物件…"
CREATE_RES=$(curl -s -X POST https://api.line.me/v2/bot/richmenu \
  -H "Authorization: Bearer $LINE_CHANNEL_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "size": { "width": 2500, "height": 1686 },
    "selected": true,
    "name": "心宇宙主選單",
    "chatBarText": "選單",
    "areas": [
      {
        "bounds": { "x": 0, "y": 0, "width": 1250, "height": 1686 },
        "action": { "type": "message", "label": "場地預約", "text": "預約" }
      },
      {
        "bounds": { "x": 1250, "y": 0, "width": 1250, "height": 1686 },
        "action": { "type": "message", "label": "課程報名", "text": "課程" }
      }
    ]
  }')

RICH_MENU_ID=$(echo "$CREATE_RES" | jq -r '.richMenuId // empty')
if [ -z "$RICH_MENU_ID" ]; then
  echo "建立失敗：$CREATE_RES" >&2
  exit 1
fi
echo "richMenuId = $RICH_MENU_ID"

echo "上傳圖片…"
UPLOAD_RES=$(curl -s -w '\n%{http_code}' -X POST "https://api-data.line.me/v2/bot/richmenu/$RICH_MENU_ID/content" \
  -H "Authorization: Bearer $LINE_CHANNEL_ACCESS_TOKEN" \
  -H "Content-Type: image/png" \
  --data-binary "@$IMAGE_PATH")
UPLOAD_STATUS=$(echo "$UPLOAD_RES" | tail -1)
if [ "$UPLOAD_STATUS" != "200" ]; then
  echo "圖片上傳失敗（HTTP $UPLOAD_STATUS）：$(echo "$UPLOAD_RES" | head -1)" >&2
  exit 1
fi

echo "設為全員預設選單…"
# --data "" 是必要的：Akamai edge 對沒有 Content-Length 的空 body POST 會回 411。
SET_DEFAULT_RES=$(curl -s -w '\n%{http_code}' -X POST "https://api.line.me/v2/bot/user/all/richmenu/$RICH_MENU_ID" \
  -H "Authorization: Bearer $LINE_CHANNEL_ACCESS_TOKEN" --data "")
SET_DEFAULT_STATUS=$(echo "$SET_DEFAULT_RES" | tail -1)
if [ "$SET_DEFAULT_STATUS" != "200" ]; then
  echo "設定預設選單失敗（HTTP $SET_DEFAULT_STATUS）：$(echo "$SET_DEFAULT_RES" | head -1)" >&2
  exit 1
fi

echo "完成！richMenuId = $RICH_MENU_ID"
