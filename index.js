import "dotenv/config";
import { Telegraf } from "telegraf";
import connectDB from "./src/config/db.js";
import Users from "./src/models/user.js";
import { message } from "telegraf/filters";
import Events from "./src/models/event.js";
import generate from "./gemini.js";

const bot = new Telegraf(process.env.BOT_TOKEN);
connectDB();

bot.start(async (ctx) => {
  //   console.log(ctx);
  const from = ctx.update.message.from;

  try {
    // console.log(from);
    const user = await Users.findOneAndUpdate(
      {
        tgId: from.id,
      },
      {
        $setOnInsert: {
          tgId: from.id,
          isBot: from.is_bot,
        },
        $set: {
          firstName: from.first_name,
          lastName: from.last_name,
          username: from.username,
        },
      },
      {
        upsert: true,
        new: true,
      }
    );
    // console.log(user);
    await ctx.reply(
      `Hey ${from.first_name}, Welcome. I will be writing highly engaging social media posts 🚀 for you.`
    );
  } catch (error) {
    console.log(error);
    await ctx.reply("Facing difficulties. Please try again.");
  }
});

bot.command("generate", async (ctx) => {
  let allEvents = "";
  const { message_id: waitingMessageId } = await ctx.reply(
    `Please wait ${ctx.update.message.from.first_name}, I am generating your posts 🚀⏳`
  );
  const { message_id: waitingMessageId2 } = await ctx.replyWithAnimation(
    `CAACAgEAAxkBAAOoaFBRIXnphUKWAcAGYDKbX9EQ6cQAAkQCAAJRlzhEdi3DkU5Ftuc2BA`
  );
  const from = ctx.update.message.from;
  const startOfTheDay = new Date().setHours(0, 0, 0, 0);
  const endOfTheDay = new Date().setHours(23, 59, 59, 999);
  try {
    const events = await Events.find({
      tgId: from.id,
      createdAt: {
        $gte: startOfTheDay,
        $lte: endOfTheDay,
      },
    });
    if (events.length === 0) {
      await ctx.deleteMessage(waitingMessageId);
      await ctx.deleteMessage(waitingMessageId2);
      return ctx.reply("You have not written anything today.");
    }
    events.map((event) => {
      allEvents += event.text;
      allEvents += ". ";
    });
    const prompt = `${process.env.PROMPT}. Use the following events: ${allEvents}`;
    const generatedPost = await generate(prompt);
    await ctx.deleteMessage(waitingMessageId);
    await ctx.deleteMessage(waitingMessageId2);
    await ctx.reply(generatedPost);
  } catch (error) {
    console.log(error);
    ctx.reply("Facing difficulties. Please try again.");
  }
});

// bot.on("sticker", (ctx) => {
//   const fileId = ctx.message.sticker.file_id;
//   console.log("GIF file_id:", fileId);
//   ctx.reply(`Got your GIF! file_id: ${fileId}`);
// });

bot.on(message("text"), async (ctx) => {
  const from = ctx.update.message.from;
  const message = ctx.update.message.text;

  if (message === "/generate" || message === "/start") {
    return;
  }
  try {
    await Events.create({
      tgId: from.id,
      text: message,
    });
    await ctx.reply(
      "Noted 👍, Keep texting me your thoughts. To generate the posts, just enter the command: /generate"
    );
  } catch (error) {
    console.log(error);
    await ctx.reply("Facing difficulties. Please try again.");
  }
});

bot.launch();

// ENABLE GRACEFUL SHUTDOWN
process.on("SIGINT", () => bot.stop("SIGINT"));
process.on("SIGTERM", () => bot.stop("SIGTERM"));
