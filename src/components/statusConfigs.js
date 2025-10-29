export const STATUS_CONFIGS = {
  drink: {
    duration: 4, // seconds
    cooldown: 10,
    cost: {
      material: "water",
      amount: 1,
      // Optional volition cost - set to 0 or remove if you don't want it
      volition: 0,
    },
    effects: [
      {
        targetStat: "thirst",
        rateID: "baseThirstRate",
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
    cost: {
      material: "food",
      amount: 1,
      volition: 0,
    },
    effects: [
      {
        targetStat: "hunger",
        rateID: "baseHungerRate",
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
    cost: {
      material: "fibers",
      amount: 1,
      volition: 0,
    },
    effects: [
      {
        targetStat: "fatigue",
        rateID: "baseFatigueRate",
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
    cost: {
      volition: 15,
    },
    effects: [
      {
        targetStat: "volition",
        rateID: "baseVolitionRate",
        statDrainMultiplier: 0.5,
        rewards: [],
      },
    ],
  },
};
