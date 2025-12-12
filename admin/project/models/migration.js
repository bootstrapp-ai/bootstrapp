import $APP from "/$app.js";
import T from "/$app/types/index.js";

const newProjectTemplate = (name) => {
  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${name}</title>
  <link rel="stylesheet" href="index.css">
</head>
<body>
  <h1>Welcome to ${name}!</h1>
  <p>Your new project is ready to go.</p>
  <script type="module" src="index.js"></script>
</body>
</html>`;

  const jsContent = `console.log("✨ Hello from ${name}!");

// Your JavaScript code starts here.
`;

  const cssContent = `body {
  font-family: system-ui, -apple-system, sans-serif;
  display: grid;
  place-content: center;
  text-align: center;
  min-height: 100vh;
  margin: 0;
  background-color: #f0f2f5;
  color: #1c1e21;
}
`;

  return [
    // The main project directory
    { name, directory: "/projects", isDirectory: true },

    {
      name: "index.html",
      directory: `/projects/${name}`,
      content: htmlContent,
      mimeType: "text/html",
    },

    {
      name: "index.js",
      directory: `/projects/${name}`,
      content: jsContent,
      mimeType: "application/javascript",
    },

    {
      name: "index.css",
      directory: `/projects/${name}`,
      content: cssContent,
      mimeType: "text/css",
    },
  ];
};

$APP.data.set({
  boards: [
    { name: "Backlog", description: "Development Tasks" },
    { name: "Development", description: "Development Tasks" },
    { name: "Finished", description: "Development Tasks" },
    { name: "Cancelled", description: "Development Tasks" },
  ],
  files: [
    { name: "projects", directory: "", isDirectory: true },
    //...$APP.project.newProjectTemplate("untitled-1"),
  ],
});
$APP.data.set({
  boards: [
    { name: "Backlog", description: "Development Tasks" },
    { name: "In Development", description: "Development Tasks" },
    { name: "Finished", description: "Development Tasks" },
    { name: "Cancelled", description: "Development Tasks" },
  ],
  files: [
    { name: "projects", directory: "", isDirectory: true },
    ...newProjectTemplate("untitled-1"),
  ],
});
$APP.models.set({
  users: {
    username: T.string({ primary: true }),
    email: T.string({ unique: true }),
    role: T.string({ defaultValue: "user", enum: ["admin", "user"] }),
  },
  boards: {
    name: T.string(),
    description: T.string(),
    tasks: T.many("tasks", "boardId"),
  },
  tasks: {
    title: T.string(),
    description: T.string({ input: "textarea" }),
    completed: T.boolean({ defaultValue: false }),
    dueDate: T.date(),
    priority: T.string({
      defaultValue: "medium",
      enum: ["low", "medium", "high"],
    }),
    boardId: T.belongs("boards", "tasks"),
    createdBy: T.belongs("users", "tasks"),
    assignedTo: T.belongs("users", "assignedTasks"),
    comments: T.array(),
  },
});
