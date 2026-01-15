import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error(
    "Missing MONGODB_URI in environment. Ensure you have a .env.local file and run via: npm run seed:super"
  );
  process.exit(1);
}

const email = "jithinreji185@gmail.com";
const password = "Next@0000";
const name = "Jithin Reji";

async function main() {
  await mongoose.connect(MONGODB_URI, { dbName: "palliative-club" });

  const UserSchema = new mongoose.Schema(
    {
      name: { type: String, required: true },
      email: { type: String, required: true, unique: true },
      passwordHash: { type: String, required: true },
      role: { type: String, enum: ["member", "super"], required: true },
      approved: { type: Boolean, default: false }
    },
    { timestamps: { createdAt: true, updatedAt: false } }
  );

  const User = mongoose.models.User || mongoose.model("User", UserSchema);

  const existing = await User.findOne({ email }).exec();
  if (existing) {
    console.log(`Super user already exists: ${email}`);
    await mongoose.disconnect();
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await User.create({
    name,
    email,
    passwordHash,
    role: "super",
    approved: true
  });

  console.log(`Seeded super user: ${email}`);
  await mongoose.disconnect();
}

main().catch(async (err) => {
  console.error(err);
  try {
    await mongoose.disconnect();
  } catch {
    // ignore
  }
  process.exit(1);
});

