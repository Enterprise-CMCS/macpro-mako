import { defineWorkspace } from 'vitest/config'

// defineWorkspace provides a nice type hinting DX
export default defineWorkspace([
  'src/services/ui',
  'src/services/api',
  'src/packages/shared-types',
  'src/packages/shared-utils',
  'src/libs'
])