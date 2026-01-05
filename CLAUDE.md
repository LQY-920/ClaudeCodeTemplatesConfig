# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a new project with empty `frontend/` and `backned/` (backend) directories awaiting implementation.

## Project Structure

```
D:\CCProject\
├── frontend/          # Frontend application (empty, awaiting setup)
├── backned/           # Backend application (note: typo in directory name)
├── .claude/           # Claude Code skills and configuration
│   ├── skills/
│   │   ├── frontend-design/   # Frontend design skill
│   │   ├── skill-creator/     # Skill creation guidance
│   │   └── xlsx/              # Excel/spreadsheet operations
│   └── settings.json
├── .mcp.json          # MCP server configuration (chrome-devtools)
└── cc.bat             # Claude Code launcher script
```

## Available Skills

The `.claude/skills/` directory contains three skills:

1. **frontend-design**: Use when building web components, pages, or applications with distinctive, production-grade UI design
2. **skill-creator**: Use when creating new skills or updating existing skills
3. **xlsx**: Use when working with spreadsheets (.xlsx, .csv, etc.) for creation, editing, or analysis

## MCP Servers

The project has the Chrome DevTools MCP server configured in `.mcp.json`, which enables browser automation and testing capabilities.

## Development Setup

This project has not been initialized yet. When setting up development:

1. Choose frontend framework (React, Vue, etc.) and add to `frontend/`
2. Choose backend framework (Node.js, Python, etc.) and add to `backned/`
3. Consider fixing the typo: `backned/` → `backend/`
4. Update this file with build, test, and development commands
