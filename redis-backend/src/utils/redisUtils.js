/**
 * Redis utilities for handling data storage and retrieval
 */

// Generate a unique ID with a prefix and count
async function generateId(redisClient, countKey, prefix) {
  const count = await redisClient.incr(countKey);
  return `${prefix}-${new Date().getFullYear()}${count
    .toString()
    .padStart(3, "0")}`;
}

// Get all items of a certain type
async function getAllItems(redisClient, pattern) {
  const keys = await redisClient.keys(pattern);

  if (!keys.length) return [];

  const pipeline = redisClient.multi();
  keys.forEach((key) => {
    pipeline.hGetAll(key);
  });

  const results = await pipeline.exec();
  return results;
}

// Get an item by ID
async function getItemById(redisClient, key) {
  const exists = await redisClient.exists(key);
  if (!exists) return null;

  return await redisClient.hGetAll(key);
}

// Create statistics for dashboard
async function getDashboardStats(redisClient) {
  // Get counts
  const [totalResidents, totalFamilyHeads] = await Promise.all([
    redisClient.get("residents:count"),
    redisClient.get("familyHeads:count"),
  ]);

  // Get all residents for gender and age distribution
  const residents = await getAllItems(redisClient, "resident:*");

  // Gender distribution
  const genderData = residents.reduce((acc, resident) => {
    const gender = resident.gender || "Unknown";
    acc[gender] = (acc[gender] || 0) + 1;
    return acc;
  }, {});

  // Age distribution
  const ageData = residents.reduce((acc, resident) => {
    const birthDate = new Date(resident.birthDate);
    const age = new Date().getFullYear() - birthDate.getFullYear();

    let ageGroup = "61+";
    if (age <= 10) ageGroup = "0-10";
    else if (age <= 20) ageGroup = "11-20";
    else if (age <= 30) ageGroup = "21-30";
    else if (age <= 40) ageGroup = "31-40";
    else if (age <= 50) ageGroup = "41-50";
    else if (age <= 60) ageGroup = "51-60";

    acc[ageGroup] = (acc[ageGroup] || 0) + 1;
    return acc;
  }, {});

  // Monthly registrations
  const monthlyRegistrations = residents.reduce((acc, resident) => {
    if (resident.registrationDate) {
      const date = new Date(resident.registrationDate);
      const month = date.toLocaleString("default", { month: "short" });
      acc[month] = (acc[month] || 0) + 1;
    }
    return acc;
  }, {});

  // Recent registrations
  const recentRegistrations = residents
    .filter((r) => r.registrationDate)
    .sort((a, b) => new Date(b.registrationDate) - new Date(a.registrationDate))
    .slice(0, 5)
    .map((r) => ({
      id: r.id,
      name: `${r.firstName} ${r.lastName}`,
      date: r.registrationDate,
      type: r.type || "Resident",
    }));

  return {
    totalResidents: parseInt(totalResidents) || 0,
    totalFamilyHeads: parseInt(totalFamilyHeads) || 0,
    genderData: Object.entries(genderData).map(([name, value]) => ({
      name,
      value,
      color:
        name === "Male" ? "#0088FE" : name === "Female" ? "#FF8042" : "#FFBB28",
    })),
    ageData: Object.entries(ageData).map(([name, count]) => ({ name, count })),
    monthlyRegistrations: Object.entries(monthlyRegistrations).map(
      ([name, newResidents]) => ({
        name,
        newResidents,
      })
    ),
    recentRegistrations,
  };
}

module.exports = {
  generateId,
  getAllItems,
  getItemById,
  getDashboardStats,
};
