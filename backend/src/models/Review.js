const reviewSchema = new Schema({
  product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: String,
  images: [String],
  helpful: { type: Number, default: 0 },
  verified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});
