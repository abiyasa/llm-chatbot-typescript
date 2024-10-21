import { StringOutputParser } from "@langchain/core/output_parsers";
import { PromptTemplate } from "@langchain/core/prompts";
import {
  RunnablePassthrough,
  RunnableSequence,
} from "@langchain/core/runnables";

import { BaseChatModel } from "langchain/chat_models/base";
import { ChatbotResponse } from "../history";

// tag::interface[]
export type RephraseQuestionInput = {
  // The user's question
  input: string;
  // Conversation history of {input, output} from the database
  history: ChatbotResponse[];
}
// end::interface[]

// tag::function[]
export default function initRephraseChain(llm: BaseChatModel) {
  const rephraseQuestionChainPrompt = PromptTemplate.fromTemplate<RephraseQuestionInput, string>(
    `
Given the following conversations between Human and AI,
rephrase the follow-up question from Human to be a standalone question.

If you do not have the required information required to construct
a standalone question, answer with "cannot answer, not enough information".

Always include the subject of the history in the question.

History:
{history}

Question:
{input}
    `
  );

  // If you do not have the required information required to construct
  // a standalone question, ask for clarification.

  return RunnableSequence.from<RephraseQuestionInput, string>([
    RunnablePassthrough.assign({
      history: ({ history }): string => {
        const formattedHistory = formatChatHistories(history);
        console.log(formattedHistory);
        return formattedHistory;
      }
    }),
    rephraseQuestionChainPrompt,
    llm,
    new StringOutputParser(),
  ]);
}
// end::function[]

/**
 * Format the chat histories into a human-readable format:
 * - Human: {input}
 * - AI: {output}
 * 
 * @param chatbotResponses 
 * @returns 
 */
function formatChatHistories(chatbotResponses: ChatbotResponse[]): string {
  if (chatbotResponses.length === 0) {
    return "No history";
  }

  return chatbotResponses
    .map((chatbotResponse) => `Human: ${chatbotResponse.input}\nAI: ${chatbotResponse.output}`)
    .join("\n");
}

/**
 * How to use this chain in your application:

// tag::usage[]
const llm = new OpenAI() // Or the LLM of your choice
const rephraseAnswerChain = initRephraseChain(llm)

const output = await rephraseAnswerChain.invoke({
  input: 'What else did they act in?',
  history: [{
    input: 'Who played Woody in Toy Story?',
    output: 'Tom Hanks played Woody in Toy Story',
  }]
}) // Other than Toy Story, what movies has Tom Hanks acted in?
// end::usage[]
 */
