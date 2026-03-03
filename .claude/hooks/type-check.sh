#!/bin/bash
# PostToolUse hook: run svelte-check after TS/Svelte edits
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

# Only check TypeScript and Svelte files
case "$FILE_PATH" in
  *.ts|*.svelte)
    CHECK_OUTPUT=$(npm run check 2>&1)
    CHECK_EXIT=$?
    if [ $CHECK_EXIT -ne 0 ]; then
      echo "TypeScript check found errors:"
      echo "$CHECK_OUTPUT" | tail -30
    fi
    ;;
esac

exit 0