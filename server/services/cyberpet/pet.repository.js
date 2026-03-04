import CyberPet from "../../models/CyberPet.js";
import User from "../../models/User.js";

export async function getOrCreatePet(userId) {
  let pet = await CyberPet.findOne({ userId });

  if (!pet) {
    pet = await CyberPet.create({ userId });
  }

  return pet;
}

export async function getUserWithCyberPetStats(userId) {
  const user = await User.findById(userId);
  if (!user) return null;

  if (!user.cyberPetStats) {
    user.cyberPetStats = {};
  }

  return user;
}
