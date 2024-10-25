import { ChatOpenAI } from "@langchain/openai";
import { OpenAIEmbeddings } from "@langchain/openai";
import initAgent from "./agent";
import { initGraph } from "../graph";
import { sleep } from "@/utils";
import { Point } from "./agent.types";

export type SimpleStringMessage = { type: "simple", message: string, };
export type MapData = { type: "map", data: Point[] };

const walkingPath: Point[] = [
  { lat: 37.7749, lng: -122.4194 },  // starting point
  {
    "lat": 37.77234303484361,
    "lng": -122.41807937622072
  },
  {
    "lat": 37.77003627110174,
    "lng": -122.41842269897462
  },
  {
    "lat": 37.7688150141044,
    "lng": -122.41842269897462
  },
  {
    "lat": 37.765558230172886,
    "lng": -122.41807937622072
  },
  {
    "lat": 37.7654225277299,
    "lng": -122.41275787353517
  },
  {
    "lat": 37.765693932366865,
    "lng": -122.40760803222658
  },
  {
    "lat": 37.765693932366865,
    "lng": -122.40486145019533
  },
  {
    "lat": 37.765693932366865,
    "lng": -122.40211486816408
  },
  {
    "lat": 37.76610103745482,
    "lng": -122.39833831787111
  },
  {
    "lat": 37.7662367386528,
    "lng": -122.39421844482423
  },
  {
    "lat": 37.76365837331252,
    "lng": -122.39353179931642
  },
  {
    "lat": 37.759858513184625,
    "lng": -122.39267349243165
  },
  {
    "lat": 37.756872771856465,
    "lng": -122.3921585083008
  }
]

// tag::call[]
export async function call(input: string, sessionId: string): Promise<SimpleStringMessage | MapData> {
  // special command for map
  if (input === "/map") {
    await sleep(1000);

    // return sepecial message for map command
    return { type: 'map', data: walkingPath };
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

