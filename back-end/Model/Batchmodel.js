import mongoose from "mongoose";

const batchSchema = new mongoose.Schema({
  courseName: { type: String, required: true }, // store name instead of ID
  name: { type: String, required: true },       // batch name
});

const Batch =mongoose.model("Batch", batchSchema);

export default Batch
