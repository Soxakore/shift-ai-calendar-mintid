# GitHub MCP Setup Instructions

## Step 1: Get your GitHub token from: https://github.com/settings/tokens

## Step 2: Replace "your_github_token_here" in the config file with your actual token

Example of what the github section should look like after you add your token:

```json
"github": {
  "command": "npx",
  "args": [
    "-y",
    "@modelcontextprotocol/server-github"
  ],
  "env": {
    "GITHUB_PERSONAL_ACCESS_TOKEN": "ghp_your_actual_token_here"
  }
}
```

## Step 3: Restart Claude Desktop

After updating the token, restart Claude Desktop to activate the GitHub MCP server.

## GitHub MCP Capabilities

Once configured, Claude will be able to:
- 📁 Browse your repositories
- 📝 Read repository contents
- 🔍 Search code across repositories  
- 📊 View repository information
- 🌿 List branches and commits
- 📋 Read issues and pull requests
- 📈 View repository statistics

## Security Note

Keep your GitHub token secure and never share it publicly. This token gives access to your GitHub repositories based on the scopes you selected.
