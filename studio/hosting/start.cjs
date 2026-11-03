const { createStudioServer } = require("./server.cjs");

const port = Number.parseInt(process.env.PORT ?? "3000", 10);

createStudioServer().listen(port, "0.0.0.0", () => {
  console.log(`Rebvar Studio listening on port ${port}`);
});
