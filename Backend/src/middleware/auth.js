const { supabase } = require("../supabase");

// Auth middleware to protect routes
async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
    if (!token) {
      return res.status(401).json({ error: "Missing Bearer token" });
    }

    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data?.user) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }

    req.user = data.user; // attach the user
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = { requireAuth };
