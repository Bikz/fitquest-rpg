import { Hono } from "hono";
import { createFileRecord } from "../db/queries/files";
import { ensureUser } from "../db/queries/users";
import { authMiddleware, getAuthContext } from "../middleware/auth";
import { presignUpload } from "../services/files";

const files = new Hono();

files.use("*", authMiddleware);

files.post("/presign", async (c) => {
  let payload: { fileName?: string; contentType?: string | null; size?: number | null } | null =
    null;

  try {
    payload = await c.req.json();
  } catch {
    return c.json({ error: "Invalid JSON payload." }, 400);
  }

  if (!payload?.fileName) {
    return c.json({ error: "fileName is required." }, 400);
  }

  const user = getAuthContext(c);
  await ensureUser(user.id, user.authProvider ?? null);
  const size = typeof payload.size === "number" ? payload.size : null;
  try {
    const result = await presignUpload({
      userId: user.id,
      fileName: payload.fileName,
      contentType: payload.contentType ?? null,
      size,
    });

    await createFileRecord({
      id: result.fileId,
      userId: user.id,
      path: result.path,
      mime: payload.contentType ?? null,
      size,
    });

    return c.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Presign failed.";
    return c.json({ error: message }, 500);
  }
});

export default files;
