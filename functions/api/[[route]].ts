import { Hono, MiddlewareHandler } from "hono";
import { handle } from "hono/cloudflare-pages";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import jwt from "@tsndr/cloudflare-worker-jwt";

const app = new Hono().basePath("/api");

const secretKey = "my_secret_key";

const USET_LIST = [
  {
    id: 1,
    name: "Hoge Taro",
    password: "hoge",
    email: "hoge.taro@example.com",
  },
  {
    id: 2,
    name: "Fuga Jiro",
    password: "fuga",
    email: "fuga.jiro@example.com",
  },
];

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

const authenticate: MiddlewareHandler = async (c, next) => {
  const token = c.req.headers.get("Authorization")?.split(" ")[1];

  if (!token) {
    c.status(401);
    return c.json({
      message: "No token provided",
    });
  }

  // JWTの検証
  const isValid = await jwt.verify(token, secretKey);

  if (!isValid) {
    c.status(401);
    return c.json({
      message: "Failed to authenticate token",
    });
  }

  await next();
};

app.use("/auth/*", authenticate);

type LoginResponse =
  | {
      status: "failed";
      message: string;
    }
  | {
      status: "success";
      token: string;
    };

const route = app
  .get("/message", (c) =>
    c.jsonT({
      message: "Hello",
    })
  )
  .post("/login", zValidator("form", loginSchema), async (c) => {
    const { email, password } = c.req.valid("form");

    const user = USET_LIST.find((u) => u.email === email);
    let response: LoginResponse;

    if (!user || user.password !== password) {
      response = {
        status: "failed",
        message: "Failed to login",
      };
    } else {
      const token = await jwt.sign(
        {
          id: user.id,
          expiresIn: 86400, // 24 hours
        },
        secretKey
      );

      response = {
        status: "success",
        token,
      };
    }

    return c.jsonT(response);
  })
  .get("/auth/message", (c) =>
    c.jsonT({
      message: "Secret",
    })
  )
  .get("/auth/user", (c) => {
    const token = c.req.headers.get("Authorization")?.split(" ")[1];

    const decoded = jwt.decode(token);

    console.log(decoded);

    const user = USET_LIST.find((u) => u.id === decoded?.payload.id);

    return c.jsonT({
      user,
    });
  });

export const onRequest = handle(app);
export type AppType = typeof route;
