# AI Agents and MCP

The API serves the [Model Context Protocol](https://modelcontextprotocol.io) at `/api/mcp`, so AI agents can read and change projects, epics and issues. An agent acts as the user whose token it holds and has exactly their rights.

## Setup

Create a personal API token on the page "API tokens" in Plannr, then add the server. For Claude Code:

```sh
claude mcp add --transport http plannr https://plannr.example.com/api/mcp --header "Authorization: Bearer plannr_…"
```

Other agents take the same URL and header. The API has to be reachable from where the agent runs, see [Reverse proxy](self-hosting.md#reverse-proxy).

## Tools

| Tool            | What it does                                                                                   |
| --------------- | ---------------------------------------------------------------------------------------------- |
| `list_projects` | Lists projects, active and paused by default                                                   |
| `list_epics`    | Lists the epics of a project                                                                   |
| `list_issues`   | Lists issues of one or all projects, with the fixed views, filters, search and sorting         |
| `get_issue`     | Reads an issue with its epic, links and description                                            |
| `create_epic`   | Creates an epic                                                                                |
| `update_epic`   | Changes the name or description of an epic                                                     |
| `create_issue`  | Creates an issue, in the epic General unless another is given                                  |
| `update_issue`  | Changes title, epic, assignee, type, status, priority, due date, description, links and labels |
| `upload_image`  | Uploads an image for a description, offered when the instance has an image storage             |

Tools take keys (`WEB`, `WEB-12`), epics and labels by name, and the assignee as `me`, an email address or a full name.

Deleting epics and issues and creating projects stay in the web app on purpose: an agent cancels an issue instead of deleting it.

## Images

`upload_image` sends the image as Base64 through the agent's output, which costs tokens and in practice limits it to small images. A file on disk is better sent to the API directly, and the answer is the Markdown line for the description:

```sh
curl -H "Authorization: Bearer plannr_…" -F "file=@screenshot.png" https://plannr.example.com/api/projects/WEB/images
```
