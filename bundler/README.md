# Bootstrapp Bundler

The bundler module handles building and deploying your Bootstrapp applications to various targets.

## Deployment Targets

| Target | Description | Credentials Required |
|--------|-------------|---------------------|
| **localhost** | Local build served via Caddy | None |
| **vps** | Deploy to VPS with Docker + Caddy | Host, Domain, SSH |
| **github** | GitHub Pages | Token |
| **cloudflare** | Cloudflare Workers | Account ID, API Token |
| **zip** | Download as ZIP | None |
| **targz** | Download as TAR.GZ | None |

## Local Development with Caddy

When you "Deploy Locally", the bundler serves your build using **Caddy** locally. This ensures you're testing with the exact same server configuration as production.

### Prerequisites

Install Caddy locally: https://caddyserver.com/docs/install

```bash
# macOS
brew install caddy

# Ubuntu/Debian
sudo apt install caddy

# Windows (with Chocolatey)
choco install caddy
```

### How It Works

1. **Deploy Locally** creates a versioned build in `.deployed/builds/{timestamp}/`
2. A `Caddyfile` is generated in `.deployed/Caddyfile`
3. Caddy spawns and serves from `.deployed/current/` on port `{devPort + 1000}` (e.g., 2315)
4. Caddy logs are streamed to your terminal

If Caddy is not installed, it falls back to a Node.js HTTP server.

### Local Caddyfile

```caddyfile
:2315 {
    root * /path/to/.deployed/current
    encode gzip zstd
    try_files {path} {path}/ /index.html
    file_server
    log {
        output stdout
        format console
    }
}
```

Key differences from production:
- Uses port (`:2315`) instead of domain
- No HTTPS (local dev)
- Logs to stdout (visible in terminal)

## Versioned Builds

Deployments use versioned builds with automatic cleanup:

```
.deployed/
├── current -> builds/20241216-143052/   # symlink to latest
└── builds/
    ├── 20241216-143052/   # latest
    ├── 20241215-091234/   # previous
    └── 20241214-163421/   # older (max 5 kept)
```

Each "Deploy Locally" creates a new timestamped build. The `current` symlink always points to the latest.

---

## Deploying to VPS with Docker

Deploy your Bootstrapp app to any VPS with automatic HTTPS via Caddy running in Docker.

### Why Docker?

- **Easy rebuild**: `docker compose down && docker compose up -d --build`
- **No VM recreation needed**: Just rebuild the container
- **Persistent data**: Volumes for certs, logs, site files
- **Reproducible**: Same setup locally and on VPS
- **Isolation**: Caddy runs in container, host stays clean
- **Custom modules**: Caddy built with Cloudflare module via xcaddy

### Prerequisites

1. A VPS (Hetzner, DigitalOcean, AWS, Linode, etc.)
2. SSH key access to the server
3. A domain pointing to your server's IP
4. rsync installed locally

### Quick Start

#### 1. Build Locally First

Click **"Deploy Locally"** in Admin > Bundler to create a production build.

#### 2. Configure VPS Credentials

Go to the **Credentials** tab and enter:

| Field | Description | Example |
|-------|-------------|---------|
| Server Host/IP | Your VPS IP or hostname | `203.0.113.10` |
| SSH User | Usually `root` or your sudo user | `root` |
| SSH Key Path | Path to your private key | `~/.ssh/id_rsa` |
| Domain | Your domain (must point to VPS) | `myapp.com` |
| Remote Path | Where to store files | `/var/www` |

#### 3. First-Time Setup

Check **"Run Initial Setup"** to install Docker on your VPS. This:
- Installs Docker via the official install script
- Creates the site directory structure
- Uploads Docker configuration files (Dockerfile, docker-compose.yml, Caddyfile)
- Builds a custom Caddy image with Cloudflare module
- Starts the container with automatic HTTPS via Let's Encrypt

#### 4. Deploy Options

| Option | When to Use |
|--------|-------------|
| **Run Initial Setup** | First deployment only (installs Docker) |
| **Restart Caddy** | After Caddyfile changes |
| **Rebuild Caddy** | After Dockerfile or docker-compose.yml changes |
| **Neither** | Content-only updates (default, fastest) |

#### 5. Deploy

Select a build from the dropdown and click **"Deploy"**.

Your app will be live at `https://yourdomain.com` within seconds.

### Remote Directory Structure

```
/var/www/example.com/
├── docker-compose.yml    # Container configuration
├── Dockerfile            # Custom Caddy with Cloudflare module
├── Caddyfile             # Server configuration
├── current -> builds/20241216-143052/   # Caddy serves from here
├── builds/
│   ├── 20241216-143052/
│   ├── 20241215-091234/
│   └── 20241214-163421/
├── data/
│   └── caddy/            # SSL certificates (persistent)
└── logs/
    └── caddy/            # Access and error logs
```

### Docker Configuration

#### Dockerfile (Custom Caddy with Cloudflare module)

```dockerfile
FROM caddy:builder AS builder
RUN xcaddy build --with github.com/caddy-dns/cloudflare

FROM caddy:latest
COPY --from=builder /usr/bin/caddy /usr/bin/caddy
```

#### docker-compose.yml

```yaml
version: "3.8"
services:
  caddy:
    build: .
    container_name: caddy-example-com
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile:ro
      - ./current:/srv:ro
      - ./data/caddy:/data
      - ./logs/caddy:/var/log/caddy
    environment:
      - DOMAIN=example.com
```

#### Caddyfile

```caddyfile
example.com {
    root * /srv
    encode gzip zstd
    trusted_proxies cloudflare

    try_files {path} {path}/ /index.html
    file_server

    header {
        X-Frame-Options "SAMEORIGIN"
        X-Content-Type-Options "nosniff"
        X-XSS-Protection "1; mode=block"
        Referrer-Policy "strict-origin-when-cross-origin"
        Strict-Transport-Security "max-age=31536000; includeSubDomains"
        -Server
    }

    log {
        output file /var/log/caddy/access.log
        format json
    }

    handle_errors {
        log {
            output file /var/log/caddy/error.log
            format json
        }
        respond "{http.error.status_code} {http.error.status_text}"
    }

    @static {
        path *.css *.js *.ico *.gif *.jpg *.jpeg *.png *.svg *.woff *.woff2 *.webp
    }
    header @static Cache-Control "public, max-age=31536000, immutable"

    @dynamic {
        path *.html *.json /
    }
    header @dynamic Cache-Control "no-cache, no-store, must-revalidate"
}
```

### Rollback

To rollback to a previous version:
1. Select an older build from the dropdown
2. Click "Deploy"

The `current` symlink will be updated to point to the selected build.

---

## Security Features

The VPS deployment includes production-ready security:

### Headers
- **HSTS** - Forces HTTPS for 1 year
- **X-Frame-Options** - Prevents clickjacking
- **X-Content-Type-Options** - Prevents MIME sniffing
- **Referrer-Policy** - Controls referrer information
- **Server header removed** - Hides server info

### Logging
- **Access logs**: `/var/www/{domain}/logs/caddy/access.log` (JSON)
- **Error logs**: `/var/www/{domain}/logs/caddy/error.log` (JSON)

### Cloudflare Support
Caddy is built with the Cloudflare module for proper client IP handling behind Cloudflare proxy. The `trusted_proxies cloudflare` directive ensures rate limiting and IP blocking work with real client IPs, not Cloudflare's.

### View Logs

```bash
# Access logs
tail -f /var/www/myapp.com/logs/caddy/access.log | jq .

# Error logs
tail -f /var/www/myapp.com/logs/caddy/error.log | jq .

# Docker container logs
docker logs -f caddy-myapp-com
```

---

## Troubleshooting

### SSH Connection Failed

```bash
# Verify SSH key permissions
chmod 600 ~/.ssh/id_rsa

# Test connection manually
ssh -i ~/.ssh/id_rsa user@host

# Ensure key is authorized on server
cat ~/.ssh/id_rsa.pub >> ~/.ssh/authorized_keys  # on server
```

### SSL Certificate Not Working

1. Ensure domain DNS is pointing to server IP
2. Check ports 80/443 are open:
   ```bash
   ufw allow 80,443/tcp
   ```
3. View container logs:
   ```bash
   docker logs caddy-myapp-com
   ```

### Rsync Failed

```bash
# Install rsync on server
apt install rsync

# Test manually
rsync -avz -e ssh ./test user@host:/tmp/
```

### Docker Container Issues

```bash
# Check container status
docker ps -a | grep caddy

# View container logs
docker logs caddy-myapp-com

# Restart container
cd /var/www/myapp.com && docker compose restart

# Rebuild container (after config changes)
cd /var/www/myapp.com && docker compose down && docker compose build --no-cache && docker compose up -d

# Check Caddyfile syntax
docker exec caddy-myapp-com caddy validate --config /etc/caddy/Caddyfile
```

### Manual Docker Setup

If you prefer to set up Docker manually:

```bash
# Install Docker
curl -fsSL https://get.docker.com | sh

# Create site directory
mkdir -p /var/www/myapp.com/{builds,data/caddy,logs/caddy}

# Copy Dockerfile, docker-compose.yml, and Caddyfile to /var/www/myapp.com/

# Build and start
cd /var/www/myapp.com
docker compose up -d --build
```

---

## API Reference

### Build Endpoints (CLI Server)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/deploy` | POST | Deploy files to versioned build |
| `/vps/builds` | GET | List available builds |
| `/vps/deploy` | POST | Deploy build to VPS |
| `/_deployed/*` | GET | Serve files from current build |

### `/deploy` Request

```json
{
  "files": [
    { "path": "index.html", "content": "...", "encoding": "utf8" },
    { "path": "app.js", "content": "...", "encoding": "base64" }
  ]
}
```

### `/vps/deploy` Request

```json
{
  "host": "203.0.113.10",
  "user": "root",
  "sshKeyPath": "~/.ssh/id_rsa",
  "domain": "myapp.com",
  "remotePath": "/var/www",
  "buildId": "20241216-143052",
  "runSetup": false,
  "restartCaddy": false,
  "rebuildCaddy": false
}
```
