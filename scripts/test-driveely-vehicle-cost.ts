import assert from "node:assert/strict";
import {
  estimateCostPerKm,
  defaultFuelForVehicle,
  typicalConsumption,
} from "../lib/margeo/vehicle-details";

const scooter = estimateCostPerKm("scooter_thermique", {
  fuel: "essence",
  consumptionPer100Km: 3.5,
  energyPrice: 1.85,
  brand: "",
  model: "",
  year: null,
  costPerKmManual: false,
});
assert.ok(scooter > 0.05 && scooter < 0.5, `scooter cost ${scooter}`);

const velo = estimateCostPerKm("velo", {
  fuel: "aucun",
  consumptionPer100Km: null,
  energyPrice: null,
  brand: "",
  model: "",
  year: null,
  costPerKmManual: false,
});
assert.equal(velo, 0.03);

assert.equal(defaultFuelForVehicle("voiture_electrique"), "electrique");
assert.ok((typicalConsumption("moto", "essence") ?? 0) > 0);

console.log("✅ vehicle cost estimate OK", { scooter, velo });
