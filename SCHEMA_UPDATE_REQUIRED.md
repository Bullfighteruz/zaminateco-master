# Prisma Schema Update Required

## Changes Made

The Vote model has been updated to include the required fields:

1. **`location`** (String, optional, Text type) - Location where the vote was cast
2. **`impactArea`** (ImpactArea enum, optional) - Area impacted by the project
3. **`voteDate`** (DateTime) - Date when the vote was cast

## ImpactArea Enum

```prisma
enum ImpactArea {
  SCHOOL
  PARK
  MAHALLA
  KINDERGARTEN
  HOSPITAL
  STREET
  OTHER
}
```

## Migration Required

After updating the schema, run:

```bash
cd backend
npx prisma migrate dev --name add_vote_location_impact_area
npx prisma generate
```

This will:
1. Add the new fields to the Vote table
2. Add the ImpactArea enum
3. Regenerate Prisma Client with the new types

## Backward Compatibility

- Existing votes will have `null` for `location` and `impactArea`
- The fields are optional, so existing code will continue to work
- New votes will automatically populate these fields based on project category

