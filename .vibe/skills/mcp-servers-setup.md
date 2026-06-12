# Skill: MCP Servers Setup for Claude Code

## When to Use
Extending Claude Code with external tools (MCP servers) for browser control, database access, file system operations, GitHub integration, and more.

## What is MCP?
**Model Context Protocol (MCP)** is an open standard for connecting AI assistants to external systems. Think of it as "USB-C for AI tools" — standardized way to plug in capabilities.

## Architecture
```
Claude Code (Client)
    ↕ MCP Protocol (stdio / SSE)
MCP Server (Tool Provider)
    ↕
External System (Browser, DB, GitHub, Filesystem)
```

## Installing MCP Servers

### Method 1: Claude Code CLI
```bash
# Add a server
claude mcp add <name> -- <command>

# Example: Add Playwright/Glance
claude mcp add glance -- npx glance-mcp

# Example: Add filesystem access
claude mcp add filesystem -- npx -y @modelcontextprotocol/server-filesystem /path/to/project

# List installed
claude mcp list

# Remove
claude mcp remove <name>
```

### Method 2: Settings JSON
Edit `~/.claude/settings.json`:
```json
{
  "mcpServers": {
    "glance": {
      "command": "npx",
      "args": ["glance-mcp"]
    },
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/home/user/project"]
    },
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "ghp_xxx"
      }
    },
    "postgres": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-postgres", "postgresql://localhost/mydb"]
    }
  }
}
```

### Method 3: Project-Level Config
Create `.claude/mcp.json` in project root:
```json
{
  "mcpServers": {
    "local-browser": {
      "command": "npx",
      "args": ["mare-browser-mcp"]
    }
  }
}
```

## Popular MCP Servers

| Server | Install | Purpose |
|--------|---------|---------|
| **Glance** | `npx glance-mcp` | Browser automation + screenshots |
| **Mare Browser** | `npx mare-browser-mcp` | Lightweight browser control |
| **Filesystem** | `@modelcontextprotocol/server-filesystem` | Read/write files |
| **GitHub** | `@modelcontextprotocol/server-github` | Issues, PRs, repos |
| **PostgreSQL** | `@modelcontextprotocol/server-postgres` | Query database |
| **SQLite** | `@modelcontextprotocol/server-sqlite` | Query SQLite |
| **Puppeteer** | `@modelcontextprotocol/server-puppeteer` | Chrome automation |
| **Brave Search** | `@modelcontextprotocol/server-brave-search` | Web search |

## Browser MCP Servers Comparison

### Glance (Full-Featured)
```bash
npm install -g glance-mcp
claude mcp add glance -- npx glance-mcp
```
**Tools:** browser_navigate, browser_screenshot, browser_click, browser_fill, browser_assert (12 types), visual_compare, session_record.
**Best for:** E2E testing, visual QA, regression testing.

### Mare Browser (Lean)
```bash
npm install -g mare-browser-mcp
npx playwright install chromium
claude mcp add mare -- npx mare-browser-mcp
```
**Tools:** browser_screenshot, browser_debug, browser_query, browser_act (click/hover/fill/scroll/keypress/drag).
**Best for:** Quick iteration, debugging, responsive testing.

### Browser MCP Bridge (Real Chrome)
```bash
git clone https://github.com/robhicks/browser-mcp-bridge
cd browser-mcp-bridge && npm install && npm run build
claude mcp add bridge -- node dist/server.js
```
**Requires:** Chrome extension installed.
**Best for:** Controlling your actual browser session.

## Testing MCP Connection
After adding a server, restart Claude Code and ask:

> "List available tools" — Claude will enumerate all MCP tools.

Or test directly:
```bash
claude mcp test <server-name>
```

## Building a Custom MCP Server
```ts
// mcp-server.ts
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

const server = new Server({ name: 'my-server', version: '1.0.0' });

server.setRequestHandler('tools/list', async () => ({
  tools: [
    {
      name: 'greet',
      description: 'Greet someone',
      inputSchema: {
        type: 'object',
        properties: {
          name: { type: 'string' },
        },
        required: ['name'],
      },
    },
  ],
}));

server.setRequestHandler('tools/call', async (request) => {
  if (request.params.name === 'greet') {
    const name = request.params.arguments?.name;
    return { content: [{ type: 'text', text: `Hello, ${name}!` }] };
  }
  throw new Error('Unknown tool');
});

const transport = new StdioServerTransport();
await server.connect(transport);
```

## Troubleshooting

### Server not found
```bash
# Check if command is in PATH
which npx
# If using global install, verify:
npm list -g <package-name>
```

### Permission errors
```bash
# Fix npm global permissions
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
export PATH=~/.npm-global/bin:$PATH
```

### Port conflicts
```bash
# Find what's using port 3000
lsof -i :3000
# Or on Windows
netstat -ano | findstr :3000
```

### Claude Code not seeing tools
1. Restart Claude Code completely.
2. Check `claude mcp list`.
3. Verify JSON syntax in settings.
4. Check logs: `~/.claude/logs/`.

## Security Considerations
- **Scope filesystem access** — never give root access.
- **Token storage** — use env vars, never commit secrets.
- **URL restrictions** — browser MCPs should have allowlists.
- **Rate limiting** — prevent infinite loops in automation.

## Checklist
- [ ] MCP server installed globally or locally.
- [ ] Added to Claude Code via CLI or settings.json.
- [ ] Connection tested and tools enumerated.
- [ ] Security scoped (filesystem paths, URLs, tokens).
- [ ] Logs checked for errors.
- [ ] Team members can reproduce the setup.
