import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const prisma = new PrismaClient();

const register = async (req, res) => {
      const { name, email, password, phone } = req.body;

      if (!name || !email || !password || !phone) {
            return res.status(400).json({ message: "All fields are required" });
      }

      try {
            const existingUser = await prisma.user.findUnique({
                  where: { email },
            },
            )

            if (existingUser) {
                  return res.status(400).json({ message: "User already exists" });
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            const verificationToken = crypto.randomBytes(32).toString("hex");

            const user = await prisma.user.create({
                  data: {
                        name,
                        email,
                        phone,
                        password: hashedPassword,
                        verificationToken,
                  },
            });

            // TODO: send verification email

            res.status(201).json({ message: "User registered successfully" });
      } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Internal server error" });
      }
};

export { register };