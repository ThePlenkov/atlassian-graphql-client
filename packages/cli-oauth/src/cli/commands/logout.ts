/**
 * Logout command
 */

import type { CLIAuth } from '../../cli-auth.js';

export async function logoutCommand<TConfig>(auth: CLIAuth<TConfig>): Promise<void> {
  await auth.logout();
  const paths = auth.getPaths();
  console.log('✅ Logged out successfully!\n');
  console.log('Your credentials have been removed from:');
  console.log(`   ${paths.tokenFile}\n`);
}

