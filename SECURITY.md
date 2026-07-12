# Security Policy

## Supported versions

Security fixes target the latest released version and the default branch.

## Reporting a vulnerability

Please do not open a public issue for sensitive vulnerabilities. Report concerns through GitHub private vulnerability reporting if enabled, or contact the maintainers privately with:

- Affected version or commit.
- Reproduction steps.
- Impact assessment.
- Any suggested mitigation.

## Scope

In scope:

- Unsafe WebSocket, state, or telemetry handling.
- Secrets exposure in client configuration, build output, or logs.
- Dependency vulnerabilities.
- UI behavior that could misrepresent live risk or trading state in a safety-sensitive workflow.

Out of scope:

- Strategy profitability claims.
- Exchange API availability or market-data quality issues outside this package.
- Vulnerabilities requiring compromised local developer machines.

## Maintainer response target

We aim to acknowledge reports within 3 business days and provide a remediation plan or status update within 10 business days.
