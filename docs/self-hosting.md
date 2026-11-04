# Self-Hosting

Plannr runs as two containers, the API and the web app, next to PostgreSQL, an OpenID Connect provider and optionally an S3 storage for images. To just try it, use the [quick start](../README.md#quick-start).

## Images

| Image                       | Port | Notes                               |
| --------------------------- | ---- | ----------------------------------- |
| `ghcr.io/rxphee/plannr-api` | 4000 | Runs pending migrations on start    |
| `ghcr.io/rxphee/plannr-web` | 3000 | The only one browsers need to reach |

Both run on `linux/amd64` and `linux/arm64`. A release tags them with its version (`0.2.0`, `0.2`) and `latest`, every push to `main` with `main` and `sha-<commit>`. Pin a deployment to a version or a digest, and use the same version for both images.

To build them yourself, run from the repository root:

```sh
docker build -f api/Dockerfile -t plannr-api .
docker build -f web/Dockerfile -t plannr-web .
```

## Configuration

### API

| Variable                                                                                        | Description                                                                                                                              |
| ----------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `POSTGRESQL_HOST`, `POSTGRESQL_PORT`, `POSTGRESQL_DB`, `POSTGRESQL_USER`, `POSTGRESQL_PASSWORD` | The database connection                                                                                                                  |
| `CORS_ALLOWED_ORIGIN`                                                                           | A regular expression for the allowed origins, e.g. `^https://plannr\.example\.com$`                                                      |
| `OIDC_ISSUER`                                                                                   | The URL of the identity provider, exactly as it names itself in its tokens                                                               |
| `OIDC_AUDIENCE`                                                                                 | The audience of its access tokens                                                                                                        |
| `SUPER_ADMIN_EMAILS`                                                                            | Comma-separated. Without it nobody can appoint admins. The identity provider has to mark the address as verified, so nobody can claim it |
| `S3_*`                                                                                          | Optional, see [Image storage](#image-storage)                                                                                            |

### Web App

| Variable             | Description                                                                              |
| -------------------- | ---------------------------------------------------------------------------------------- |
| `API_URL`            | The API as the web container reaches it, e.g. `http://api:4000/api`                      |
| `WEB_URL`            | The public URL of the web app                                                            |
| `OIDC_ISSUER`        | Same as for the API                                                                      |
| `OIDC_CLIENT_ID`     | The client of the web app at the identity provider                                       |
| `OIDC_CLIENT_SECRET` | Its secret                                                                               |
| `SESSION_SECRET`     | At least 32 random characters that encrypt the session cookie: `openssl rand -base64 48` |

## Identity Provider

Plannr handles no passwords, users sign in through OpenID Connect and get their account on the first login. It is built to work with any provider that meets the requirements below, and it runs with [Zitadel](https://zitadel.com).

The provider needs:

- A confidential client for the web app using the authorization code flow, with refresh tokens and the scopes `openid profile email offline_access`.
- The redirect URI `<WEB_URL>/auth/callback` and the post-logout redirect URI `<WEB_URL>/`.
- **Access tokens as JWTs** with the audience `OIDC_AUDIENCE`, as the API validates them itself.
- A userinfo endpoint with `email`, `given_name` and `family_name`, plus `email_verified` for the super-admin.

### With Zitadel

1. Create a project. Its resource ID is your `OIDC_AUDIENCE`.
2. Add a web application with the authentication method "Code", which gives you the client ID and secret.
3. Enter the redirect URIs from above and turn on the grant types Authorization Code and Refresh Token.
4. Set the **auth token type to JWT**. With the default opaque tokens the API rejects every login.

## Reverse Proxy

Put the web app behind a proxy with TLS. The browser never talks to the API directly, so the API only needs to be reachable from outside for AI agents (`/api/mcp`) and scripts with an API token.

## Image Storage

Images in descriptions are stored in any S3-compatible storage, such as Garage, MinIO or AWS S3. Without `S3_ENDPOINT` the instance has no image uploads, and everything else works as usual.

| Variable                                   | Description                                                      |
| ------------------------------------------ | ---------------------------------------------------------------- |
| `S3_ENDPOINT`, `S3_REGION`, `S3_BUCKET`    | Where the images go                                              |
| `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY` | A key for that bucket                                            |
| `S3_FORCE_PATH_STYLE`                      | `true` for Garage and MinIO, which expect the bucket in the path |

To check the storage, run this in the API container. It writes, reads and deletes a test object:

```sh
node dist/console.js storage:check
```

The API deletes images that no description links to anymore every night at 01:00 (server time), once they are older than a day.

## Backup

Back up the PostgreSQL database (`pg_dump`) and the S3 bucket, for example with `rclone`. Your identity provider needs its own backup.

Owners and admins can also download a single project as a ZIP file under "Export" in the project settings, with `project.json` and the images. Scripts fetch the same file with an API token:

```sh
curl -OJ -H "Authorization: Bearer plannr_…" https://plannr.example.com/api/projects/WEB/export
```

## Upgrading

Change the version of both images and restart them, the API brings the database up to date by itself. Migrations only run forward, so take a backup first: to go back to an older version, you restore it.
