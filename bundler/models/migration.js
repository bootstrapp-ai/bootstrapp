import $APP from "/node_modules/@bootstrapp/base/app.js";
import T from "/node_modules/@bootstrapp/types/index.js";

$APP.data.set({
  credentials: [
    {
      id: "singleton",
      owner: "meiraleal",
      branch: "main",
      repo: "brazuka.dev",
      token: "",
    },
  ],
});

$APP.models.set({
  credentials: {
    owner: T.string(),
    repo: T.string(),
    branch: T.string({ defaultValue: "main" }),
    token: T.string(),
  },
  releases: {
    version: T.string({
      index: true,
    }),
    notes: T.string(),
    status: T.string({
      enum: ["pending", "success", "failed"],
      defaultValue: "pending",
    }),
    deployedAt: T.string(),
    files: T.array(),
  },
});
