export const STATUS_CONFIGS = {
  drink: {
    duration: 5, // seconds
    cooldown: 10,
    cost: { base: 10, need: "thirst", capacity: "thirstCapacity" },
    effects: [
      {
        targetStat: "thirst",
        rateID: "initialThirstRate",
        statDrainMultiplier: 3,
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
    duration: 8,
    cooldown: 15,
    cost: { base: 10, need: "hunger", capacity: "hungerCapacity" },
    effects: [
      {
        targetStat: "hunger",
        rateID: "initialHungerRate",
        statDrainMultiplier: 3,
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
    duration: 25,
    cooldown: 25,
    cost: { base: 10, need: "fatigue", capacity: "fatigueCapacity" },
    effects: [
      {
        targetStat: "fatigue",
        rateID: "initialFatigueRate",
        statDrainMultiplier: 2,
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
