# DesignForge AI Phase 5.3

## Trusted confirmation decision

Official OpenAI documentation describes MCP tool-call approval prompts and destructive/read-only annotations. Those prompts are host-side safety controls; annotations influence host behavior but do not replace server authorization. No documented Codex API exposes a signed, issuer-identified approval artifact to this local MCP server. Therefore DesignForge does not infer approval from chat text, tool arguments, `approved: true`, caller-generated IDs, or MCP annotations.

`designforge_apply_approved_ui` remains disabled. The host-side `issueWithHumanConfirmation` API is testable only when a trusted host supplies the confirmation callback and a protected issuer secret. The MCP server does not expose that callback or secret. This is an intentional BLOCKED integration state.

## Disposable end-to-end harness

The test-only flow covers the safe portion of scan → proposal artifact → preview evidence → impact analysis → issuer callback → approval validation → transactional write → rollback conflict checks. Flutter rendering and golden comparison are separately verified by the Phase 5.1 disposable fixture. The test issuer uses an isolated temporary root and test-only secret; it is not evidence of genuine human approval.

## Security gates

Approvals use canonical serialization, issuer identity, HMAC binding, expiry, persistent single-use state, revocation, exact project/file/snapshot binding, and no secret serialization. Transactions use canonical root checks, protected-file rejection, expected source hashes, atomic temporary replacement, backups, before/after hashes, and conflict-preserving rollback.

## Production status

Production application writes remain disabled. Enabling them requires a separately reviewed trusted Codex confirmation integration, explicit disposable-root authorization, allowlisted validation commands, crash recovery verification, and a human-reviewed security change.
