import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const { submitIdeaHandler } = require('../server/ideas/submit.cjs');

export default submitIdeaHandler;
