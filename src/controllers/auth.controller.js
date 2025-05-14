import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";

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

const login = async (req, res) => {
      const { email, password } = req.body;

      if (!email || !password) {
            return res.status(400).json({ message: "All fields are required" });
      }

      try {
            const user = await prisma.user.findUnique({
                  where: { email },
            });

            if (!user) {
                  return res.status(401).json({ message: "Invalid credentials" });
            }

            const isPasswordValid = await bcrypt.compare(password, user.password);

            if (!isPasswordValid) {
                  return res.status(401).json({ message: "Invalid credentials" });
            }

            const token = jwt.sign(
                  { id: user.id, email: user.email, role: user.role },
                  process.env.JWT_SECRET,
                  { expiresIn: "1h" }
            );

            const cookieOptions = {
                  httpOnly: true,
                  secure: true,
                  sameSite: "none",
            };

            res.cookie("token", token, cookieOptions);

            res.status(200).json({
                  success: true,
                  token,
                  user: {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                  },
                  message: "Login successful"
            });
      } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Login failed" });
      }
};

const logout = async (req, res) => {
      try {
            res.clearCookie("token");
            res.status(200).json({ message: "Logout successful" });
      } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Logout failed" });
      }
}

export { register, login };