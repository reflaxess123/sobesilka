import { defineConfig } from 'orval';

export default defineConfig({
  api: {
    output: {
      mode: 'split',
      target: 'src/shared/api/generated/api.ts',
      schemas: 'src/shared/api/generated/model',
      client: 'react-query',
      mock: false,
      override: {
        mutator: {
          path: 'src/shared/api/mutator/custom-instance.ts',
          name: 'customInstance',
        },
        query: {
          useQuery: true,
          useMutation: true,
          signal: true,
        },
      },
    },
    input: {
      target: 'http://localhost:8000/openapi.json',
    },
  },
});
