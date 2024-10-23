import { call, SimpleStringMessage, MapData } from "@/modules/agent";
import { Point } from "@/modules/agent/agent.types";
import { randomUUID } from "crypto";
import type { NextApiRequest, NextApiResponse } from "next";

export type ResponseData = SimpleStringMessage | MapData;
export type { Point };

function getSessionId(req: NextApiRequest, res: NextApiResponse): string {
  let sessionId: string | undefined = req.cookies["session"];

  if (typeof sessionId === "string") {
    return sessionId;
  }

  // Assign a new session
  sessionId = randomUUID();
  res.setHeader("Set-Cookie", `session=${sessionId}`);

  return sessionId;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method === "POST") {
    const body = JSON.parse(req.body);
    const message = body.message;

    // Get or assign the Session ID
    const sessionId = getSessionId(req, res);

    try {
      const result = await call(message, sessionId);

      res.status(201).json(result);
    } catch (e: any) {
      res.status(500).json({
        type: "simple",
        message: `I'm suffering from brain fog...\n\n${e.message}`,
      });
    }
  } else {
    res.status(404).send({ type: "simple", message: "Route not found" });
  }
}
