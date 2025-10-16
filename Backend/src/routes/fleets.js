const express = require("express");
const { supabase } = require("../supabase");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

// GET /api/fleets?page=1&pageSize=10
router.get("/", requireAuth, async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const pageSizeRaw = parseInt(req.query.pageSize, 10) || 10;
    const pageSize = Math.min(Math.max(pageSizeRaw, 1), 100); // clamp 1..100
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error, count } = await supabase
      .from("fleets")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(from, to);
    if (error) return next(error);

    res.set("X-Total-Count", String(count ?? 0));
    return res.json({
      data,
      pagination: {
        page,
        pageSize,
        total: count ?? 0,
        totalPages: count ? Math.ceil(count / pageSize) : 0,
      },
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/fleets
router.post("/", requireAuth, async (req, res, next) => {
  try {
    const { name, location } = req.body;
    if (!name) return res.status(400).json({ error: "name is required" });
    const insert = { name, location: location || null };
    const { data, error } = await supabase.from("fleets").insert(insert).select("*").single();
    if (error) return next(error);
    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
});

// PUT /api/fleets/:id
router.put("/:id", requireAuth, async (req, res, next) => {
  try {
    const id = req.params.id;
    const { name, location } = req.body;
    const update = {};
    if (name !== undefined) update.name = name;
    if (location !== undefined) update.location = location;
    const { data, error } = await supabase.from("fleets").update(update).eq("id", id).select("*").single();
    if (error) return next(error);
    res.json(data);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/fleets/:id
router.delete("/:id", requireAuth, async (req, res, next) => {
  try {
    const id = req.params.id;
    const { error } = await supabase.from("fleets").delete().eq("id", id);
    if (error) return next(error);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
