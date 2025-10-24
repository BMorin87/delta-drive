export const STATUS_CONFIGS = {
  drink: {
    duration: 4, // seconds
    cooldown: 10,
    cost: { base: 10, need: "thirst", capacity: "thirstCapacity" },
    effects: [
      {
        targetStat: "thirst",
        rateID: "initialThirstRate",
        statDrainMultiplier: 12,
        rewards: [
          {
            resource: "volition",
            perUnit: 2,
            capacityID: "volitionCapacity",
          },
        ],
        synergy: { with: "eat", multiplier: 1.2 },
      },
    ],
  },
  eat: {
    duration: 10,
    cooldown: 20,
    cost: { base: 10, need: "hunger", capacity: "hungerCapacity" },
    effects: [
      {
        targetStat: "hunger",
        rateID: "initialHungerRate",
        statDrainMultiplier: 6,
        rewards: [
          {
            resource: "volition",
            perUnit: 1.5,
            capacityID: "volitionCapacity",
          },
        ],
        synergy: { with: "drink", multiplier: 1.2 },
      },
    ],
  },
  rest: {
    duration: 35,
    cooldown: 55,
    cost: { base: 10, need: "fatigue", capacity: "fatigueCapacity" },
    effects: [
      {
        targetStat: "fatigue",
        rateID: "initialFatigueRate",
        statDrainMultiplier: 3,
        rewards: [
          {
            resource: "volition",
            perUnit: 1,
            capacityID: "volitionCapacity",
          },
        ],
      },
    ],
  },
  forage: {
    duration: 12,
    cooldown: 30,
    cost: { base: 15, need: "volition", capacity: "volitionCapacity" },
    effects: [
      {
        targetStat: "volition",
        rateID: "initialVolitionRate",
        statDrainMultiplier: 0.5,
        // No direct rewards. Items can be found while foraging.
        rewards: [],
      },
    ],
  },
};
