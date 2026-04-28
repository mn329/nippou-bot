import { verifyKey } from "discord-interactions";
import { Hono } from "hono";

type Bindings = {
  DISCORD_PUBLIC_KEY: string;
};

const app = new Hono<{ Bindings: Bindings }>();

const InteractionType = {
  PING: 1,
  APPLICATION_COMMAND: 2,
  MODAL_SUBMIT: 5,
} as const;

const InteractionResponseType = {
  PONG: 1,
  CHANNEL_MESSAGE_WITH_SOURCE: 4,
  MODAL: 9,
} as const;

const ComponentType = {
  ACTION_ROW: 1,
  TEXT_INPUT: 4,
} as const;

type InteractionDataOption = {
  custom_id?: string;
  value?: string;
  components?: InteractionDataOption[];
};

app.post("/", async (c) => {
  const signature = c.req.header("x-signature-ed25519");
  const timestamp = c.req.header("x-signature-timestamp");
  const rawBody = await c.req.text();
  const publicKey = c.env.DISCORD_PUBLIC_KEY;

  if (!signature || !timestamp || !publicKey) {
    return c.json({ error: "Missing required headers or public key." }, 401);
  }

  const isValidRequest = verifyKey(rawBody, signature, timestamp, publicKey);
  if (!isValidRequest) {
    return c.json({ error: "Bad request signature." }, 401);
  }

  let interaction: Record<string, unknown>;
  try {
    interaction = JSON.parse(rawBody) as Record<string, unknown>;
  } catch {
    return c.json({ error: "Invalid JSON body." }, 400);
  }

  const interactionType = interaction.type as number | undefined;

  if (interactionType === InteractionType.PING) {
    return c.json({ type: InteractionResponseType.PONG });
  }

  if (interactionType === InteractionType.APPLICATION_COMMAND) {
    const data = interaction.data as { name?: string } | undefined;
    if (data?.name !== "nippou") {
      return c.json({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: { content: "未対応のコマンドです。" },
      });
    }

    return c.json({
      type: InteractionResponseType.MODAL,
      data: {
        custom_id: "nippou_modal",
        title: "日報入力",
        components: [
          {
            type: ComponentType.ACTION_ROW,
            components: [
              {
                type: ComponentType.TEXT_INPUT,
                custom_id: "work_time",
                label: "作業時間",
                style: 1,
                required: true,
                placeholder: "例: 3時間",
              },
            ],
          },
          {
            type: ComponentType.ACTION_ROW,
            components: [
              {
                type: ComponentType.TEXT_INPUT,
                custom_id: "work_content",
                label: "作業内容",
                style: 2,
                required: true,
                placeholder: "今日取り組んだ内容を記載してください",
              },
            ],
          },
          {
            type: ComponentType.ACTION_ROW,
            components: [
              {
                type: ComponentType.TEXT_INPUT,
                custom_id: "comment",
                label: "コメント",
                style: 2,
                required: false,
                placeholder: "補足や所感があれば記載してください",
              },
            ],
          },
        ],
      },
    });
  }

  if (interactionType === InteractionType.MODAL_SUBMIT) {
    const data = interaction.data as { components?: InteractionDataOption[] } | undefined;
    const rows = data?.components ?? [];

    const values = new Map<string, string>();
    for (const row of rows) {
      const inputs = row.components ?? [];
      for (const input of inputs) {
        if (input.custom_id && typeof input.value === "string") {
          values.set(input.custom_id, input.value);
        }
      }
    }

    const workTime = values.get("work_time") ?? "(未入力)";
    const workContent = values.get("work_content") ?? "(未入力)";
    const comment = values.get("comment") ?? "(未入力)";

    const message = [
      "日報を受け付けました！",
      "",
      "【日報内容】",
      `- 作業時間: ${workTime}`,
      `- 作業内容: ${workContent}`,
      `- コメント: ${comment}`,
    ].join("\n");

    return c.json({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content: message,
      },
    });
  }

  return c.json(
    {
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content: "このInteractionタイプは未対応です。",
      },
    },
    400,
  );
});

export default app;
