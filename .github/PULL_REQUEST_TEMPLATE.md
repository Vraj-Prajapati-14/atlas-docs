## Summary

<!-- 2-3 bullet points describing what changed and why -->

- 
- 

## Type of change

- [ ] Bug fix
- [ ] New feature
- [ ] Refactor
- [ ] Docs
- [ ] CI/infra
- [ ] Dependency update

## Module(s) affected

<!-- e.g. billing, inventory, auth -->

## Testing

- [ ] Unit tests added/updated
- [ ] Manual test steps performed (describe below)
- [ ] Tested against dev environment
- [ ] Tested edge cases: empty state, error state, offline

## Manual test steps

1. 
2. 

## Database changes

- [ ] No DB changes
- [ ] New migration added — tested migrate:dev locally
- [ ] Migration is zero-downtime (additive only, no column renames/drops in same PR)

## Checklist

- [ ] Code follows module boundary rules (no cross-module internal imports)
- [ ] No secrets or `.env` values committed
- [ ] BigInt used for all monetary values
- [ ] Error handling doesn't expose internal details
- [ ] Types updated in `@atlas/types` if API contracts changed
- [ ] PR title follows Conventional Commits format

## Screenshots (if UI change)

<!-- Before / After -->
