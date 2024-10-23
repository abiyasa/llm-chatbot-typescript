import { ChatOpenAI } from "@langchain/openai";
import { OpenAIEmbeddings } from "@langchain/openai";
import initAgent from "./agent";
import { initGraph } from "../graph";
import { sleep } from "@/utils";
import { Point } from "./agent.types";

export type SimpleStringMessage = { type: "simple", message: string, };
export type MapData = { type: "map", data: Point[] };

// tag::call[]
export async function call(input: string, sessionId: string): Promise<SimpleStringMessage | MapData> {
  // special command for map
  if (input === "/map") {
    await sleep(1000);

    // return sepecial message for map command
    return { type: 'map', data: [{ lat: 37.7749, lng: -122.4194 }] };
  }

  const llm = new ChatOpenAI({
    openAIApiKey: process.env.OPENAI_API_KEY,
    // Note: only provide a baseURL when using the GraphAcademy Proxy
    configuration: {
      baseURL: process.env.OPENAI_API_BASE,
    },
  });

  const embeddings = new OpenAIEmbeddings({
    openAIApiKey: process.env.OPENAI_API_KEY,
    configuration: {
      baseURL: process.env.OPENAI_API_BASE,
    },
  });

  // Get Graph Singleton
  const graph = await initGraph();

  const agent = await initAgent(llm, embeddings, graph);
  const response = await agent.invoke({ input }, { configurable: { sessionId } });

  // process response
  return { type: "simple", message: response as string };
}
// end::call[]
