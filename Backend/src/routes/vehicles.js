const express = require("express");
const { supabase } = require("../supabase");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

// GET /api/vehicles?fleetId=...&page=1&pageSize=10
router.get("/", requireAuth, async (req, res, next) => {
  try {
    const { fleetId } = req.query;

    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const pageSizeRaw = parseInt(req.query.pageSize, 10) || 10;
    const pageSize = Math.min(Math.max(pageSizeRaw, 1), 100); // clamp 1..100
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase.from("vehicles").select("*", { count: "exact" });
    if (fleetId) query = query.eq("fleet_id", fleetId);

    const { data, error, count } = await query.order("created_at", { ascending: false }).range(from, to);

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

// POST /api/vehicles
router.post("/", requireAuth, async (req, res, next) => {
  try {
    const { owner, model, registrationNumber, fleetId } = req.body;
    if (!owner || !model || !registrationNumber) {
      return res.status(400).json({ error: "owner, model, registrationNumber are required" });
    }
    const insert = { owner, model, registration_number: registrationNumber, fleet_id: fleetId || null };
    const { data, error } = await supabase.from("vehicles").insert(insert).select("*").single();
    if (error) return next(error);
    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
});

// PUT /api/vehicles/:id
router.put("/:id", requireAuth, async (req, res, next) => {
  try {
    const id = req.params.id;
    const { owner, model, registrationNumber, fleetId } = req.body;
    const update = {};
    if (owner !== undefined) update.owner = owner;
    if (model !== undefined) update.model = model;
    if (registrationNumber !== undefined) update.registration_number = registrationNumber;
    if (fleetId !== undefined) update.fleet_id = fleetId;
    const { data, error } = await supabase.from("vehicles").update(update).eq("id", id).select("*").single();
    if (error) return next(error);
    res.json(data);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/vehicles/:id
router.delete("/:id", requireAuth, async (req, res, next) => {
  try {
    const id = req.params.id;
    const { error } = await supabase.from("vehicles").delete().eq("id", id);
    if (error) return next(error);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
