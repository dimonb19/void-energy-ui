import tailwind from 'eslint-plugin-tailwindcss';

export default [
  ...tailwind.configs['flat/recommended'],
  {
    rules: {
      // 1. Enforce specific class order (readability)
      'tailwindcss/classnames-order': 'warn',

      // 2. The Enforcer: Fails if you use a class not in your config.
      // Since we wiped 'spacing' and 'colors', "p-4" or "text-red-500"
      // will now trigger this error.
      'tailwindcss/no-custom-classname': 'error',
    },
    settings: {
      tailwindcss: {
        // Points to your hardened config
        config: 'tailwind.config.mjs',
      },
    },
  },
];
