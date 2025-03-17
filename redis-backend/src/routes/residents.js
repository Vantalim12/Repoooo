const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const { authenticateToken } = require("../middleware/auth");
const { generateId, getAllItems, getItemById } = require("../utils/redisUtils");

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Get all residents
router.get("/", async (req, res) => {
  try {
    const residents = await getAllItems(req.redisClient, "resident:*");
    res.json(residents);
  } catch (error) {
    console.error("Error getting residents:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Get resident by ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const resident = await getItemById(req.redisClient, `resident:${id}`);

    if (!resident) {
      return res.status(404).json({ error: "Resident not found" });
    }

    res.json(resident);
  } catch (error) {
    console.error(`Error getting resident ${req.params.id}:`, error);
    res.status(500).json({ error: "Server error" });
  }
});

// Create new resident
router.post(
  "/",
  [
    body("firstName").not().isEmpty().withMessage("First name is required"),
    body("lastName").not().isEmpty().withMessage("Last name is required"),
    body("gender").not().isEmpty().withMessage("Gender is required"),
    body("birthDate").isDate().withMessage("Valid birth date is required"),
    body("address").not().isEmpty().withMessage("Address is required"),
    body("contactNumber").optional(),
    body("familyHeadId").optional(),
  ],
  async (req, res) => {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      // Check if family head exists if provided
      if (req.body.familyHeadId) {
        const familyHeadExists = await req.redisClient.exists(
          `familyHead:${req.body.familyHeadId}`
        );
        if (!familyHeadExists) {
          return res.status(400).json({ error: "Family head does not exist" });
        }
      }

      // Generate new resident ID
      const id = await generateId(req.redisClient, "residents:count", "R");

      // Prepare resident data
      const resident = {
        id,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        gender: req.body.gender,
        birthDate: req.body.birthDate,
        address: req.body.address,
        contactNumber: req.body.contactNumber || "",
        familyHeadId: req.body.familyHeadId || "",
        registrationDate: new Date().toISOString(),
        type: "Resident",
      };

      // Save resident to Redis
      await req.redisClient.hSet(`resident:${id}`, { ...resident });

      // If this resident is part of a family, update family members
      if (req.body.familyHeadId) {
        await req.redisClient.sAdd(
          `familyMembers:${req.body.familyHeadId}`,
          id
        );
      }

      res.status(201).json(resident);
    } catch (error) {
      console.error("Error creating resident:", error);
      res.status(500).json({ error: "Server error" });
    }
  }
);

// Update resident
router.put(
  "/:id",
  [
    body("firstName").not().isEmpty().withMessage("First name is required"),
    body("lastName").not().isEmpty().withMessage("Last name is required"),
    body("gender").not().isEmpty().withMessage("Gender is required"),
    body("birthDate").isDate().withMessage("Valid birth date is required"),
    body("address").not().isEmpty().withMessage("Address is required"),
    body("contactNumber").optional(),
    body("familyHeadId").optional(),
  ],
  async (req, res) => {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { id } = req.params;

      // Check if resident exists
      const residentExists = await req.redisClient.exists(`resident:${id}`);
      if (!residentExists) {
        return res.status(404).json({ error: "Resident not found" });
      }

      // Get current resident data
      const currentResident = await req.redisClient.hGetAll(`resident:${id}`);

      // If family head changed, update family memberships
      if (
        currentResident.familyHeadId &&
        currentResident.familyHeadId !== req.body.familyHeadId
      ) {
        // Remove from old family
        await req.redisClient.sRem(
          `familyMembers:${currentResident.familyHeadId}`,
          id
        );
      }

      // Check if new family head exists
      if (req.body.familyHeadId) {
        const familyHeadExists = await req.redisClient.exists(
          `familyHead:${req.body.familyHeadId}`
        );
        if (!familyHeadExists) {
          return res.status(400).json({ error: "Family head does not exist" });
        }

        // Add to new family
        await req.redisClient.sAdd(
          `familyMembers:${req.body.familyHeadId}`,
          id
        );
      }

      // Prepare resident data
      const resident = {
        id,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        gender: req.body.gender,
        birthDate: req.body.birthDate,
        address: req.body.address,
        contactNumber: req.body.contactNumber || "",
        familyHeadId: req.body.familyHeadId || "",
        registrationDate: currentResident.registrationDate,
        type: "Resident",
      };

      // Update resident in Redis
      await req.redisClient.hSet(`resident:${id}`, resident);

      res.json(resident);
    } catch (error) {
      console.error(`Error updating resident ${req.params.id}:`, error);
      res.status(500).json({ error: "Server error" });
    }
  }
);

// Delete resident
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Check if resident exists
    const residentExists = await req.redisClient.exists(`resident:${id}`);
    if (!residentExists) {
      return res.status(404).json({ error: "Resident not found" });
    }

    // Get resident data
    const resident = await req.redisClient.hGetAll(`resident:${id}`);

    // If resident is part of a family, remove from family members
    if (resident.familyHeadId) {
      await req.redisClient.sRem(`familyMembers:${resident.familyHeadId}`, id);
    }

    // Delete resident from Redis
    await req.redisClient.del(`resident:${id}`);

    res.json({ message: "Resident deleted successfully" });
  } catch (error) {
    console.error(`Error deleting resident ${req.params.id}:`, error);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
