import mongoose, { Document, Model, Schema } from "mongoose";

export interface IComment extends Document {
    post: mongoose.Types.ObjectId;
    postedBy: mongoose.Types.ObjectId;
    text: string;
}

const CommentSchema = new Schema<IComment>(
    {
        post: {
            type: Schema.Types.ObjectId,
            ref: "Post",
            required: true,
        },

        postedBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        text: {
            type: String,
            required: true,
            trim: true,
            maxlength: 1000,
        },
    },
    { timestamps: true },
);

const Comment: Model<IComment> = mongoose.model<IComment>(
    "Comment",
    CommentSchema,
);

export default Comment;