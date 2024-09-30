import Symbiote, { PubSub } from '@symbiotejs/symbiote';

// Create localization map for the English language:
const state = {
    count: 0
};

// Create localization context and set the default locale:
let ctx = PubSub.registerCtx(state, "counter");

export const inc = () => ctx.pub("count", ctx.read("count") + 1);