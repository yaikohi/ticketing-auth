import { Document, model, Schema } from "mongoose";

// --- User model
export interface IUser extends Document {
  email: string;
  password: string;
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      unique: false,
    },
  },
  {
    timestamps: true,
  },
);

export default model<IUser>("user", userSchema);

