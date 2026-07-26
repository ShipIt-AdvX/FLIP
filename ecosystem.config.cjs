require('dotenv').config();

module.exports = {
  apps: [
    {
      name: 'flip-backend',
      script: 'packages/backend/src/main.ts',
      cwd: '/www/wwwroot/FLIP',
      interpreter: 'node',
      interpreterArgs: '--import tsx/esm',
      env: {
        NODE_ENV: 'production',
        OPENAI_API_KEY: process.env.OPENAI_API_KEY,
        OPENAI_BASE_URL: process.env.OPENAI_BASE_URL,
        OPENAI_API_MODEL: process.env.OPENAI_API_MODEL
      }
    }
  ]
};
