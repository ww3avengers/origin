const assistants = require('./assistants');
const categories = require('./categories');
const tokenizer = require('./tokenizer');
const endpoints = require('./endpoints');
const staticRoute = require('./static');
const messages = require('./messages');
const memories = require('./memories');
const presets = require('./presets');
const prompts = require('./prompts');
const balance = require('./balance');
const plugins = require('./plugins');
const actions = require('./actions');
const banner = require('./banner');
const search = require('./search');
const models = require('./models');
const convos = require('./convos');
const config = require('./config');
const agents = require('./agents');
const roles = require('./roles');
const oauth = require('./oauth');
const files = require('./files');
const share = require('./share');
const tags = require('./tags');
const auth = require('./auth');
const edit = require('./edit');
const keys = require('./keys');
const user = require('./user');
const mcp = require('./mcp');
const referrals = require('./referrals');
const chatbot = require('./chatbot');
const llmUsage = require('./llmUsage');
const analytics = require('./analytics');
const analyticsIngest = require('./analyticsIngest');
const analyticsBots = require('./analyticsBots');
const analyticsAdmin = require('./analyticsAdmin');
const analyticsMetrics = require('./analyticsMetrics');
const analyticsOverview = require('./analyticsOverview');
const seo = require('./seo');
// Conditionally load Stripe routes if STRIPE_SECRET_KEY is set
const stripe = process.env.STRIPE_SECRET_KEY ? require('./stripe') : null;

module.exports = {
  edit,
  auth,
  keys,
  user,
  tags,
  roles,
  oauth,
  files,
  share,
  banner,
  agents,
  convos,
  search,
  config,
  models,
  prompts,
  plugins,
  actions,
  referrals,
  presets,
  memories,
  messages,
  endpoints,
  categories,
  assistants,
  tokenizer,
  balance,
  chatbot,
  llmUsage,
  analytics,
  analyticsIngest,
  analyticsBots,
  analyticsAdmin,
  analyticsMetrics,
  analyticsOverview,
  seo,
  ...(stripe ? { stripe } : {}), // Only include stripe if it was loaded
  staticRoute,
  mcp,
};
