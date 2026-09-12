# Reality Resolver — Decision-Gated Calling

Reality Resolver is the Decision Cockpit frontend for the CALL-E hackathon. It presents the backend's decision path from evidence through reasoning and call authorization to compliance, CALL-E execution, reconciliation, and the final verdict/action.

## Architecture

The frontend is built with TanStack Start, React, TypeScript, and Tailwind CSS. The backend Reality Resolver remains the source of truth for:

```text
evidence → reasoning → call decision → compliance → CALL-E → reconciliation → verdict/action
```

The public demonstration uses the backend's deterministic fake provider and always sends `execution_mode: "fake"`. It does not place real calls. The backend also has a separate guarded live CALL-E path, which is not exposed by this frontend.

## Local development

```sh
npm install
npm run dev
npm run build
```

Copy `.env.example` to `.env` for a local or hosted configuration. The browser needs no CALL-E credential.

## Configuration

| Variable | Purpose |
| --- | --- |
| `VITE_USE_MOCK` | Set to `false` to use the backend API; `true` uses the local UI mock. |
| `VITE_API_BASE_URL` | Public base URL of the Reality Resolver backend. Leave empty when using the local proxy. |
| `NITRO_PRESET` | TanStack Start/Nitro deployment preset, such as `render-com`. |
| `HOST` | Host binding for the production server, normally `0.0.0.0`. |

No API key, phone number, or live-call credential belongs in this repository or in browser environment variables.
