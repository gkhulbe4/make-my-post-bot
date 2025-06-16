import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    tgId: {
      type: String,
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Events = mongoose.model("Events", eventSchema);
export default Events;
