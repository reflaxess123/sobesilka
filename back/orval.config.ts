import { defineConfig } from 'orval';

export default defineConfig({
  sobesilka: {
    output: {
      mode: 'tags-split',
      target: 'src/shared/api/__generated__/sobesilka.ts',
      schemas: 'src/shared/api/__generated__/schemas',
      client: 'react-query',
      override: {
        mutator: {
          path: 'src/shared/api/axios-instance.ts',
          name: 'axiosInstance',
        },
        reactQuery: {
          version: 5,
          options: {
            staleTime: 5 * 60 * 1000,
          },
        },
      },
    },
    input: {
      target: process.env.OPENAPI_URL ?? 'http://localhost:8000/openapi.json',
    },
    hooks: {
      afterAllFilesWrite: 'eslint --fix src/shared/api/__generated__',
    },
  },
});
