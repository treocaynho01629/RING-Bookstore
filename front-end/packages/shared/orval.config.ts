export default {
  modelsOnly: {
    output: {
      mode: "split",
      target: "src/models", // folder to generate models/enums
      schemas: "src/models", // folder for schema definitions
      // clean: true, // removes old generated files
      indexFiles: true,
      override: {
        zod: {
          generateEachHttpStatus: true,
        },
      },
    },
    input: {
      // use your own Swagger url: http://server:port/context-path/v3/api-docs
      target: "http://localhost:8080/v3/api-docs",
      filters: {
        tags: [/api/],
      },
    },
    outputOptions: {
      exportModels: true, // only generate components.schemas
      exportSchemas: false,
    },
    hooks: {
      afterAllFilesWrite: "prettier --write",
    },
    mock: false,
    override: {
      mutator: undefined,
      query: { useQuery: false },
      operations: {},
    },
  },
};
