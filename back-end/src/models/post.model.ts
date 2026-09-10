import mongoose, { Document, Model, Schema } from "mongoose";

export interface IPost extends Document {
  postedBy: mongoose.Types.ObjectId;
  description: string;
  photos: string[];
  likedBy: mongoose.Types.ObjectId[];
  visibility: "public" | "private";
}

const PostSchema = new Schema<IPost>(
  {
    postedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 5000,
      default: "",
    },

    photos: {
      type: [String],
      default: [],
    },

    likedBy: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    visibility: {
      type: String,
      enum: ["public", "private"],
      default: "public",
    },
  },
  { timestamps: true },
);

PostSchema.index({ postedBy: 1, visibility: 1, createdAt: -1 });

const Post: Model<IPost> = mongoose.model<IPost>("Post", PostSchema);

export default Post;
