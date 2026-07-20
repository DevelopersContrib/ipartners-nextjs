/**
 * Agent Capabilities Configuration
 *
 * Defines the capabilities exposed via /.well-known/agent.json
 * for AI agent discovery (OpenAI, Claude, VBot, etc.)
 *
 * Reusable across all VNOC domains — just update the capabilities array
 * and environment variables for each domain.
 */

export interface AgentCapability {
  name: string;
  description: string;
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  parameters?: {
    name: string;
    type: string;
    required: boolean;
    description: string;
  }[];
}

export interface AgentCard {
  name: string;
  description: string;
  url: string;
  version: string;
  capabilities: AgentCapability[];
  authentication: {
    type: 'none' | 'apiKey' | 'oauth';
    details?: string;
  };
  provider: {
    name: string;
    url: string;
  };
}

/**
 * Define all capabilities this domain exposes to AI agents.
 * Each capability maps to a real API endpoint.
 */
export const capabilities: AgentCapability[] = [
  {
    name: 'get_countries',
    description: 'Retrieve the list of supported countries for partnership applications.',
    endpoint: '/api/countries',
    method: 'GET',
  },
  {
    name: 'get_site_config',
    description: 'Retrieve site configuration including domain info and form options (roles, industries, experience levels, intentions).',
    endpoint: '/api/config',
    method: 'GET',
  },
  {
    name: 'verify_invite',
    description: 'Verify an invitation code and retrieve invite details for pre-filling a partnership application.',
    endpoint: '/api/invite',
    method: 'GET',
    parameters: [
      { name: 'id', type: 'string', required: true, description: 'The invitation code to verify' },
      { name: 'type', type: 'string', required: false, description: 'Invite type: "standard" (default) or "app"' },
    ],
  },
];

/**
 * Build the full agent card JSON.
 * Uses environment variables with sensible defaults.
 */
export function buildAgentCard(): AgentCard {
  const name = process.env.DOMAIN_NAME || process.env.NEXT_PUBLIC_DOMAIN || 'iPartner';
  const description =
    process.env.SITE_DESCRIPTION ||
    'iPartner is a partnership platform for creating structured equity-based collaborations across domain, app, leader, and product/service partnerships.';
  const url = process.env.BASE_URL || process.env.NEXT_PUBLIC_BASE_URL || 'https://ipartner.com';

  return {
    name,
    description,
    url,
    version: '1.0',
    capabilities,
    authentication: {
      type: 'none',
      details: 'Public API endpoints. No authentication required for discovery.',
    },
    provider: {
      name: 'VNOC / VentureBuilder',
      url: 'https://vnoc.com',
    },
  };
}
