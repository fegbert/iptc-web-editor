import antfu from '@antfu/eslint-config'

export default antfu({
  rules: {
    // Disable json key sorting
    'jsonc/sort-keys': 'off',
  },
})
