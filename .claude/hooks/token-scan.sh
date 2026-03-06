#!/bin/bash
# PostToolUse hook: run token scan after SCSS/Svelte edits
# Informational only — always exits 0

INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | node -e "
  let d=''; process.stdin.on('data',c=>d+=c); process.stdin.on('end',()=>{
    try { const j=JSON.parse(d); console.log(j.tool_input?.file_path||''); }
    catch(e) { console.log(''); }
  });
")

if [ -z "$FILE_PATH" ]; then
  exit 0
fi

# Only scan SCSS and Svelte files
case "$FILE_PATH" in
  *.scss|*.svelte)
    SCAN_OUTPUT=$(npm run scan 2>&1)
    SCAN_EXIT=$?
    if [ $SCAN_EXIT -ne 0 ]; then
      echo "Advisory token scan found raw-value hits:"
      echo "$SCAN_OUTPUT"
    fi
    ;;
esac

exit 0
