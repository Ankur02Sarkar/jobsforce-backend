import mongoose, { Schema, type Document, type Types } from "mongoose";

export interface IQuestion {
  question: string;
  answer: string;
  score: number;
  questionId?: number;
  timeTaken?: number;
}

export interface IInterview extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  title: string;
  date: Date;
  status: "completed" | "pending" | "scheduled" | "cancelled";
  duration: number;
  questions: IQuestion[];
  feedback: string;
  jobId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const questionSchema = new Schema<IQuestion>({
  question: {
    type: String,
    required: [true, "Question is required"],
  },
  answer: {
    type: String,
    default: "",
  },
  score: {
    type: Number,
    min: 0,
    max: 10,
    default: 0,
  },
  questionId: {
    type: Number,
  },
  timeTaken: {
    type: Number,
    min: 0,
  },
});

const interviewSchema = new Schema<IInterview>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },
    title: {
      type: String,
      required: [true, "Interview title is required"],
      trim: true,
    },
    date: {
      type: Date,
      required: [true, "Interview date is required"],
    },
    status: {
      type: String,
      enum: ["completed", "pending", "scheduled"],
      default: "scheduled",
    },
    duration: {
      type: Number,
      min: 0,
      default: 60, // Default to 60 minutes
    },
    questions: [questionSchema],
    feedback: {
      type: String,
      default: "",
    },
    jobId: {
      type: String,
      index: true, // Add index for faster lookups
    },
  },
  { timestamps: true },
);

const Interview = mongoose.model<IInterview>("Interview", interviewSchema);
export default Interview;
