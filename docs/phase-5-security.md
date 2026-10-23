# Phase 5.2 security

Target paths must remain inside the Phase 4 allowed roots and are resolved canonically. Scanner limits remain active. Protected files and protected dependency names are classified as requiring human review. Proposal generation is isolated and read-only with respect to target applications.

Threats covered include forged approvals, compromised clients, replay, expiry, revocation, stale snapshots, modified artifacts, traversal, symlink escapes, TOCTOU conflicts, partial writes, malicious source comments, command injection, and secret leakage. Controls fail closed: canonical serialization, HMAC issuer binding, exact proposal/project/file/snapshot binding, persistent replay and revocation state, canonical path checks, protected-file classification, source rechecks immediately before transaction writes, atomic temporary replacement, durable backup metadata, after-hash rollback conflict checks, and no arbitrary command execution.

Automatic application remains rejected because the MCP server has no trusted user-confirmation surface. A caller-supplied `approved` flag, approval ID, signature, or text is not consent. No credentials, environment files, keystores, or arbitrary commands are read or executed. The issuer secret must be supplied through a local secret manager or protected process environment, rotated by changing issuer identity and secret, and never returned to MCP clients or logs.

Codex's documented MCP approval prompt is useful host protection, but it does not provide this server with a cryptographic approval artifact. It is therefore not used as a substitute for the issuer contract.
