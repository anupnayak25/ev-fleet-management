const express = require("express");
const { supabase } = require("../supabase");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

// GET /api/vehicles?fleetId=...
router.get("/", requireAuth, async (req, res, next) => {
  try {
    const { fleetId } = req.query;
    let query = supabase.from("vehicles").select("*").order("created_at", { ascending: false });
    if (fleetId) query = query.eq("fleet_id", fleetId);
    const { data, error } = await query;
    if (error) return next(error);
    res.json(data);
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
