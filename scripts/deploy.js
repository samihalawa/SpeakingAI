import fs from 'fs/promises';
import path from 'path';
import fetch from 'node-fetch';
import { execSync } from 'child_process';

const ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;

// This function is not used anymore, as we're using Wrangler CLI for deployment.
// Keeping it here for reference, in case we need to revert back to the old approach.
async function createProject() {
  try {
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/pages/projects`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'samito',
          production_branch: 'main',
        }),
      }
    );

    const data = await response.json();
    if (!response.ok) {
      // If project already exists, that's fine
      if (data.errors?.[0]?.code === 8000007) {
        console.log('Project already exists, proceeding with deployment');
        return;
      }
      throw new Error(`Failed to create project: ${JSON.stringify(data)}`);
    }
    console.log('Project created successfully');
  } catch (error) {
    console.error('Error creating project:', error);
    throw error;
  }
}

async function deployToCloudflarePages() {
  try {
    // First, build the project
    console.log('Building the project...');
    execSync('npm run build', { stdio: 'inherit' });
    
    console.log('Deploying to Cloudflare Pages...');
    // Deploy using wrangler with production flag
    execSync('npx wrangler pages publish dist/public --project-name=samito --branch=main --production', {
      stdio: 'inherit',
      env: {
        ...process.env,
        CLOUDFLARE_API_TOKEN: process.env.CLOUDFLARE_API_TOKEN,
        CLOUDFLARE_ACCOUNT_ID: process.env.CLOUDFLARE_ACCOUNT_ID
      }
    });

    console.log('Deployment completed successfully');
  } catch (error) {
    console.error('Deployment failed:', error);
    process.exit(1);
  }
}

deployToCloudflarePages();