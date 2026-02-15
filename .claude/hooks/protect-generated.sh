#!/bin/bash
# PreToolUse hook: block edits to generated files
# Exit 2 = block the tool execution

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

# Block edits to generated files
case "$FILE_PATH" in
  *_generated-themes.scss|*void-registry.json|*void-physics.json)
    echo "BLOCKED: This is a generated file. Edit src/config/design-tokens.ts instead, then run npm run build:tokens." >&2
    exit 2
    ;;
esac

exit 0