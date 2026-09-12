import { createFileRoute } from "@tanstack/react-router";
import { DecisionCockpit } from "@/components/cockpit/DecisionCockpit";

const title = "Reality Resolver — Decision-Gated Calling";
const description =
  "A decision cockpit that determines whether a call is needed, whether it is allowed, and what action follows the result.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return <DecisionCockpit />;
}
