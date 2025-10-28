/**
 * Whoami command
 */

import type { CLIAuth } from '../../cli-auth.js';

export async function whoamiCommand<TConfig>(auth: CLIAuth<TConfig>): Promise<void> {
  const info = await auth.getTokenInfo();
  const config = await auth.getConfig();
  const paths = auth.getPaths();

  console.log('\n📁 Configuration:');
  console.log(`   Config dir:  ${paths.configDir}`);
  console.log(`   Config file: ${paths.configFile}`);
  console.log(`   Token file:  ${paths.tokenFile}\n`);

  if (!info.hasToken) {
    console.log('❌ Not logged in\n');
    console.log('Run: <command> auth login --help\n');
    return;
  }

  console.log('✅ Logged in\n');
  console.log('Token info:');
  
  if (info.expiresIn !== undefined) {
    const expiresInMinutes = Math.floor(info.expiresIn / 60);
    console.log(`   Expires: ${info.isExpired ? '❌ Expired' : `✅ In ${expiresInMinutes} minutes`}`);
  } else {
    console.log('   Expires: Never (API token)');
  }
  
  console.log(`   Has refresh token: ${info.hasRefreshToken ? 'Yes' : 'No'}`);

  console.log('');

  // Display config if available
  if (config) {
    console.log('Configuration:', JSON.stringify(config, null, 2));
    console.log('');
  }
}

