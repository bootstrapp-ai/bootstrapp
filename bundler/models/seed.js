import $APP from "/$app.js";

const { deploy = {} } = $APP.settings;

export default {
  credentials: [
    {
      id: "singleton",
      owner: deploy.owner || "",
      branch: deploy.branch || "main",
      repo: deploy.repo || "",
      token: deploy.token || "",
    },
  ],
};
