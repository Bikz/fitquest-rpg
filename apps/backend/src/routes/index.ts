import { Hono } from "hono";
import ai from "./ai";
import analytics from "./analytics";
import app from "./app";
import billing from "./billing";
import email from "./email";
import entitlements from "./entitlements";
import files from "./files";
import notifications from "./notifications";
import users from "./users";

const routes = new Hono();

routes.route("/ai", ai);
routes.route("/analytics", analytics);
routes.route("/billing", billing);
routes.route("/email", email);
routes.route("/files", files);
routes.route("/notifications", notifications);
routes.route("/app", app);
routes.route("/users", users);
routes.route("/entitlements", entitlements);

export default routes;
