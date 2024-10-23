"use client";

import dynamic from "next/dynamic";
import { parse } from "marked";
import { MapMessage, StringMessage, type Message } from "@/hooks/chat";

const LazyMap = dynamic(() => import("@/components/map"), {
  ssr: false,
  loading: () => <p>Loading...</p>,
});

export default function Message({ message }: { message: Message }) {
  const isAIMessage = message.role === "ai" || message.role === "map";
  const align = isAIMessage ? "justify-start" : "justify-end";
  const no_rounding =
    isAIMessage ? "rounded-bl-none" : "rounded-br-none";
  const background = isAIMessage ? "blue" : "slate";

  return (
    <div className={`w-full flex flex-row ${align}`}>
      <span className="bg-blue-100"></span>
      <div className="flex flex-col space-y-2 text-sm mx-2 max-w-[60%] order-2 items-start">
        <div className={`bg-${background}-100 p-4 rounded-xl ${no_rounding}`}>
          {isMapMessage(message) ? (
            <div><LazyMap center={message.mapData[0]} /></div>
          ) : (
            <div
              dangerouslySetInnerHTML={{
                __html: fixMarkdown(message),
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function fixMarkdown(message: StringMessage): string {
  return parse(message.content).replace(
    '<a href="',
    '<a target="_blank" href="'
  );
}

function isMapMessage(message: Message): message is MapMessage {
  return (message.role === "map");
}
