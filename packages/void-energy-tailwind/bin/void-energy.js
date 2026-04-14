#!/usr/bin/env node
/**
 * @void-energy/tailwind — bin entry.
 *
 * Maps the `void-energy` CLI command to dist/cli.js. The package ships
 * "type": "module", so this file runs as ESM and imports the ESM CLI entry.
 */

import { main } from '../dist/cli.js';

main(process.argv).then(
  (code) => process.exit(code),
  (err) => {
    console.error(
      '[void-energy] unexpected error:',
      err && err.stack ? err.stack : err,
    );
    process.exit(2);
  },
);
