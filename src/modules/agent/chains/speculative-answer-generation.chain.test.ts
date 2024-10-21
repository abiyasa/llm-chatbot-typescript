import { config } from "dotenv";
import initGenerateAnswerChain from "./answer-generation.chain";
import { BaseChatModel } from "langchain/chat_models/base";
import { RunnableSequence } from "@langchain/core/runnables";
import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";

describe("Speculative Answer Generation Chain", () => {
  let llm: BaseChatModel;
  let chain: RunnableSequence;
  let evalChain: RunnableSequence<any, any>;

  beforeAll(async () => {
    config({ path: ".env.local" });

    llm = new ChatOpenAI({
      openAIApiKey: process.env.OPENAI_API_KEY,
      modelName: "gpt-3.5-turbo",
      temperature: 0,
      configuration: {
        baseURL: process.env.OPENAI_API_BASE,
      },
    });

    chain = await initGenerateAnswerChain(llm);

    // tag::evalchain[]
    evalChain = RunnableSequence.from([
      PromptTemplate.fromTemplate(`
        Does the following response answer the question provided?

        Question: {question}
        Response: {response}

        Respond simply with "yes" or "no".
      `),
      llm,
      new StringOutputParser(),
    ]);
    // end::evalchain[]
  });

  describe("Simple RAG", () => {
    it("should use context to answer the question", async () => {
      const question = "Who directed pocong?";
      const response = await chain.invoke({
        question,
        // context: '[{"name": "Lana Wachowski"}, {"name": "Lilly Wachowski"}]',
        context: '[{"name": "Agus Kusuma"}, {"name": "Joko Anwar"}]',
      });
      console.log(`${question} - ${response}`);

      // tag::eval[]
      const evaluation = await evalChain.invoke({ question, response });

      console.log(evaluation);
      expect(`${response} - ${evaluation.toLowerCase()}`).toContain("yes");
      // end::eval[]
    });

    it("should refuse to answer if information is not in context", async () => {
      const question = "Who directed the matrix?";
      const response = await chain.invoke({
        question,
        context:
          "The Matrix is a 1999 science fiction action film starring Keanu Reeves",
      });
      console.log(`${question} - ${response}`);

      const evaluation = await evalChain.invoke({ question, response });
      console.log(evaluation);
      expect(`${evaluation.toLowerCase()} - ${response}`).toContain("no");
    });
    // NOTE: the test always passed even with incorrect answer due to "I don't know" response contains "no"
    // The 1st log: Who directed the matrix? - I'm sorry, I don't know who directed The Matrix.
    // The 2nd log: Yes
    // Maybe we could add console.log so we can see the evaluation result (see https://graphacademy.neo4j.com/courses/llm-chatbot-typescript/2-chains/3-evaluating-responses/)

    it("should answer this one??", async () => {
      const role = "The Chief";

      const question = "What was Emil Eifrems role in Neo4j The Movie??";
      const response = await chain.invoke({
        question,
        context: `{"Role":"${role}"}`,
      });

      expect(response).toContain(role);

      const evaluation = await evalChain.invoke({ question, response });
      expect(`${evaluation.toLowerCase()} - ${response}`).toContain("yes");
    });
  });
});
