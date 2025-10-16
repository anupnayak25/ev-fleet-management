const express = require("express");
const { supabase } = require("../supabase");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

// GET /api/sessions?vehicleId=...&fleetId=...&page=1&pageSize=10
router.get("/", requireAuth, async (req, res, next) => {
  try {
    const { vehicleId, fleetId } = req.query;
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const pageSizeRaw = parseInt(req.query.pageSize, 10) || 10;
    const pageSize = Math.min(Math.max(pageSizeRaw, 1), 100); // 1..100
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase.from("charging_sessions").select("*", { count: "exact" });
    if (vehicleId) query = query.eq("vehicle_id", vehicleId);
    if (fleetId) query = query.eq("fleet_id", fleetId);

    const { data, error, count } = await query.order("start_time", { ascending: false }).range(from, to);
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

// POST /api/sessions
router.post("/", requireAuth, async (req, res, next) => {
  try {
    const { fleetId, vehicleId, startTime, endTime, energyUsed, batteryStatus } = req.body;
    if (!vehicleId || !startTime) {
      return res.status(400).json({ error: "vehicleId and startTime are required" });
    }
    const insert = {
      fleet_id: fleetId || null,
      vehicle_id: vehicleId,
      start_time: startTime,
      end_time: endTime || null,
      energy_used: energyUsed || null,
      battery_status: batteryStatus || null,
    };
    const { data, error } = await supabase.from("charging_sessions").insert(insert).select("*").single();
    if (error) return next(error);
    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
});

// PUT /api/sessions/:id
router.put("/:id", requireAuth, async (req, res, next) => {
  try {
    const id = req.params.id;
    const { fleetId, vehicleId, startTime, endTime, energyUsed, batteryStatus } = req.body;
    const update = {};
    if (fleetId !== undefined) update.fleet_id = fleetId;
    if (vehicleId !== undefined) update.vehicle_id = vehicleId;
    if (startTime !== undefined) update.start_time = startTime;
    if (endTime !== undefined) update.end_time = endTime;
    if (energyUsed !== undefined) update.energy_used = energyUsed;
    if (batteryStatus !== undefined) update.battery_status = batteryStatus;
    const { data, error } = await supabase.from("charging_sessions").update(update).eq("id", id).select("*").single();
    if (error) return next(error);
    res.json(data);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/sessions/:id
router.delete("/:id", requireAuth, async (req, res, next) => {
  try {
    const id = req.params.id;
    const { error } = await supabase.from("charging_sessions").delete().eq("id", id);
    if (error) return next(error);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
