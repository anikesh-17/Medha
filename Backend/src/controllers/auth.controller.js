const userModel = require("../models/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const tokenBlackListModel = require("../models/blacklist.model");

/**
 * @name registerUserController
 * @description Register a new user, expects username, email and password in the request body
 * @access Public
 */
async function registerUserController(req, res) {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        message: "Please provide username, email and password",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await userModel.findOne({
      $or: [{ username: username.trim() }, { email: normalizedEmail }],
    });

    if (existingUser) {
      if (existingUser.email === normalizedEmail) {
        return res.status(400).json({
          message: "User already exists with this email",
        });
      }
      return res.status(400).json({
        message: "User already exists with this username",
      });
    }

    const hash = await bcrypt.hash(password, 10);

    const user = new userModel({
      username: username.trim(),
      email: normalizedEmail,
      password: hash,
    });

    await user.save();

    const token = jwt.sign(
      { id: user._id, username: user.username },
      process.env.JWT_SECRET || "default_secret",
      { expiresIn: "1d" },
    );

    res.cookie("token", token);

    return res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
      token,
    });
  } catch (error) {
    console.error("Error in register:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

/**
 * @name loginUserController
 * @description Login a user, expects email and password in the request body
 * @access Public
 */
async function loginUserController(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Please provide email and password",
      });
    }

    // 2. Check if user exists in the database
    const normalizedEmail = email.toLowerCase().trim();
    const user = await userModel.findOne({ email: normalizedEmail });

    // 3. Return 404 if user not found
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // 4. Compare passwords with bcrypt
    const isPasswordValid = await bcrypt.compare(String(password), user.password);

    // 5. Invalid password returns 401
    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    // 6. Login successful
    const token = jwt.sign(
      { id: user._id, username: user.username },
      process.env.JWT_SECRET || "default_secret",
      { expiresIn: "1d" },
    );

    res.cookie("token", token);
    return res.status(200).json({
      message: "User logged in successfully",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
      token,
    });
  } catch (error) {
    console.error("Error in login:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

/**
 * @name logoutUserController
 * @description clear token from user cookie and add the token in blacklist
 * @access public
 */
async function logoutUserController(req, res) {
  try {
    const token = req.cookies?.token;

    if (token) {
      await tokenBlackListModel.create({ token });
    }

    res.clearCookie("token");

    return res.status(200).json({
      message: "User logged out successfully",
    });
  } catch (error) {
    console.error("Error in logout:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

/**
 * @name getMeController
 * @description get the current logged in user details.
 * @access private
 */
async function getMeController(req, res) {
  try {
    const user = await userModel.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      message: "User details fetched successfully",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Error in getMe:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

module.exports = {
  registerUserController,
  loginUserController,
  logoutUserController,
  getMeController,
};
