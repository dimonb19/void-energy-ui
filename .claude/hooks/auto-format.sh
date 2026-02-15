#!/bin/bash
# PostToolUse hook: auto-format files after Edit/Write
# Reads tool_input.file_path from JSON stdin, runs prettier on it

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

# Only format files prettier knows about
case "$FILE_PATH" in
  *.svelte|*.ts|*.tsx|*.js|*.jsx|*.json|*.scss|*.css|*.md|*.html|*.astro)
    npx prettier --write "$FILE_PATH" 2>/dev/null
    ;;
esac

exit 0