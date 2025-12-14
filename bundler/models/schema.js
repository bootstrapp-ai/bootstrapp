import T from "/$app/types/index.js";

export default {
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
    deployType: T.string({
      enum: ["spa", "ssg", "hybrid", "worker"],
      defaultValue: "hybrid",
    }),
    deployTarget: T.string({
      enum: ["github", "cloudflare", "zip", "targz", "localhost"],
      defaultValue: "github",
    }),
    deployedAt: T.string(),
    files: T.array(),
    result: T.object(),
  },
};
