import mongoose, { Document, Schema, Model } from "mongoose";
import bcrypt from "bcryptjs";
import {
  SECURITY_QUESTIONS,
  SecurityQuestion,
} from "../constants/securityQuestions";
import {
  isStrongPassword,
  PASSWORD_VALIDATION_MESSAGE,
} from "../validators/password.validator";

export interface IUser extends Document {
  name: string;
  username: string;
  email: string;
  password: string;
  avatar?: string;
  bio?: string;
  followers: mongoose.Types.ObjectId[];
  following: mongoose.Types.ObjectId[];
  role: "user" | "admin";
  isVerified: boolean;
  securityQuestion: SecurityQuestion;
  securityAnswer: string;

  comparePassword(candidatePassword: string): Promise<boolean>;
  compareSecurityAnswer(candidateAnswer: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      minlength: 3,
      maxlength: 30,
      match: /^[a-zA-Z0-9_.]+$/, // no spaces/special chars except _ .
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: /^\S+@\S+\.\S+$/,
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false, // won't be returned in queries by default
      validate: {
        validator: isStrongPassword,
        message: PASSWORD_VALIDATION_MESSAGE,
      },
    },
    avatar: {
      type: String,
      default: "",
    },
    bio: {
      type: String,
      maxlength: 160,
      default: "",
    },
    followers: [{ type: Schema.Types.ObjectId, ref: "User" }],
    following: [{ type: Schema.Types.ObjectId, ref: "User" }],
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    securityQuestion: {
      type: String,
      required: true,
      enum: SECURITY_QUESTIONS,
    },

    securityAnswer: {
      type: String,
      required: true,
      select: false,
      trim: true,
    },
  },
  { timestamps: true },
);

UserSchema.pre("save", async function () {
  if (this.isModified("password")) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }

  if (this.isModified("securityAnswer")) {
    const salt = await bcrypt.genSalt(10);
    this.securityAnswer = await bcrypt.hash(
      this.securityAnswer.trim().toLowerCase(),
      salt,
    );
  }
});

UserSchema.methods.comparePassword = async function (
  candidatePassword: string,
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

UserSchema.methods.compareSecurityAnswer = async function (
  candidateAnswer: string,
): Promise<boolean> {
  return bcrypt.compare(
    candidateAnswer.trim().toLowerCase(),
    this.securityAnswer,
  );
};

const User: Model<IUser> = mongoose.model<IUser>("User", UserSchema);
export default User;
