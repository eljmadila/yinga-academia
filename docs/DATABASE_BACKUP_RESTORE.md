# Database Backup and Restore Runbook

This procedure applies to the planned Render-managed PostgreSQL database. Keep database URLs and exports in approved secret storage; never commit credentials or backup files.

## Backup policy

- Use a Render plan that supports point-in-time recovery (PITR); confirm the available recovery window and logical-backup options in the Render dashboard because these depend on the current plan.
- Create periodic logical exports from the database's Recovery page. Download exports to encrypted storage outside Render for retention beyond Render's documented export-retention period.
- Record the export timestamp, database name, PostgreSQL major version, and the associated application release.
- Before a schema-changing release, confirm a recent recoverable backup exists.

## Point-in-time recovery

1. In the Render dashboard, open the production database's Recovery page and start a PITR recovery for the required time.
2. Create a **new** recovery database. Do not overwrite or delete the current primary database.
3. Wait until the recovery database is available, then connect using its connection details from Render.
4. Validate expected records and relationships, confirm the migration state, and run application smoke tests against the recovered database.
5. Update the backend's `DATABASE_URL` in the Render environment (or shared environment group) to the recovered database URL, then redeploy/restart the backend.
6. Confirm health checks and critical user journeys. Keep the previous primary database until the team approves the recovery and the rollback window has passed.
7. Record the recovery point, validation results, connection switch, and follow-up actions.

## Logical export restore

Restore only into a **new, empty** PostgreSQL database. A logical restore can drop or replace database objects; do not run it against a database containing data that must be preserved.

1. Download the `.dir.tar.gz` export from the Render database's Recovery page and provision a separate target database.
2. Install PostgreSQL client tools compatible with the target database's major version.
3. Extract the export archive and restore it using the target's external database URL from a secured terminal session:

   ```shell
   tar -xzf <export-file>.dir.tar.gz
   pg_restore --dbname=<TARGET_DATABASE_URL> --verbose --clean --if-exists --no-owner --no-privileges --format=directory <extracted-export-directory>
   ```

4. Validate the restored data, relationships, and Django migration state. Run application smoke tests against the target before switching `DATABASE_URL`.
5. Follow steps 5-7 in the PITR procedure to switch service connections, verify recovery, and record the exercise.

## Recovery rehearsal

The first staging deployment must include a backup/export and restore rehearsal. Record the backup identifier, recovery target, validation checks, restore duration, and any procedure changes. Local SQLite tests do not satisfy this operational gate.

## Shared throttle cache

Production throttles use Django's database cache table, configured by `DJANGO_CACHE_TABLE` (default `django_cache`). Once, after applying migrations to a new PostgreSQL database, create the cache table before sending traffic:

```shell
python manage.py createcachetable django_cache
```

Use the configured `DJANGO_CACHE_TABLE` value if it differs from the default. Staging must verify that throttling state is shared across backend instances.