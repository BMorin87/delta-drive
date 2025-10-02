export const STATUS_CONFIGS = {
  drink: {
    duration: 5, // seconds
    cooldown: 15,
    cost: { base: 10, need: "thirst", capacity: "thirstCapacity" },
    effects: [
      {
        target: "thirst",
        rateKey: "initialThirstRate",
        reductionMultiplier: 3,
        rewards: [
          {
            resource: "volition",
            perUnit: 2,
            capacityKey: "volitionCapacity",
          },
        ],
        synergy: { with: "eat", multiplier: 1.2 },
      },
    ],
  },
  eat: {
    duration: 8,
    cooldown: 20,
    cost: { base: 10, need: "hunger", capacity: "hungerCapacity" },
    effects: [
      {
        target: "hunger",
        rateKey: "initialHungerRate",
        reductionMultiplier: 3,
        rewards: [
          {
            resource: "volition",
            perUnit: 1.5,
            capacityKey: "volitionCapacity",
          },
        ],
        synergy: { with: "drink", multiplier: 1.2 },
      },
    ],
  },
  rest: {
    duration: 10,
    cooldown: 25,
    cost: { base: 10, need: "fatigue", capacity: "fatigueCapacity" },
    effects: [
      {
        target: "fatigue",
        rateKey: "initialFatigueRate",
        reductionMultiplier: 2,
        rewards: [
          {
            resource: "volition",
            perUnit: 1,
            capacityKey: "volitionCapacity",
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
        target: "volition",
        rateKey: "initialVolitionRate",
        reductionMultiplier: 0.5,
        // No direct rewards. Items can be found while foraging.
        rewards: [],
      },
    ],
  },
};
