const TEMPLATE_TOKEN_COST = {
  reddit:    8,
  dialogue:  10,
  voiceover: 5,
  lipsync:   25,
  avatar:    20,
  captions:  3,
};

const getTokenCost = (template) => TEMPLATE_TOKEN_COST[template] ?? 5;

module.exports = { TEMPLATE_TOKEN_COST, getTokenCost };