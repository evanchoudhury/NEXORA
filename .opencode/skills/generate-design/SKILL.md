---
name: generate-design
description: Generate UI designs, mockups, design systems, and responsive screens using Google Stitch MCP tools.
---

# Generate Design Skill

Use this skill when designing UI components, full-page screen mockups, responsive layouts, or cohesive design systems using Stitch MCP tools.

## Available Stitch MCP Tools

The Stitch server provides the following lazy-loaded MCP tools:
- `stitch_create_project`: Initializes a container project for UI designs.
- `stitch_list_projects`: Lists existing Stitch design projects.
- `stitch_get_project`: Retrieves project details and associated screen assets.
- `stitch_create_design_system`: Defines color palettes, typography, roundness, and appearance tokens.
- `stitch_update_design_system`: Applies and saves design systems for a project.
- `stitch_list_design_systems`: Lists existing design systems.
- `stitch_apply_design_system`: Attaches an existing design system to a project or screen.
- `stitch_generate_screen_from_text`: Synthesizes screen designs from natural language descriptions.
- `stitch_edit_screens`: Modifies specific elements or layout sections of existing screens.
- `stitch_generate_variants`: Creates alternative visual directions for an existing screen.
- `stitch_list_screens`: Retrieves all screens generated under a project.
- `stitch_get_screen`: Fetches screen details, HTML/CSS code, and visual components.

---

## Standard Workflow

### 1. Initialize or Locate Project
Before generating screens, ensure a Stitch project exists:
```json
{
  "ServerName": "stitch",
  "ToolName": "create_project",
  "Arguments": {
    "title": "NEXORA Marketplace"
  }
}
```
Record the returned `projectId`.

### 2. Configure Design System
Establish typography, branding colors, and component roundness:
```json
{
  "ServerName": "stitch",
  "ToolName": "create_design_system",
  "Arguments": {
    "projectId": "<PROJECT_ID>",
    "designSystem": {
      "displayName": "NEXORA Premium Dark",
      "theme": {
        "colorMode": "DARK",
        "customColor": "#6366f1",
        "headlineFont": "PLUS_JAKARTA_SANS",
        "bodyFont": "INTER",
        "roundness": "ROUND_TWELVE"
      }
    }
  }
}
```

### 3. Generate Screen from Prompt
Generate high-fidelity UI layouts using descriptive prompts:
```json
{
  "ServerName": "stitch",
  "ToolName": "generate_screen_from_text",
  "Arguments": {
    "projectId": "<PROJECT_ID>",
    "prompt": "Modern luxury e-commerce product detail page with high-res photo gallery, price breakdown, cryptocurrency checkout option, user reviews, and recommended products slider.",
    "deviceType": "DESKTOP"
  }
}
```

### 4. Fetch and Inspect Screen Code
Retrieve the generated markup and CSS tokens:
```json
{
  "ServerName": "stitch",
  "ToolName": "get_screen",
  "Arguments": {
    "projectId": "<PROJECT_ID>",
    "screenId": "<SCREEN_ID>"
  }
}
```

---

## Best Practices
- **Design Tokens First**: Always configure or supply a `designSystem` ID to ensure visual harmony across screens.
- **Specific Prompts**: Detail header navigation, hero sections, product grids, call-to-action buttons, and footer links in the prompt.
- **Handling Timeouts**: Screen generation can take up to 60-90 seconds. If a timeout occurs, do not immediately retry generation; poll using `get_screen` with the resulting identifier.
