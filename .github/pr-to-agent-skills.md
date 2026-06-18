# PR to vercel-labs/agent-skills

## Description
Adds `bazileros-payfast` skill — PayFast payment gateway integration for Convex apps.

## Files

### `skills/bazileros-payfast/SKILL.md`

Contents: same as `skills/bazileros-payfast/SKILL.md` in this repo.

### Update `skills.sh.json`

Add entry to the groupings array:
```json
{
  "title": "Payments",
  "description": "Skills for payment gateway integrations.",
  "skills": ["bazileros-payfast"]
}
```

## Steps

1. Fork https://github.com/vercel-labs/agent-skills
2. Create `skills/bazileros-payfast/SKILL.md` (copy from this repo)
3. Edit `skills.sh.json` to add the grouping
4. PR to vercel-labs/agent-skills:main
