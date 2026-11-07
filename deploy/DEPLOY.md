# Deploying Plan B website + admin to the VPS (Contabo, Ubuntu)

Result: `https://planbfacilitymanagement.com` → landing page, `https://planbfacilitymanagement.com/admin` → admin.

```
Browser ──HTTPS──▶ Nginx (port 80/443) ──▶ Node app (127.0.0.1:4000, kept alive by PM2) ──▶ MySQL
```
Nginx is the "front door" that already serves your other domain. We add **one new site file** for this
domain. Your other site is not touched.

> Lines starting with `$` are commands to run on the VPS (type them without the `$`).
> Anything in `CAPITALS` is a value you replace.

---

## Before you start — get into the server

1. Log in to the Contabo Customer Control Panel (my.contabo.com) → **VPS / Your services**.
   Note the server's **IP address** (four numbers, e.g. `123.45.67.89`).
2. Find the server login: the Contabo email titled like *"Your login data"* has the user (usually `root`)
   and password. Lost it? Ask before using the panel's password reset — the server also runs another site.
3. On your Windows PC press **Start**, type **PowerShell**, open it, and run `ssh root@YOUR_VPS_IP`.
   - First time it asks *"Are you sure you want to continue connecting?"* → type `yes`, Enter.
   - Type the password — **nothing appears while typing, that's normal** — then Enter.
   - You're in when the prompt looks like `root@vmi123456:~#`.
   - Paste into PowerShell with **right-click**. Copy from it by selecting text and pressing Enter.
   - Leave the server with `exit`.

## Step 0 — Look before changing anything (read-only)

```bash
$ cat /etc/os-release | head -2
$ nginx -v ; apache2 -v
$ sudo ss -tlnp
$ node -v ; npm -v ; pm2 -v
$ mysql --version
$ ls /etc/nginx/sites-enabled/
$ sudo ufw status
$ free -h ; df -h /
```
Send this output to Claude before continuing. It shows which web server runs the other site, which
ports are taken (we need **4000** free), and what is already installed.

---

## Step 1 — Point the domain to the VPS (do this first: it can take 5 min – a few hours)

1. Find your VPS IP in the Contabo panel (e.g. `123.45.67.89`).
2. At the registrar where you bought the domain → DNS settings for `planbfacilitymanagement.com`:
   - Delete any existing **A** record for `@` and `www` (parking page records).
   - Add **A** record: Host `@`, Value `YOUR_VPS_IP`, TTL default/600.
   - Add **A** record: Host `www`, Value `YOUR_VPS_IP`.
3. Check from your PC: `nslookup planbfacilitymanagement.com` → should show your VPS IP.

---

## Step 2 — Put the code on GitHub (on your PC)

1. On github.com → **New repository** → name `PBFacilityManagement` → **Private** → do NOT add README → Create.
2. In the project folder on your PC (VS Code terminal):
```bash
git remote add origin https://github.com/anuradhapathirana-aws/PBFacilityManagement.git
git push -u origin main
```
`server/.env`, `node_modules` and `dist` are in `.gitignore`, so passwords never go to GitHub.

---

## Step 3 — Let the VPS read the private repo (deploy key)

```bash
$ ssh-keygen -t ed25519 -C "planbfm-vps" -f ~/.ssh/planbfm_deploy -N ""
$ cat ~/.ssh/planbfm_deploy.pub
```
Copy the printed line → GitHub repo → **Settings → Deploy keys → Add deploy key** → title `VPS`,
paste, leave "Allow write access" **off** → Add.

```bash
$ cat >> ~/.ssh/config <<'EOF'
Host github-planbfm
  HostName github.com
  User git
  IdentityFile ~/.ssh/planbfm_deploy
  IdentitiesOnly yes
EOF
$ ssh -T github-planbfm        # answer "yes"; expect "...successfully authenticated..."
```

---

## Step 4 — Install what is missing

Skip any item Step 0 showed is already installed (Node must be **20 or newer**).

```bash
> ⚠️ **This VPS also runs a live project.** Node.js 22, Nginx and MySQL 8 are already installed and
> used by it. **Do not reinstall, upgrade or downgrade them** (e.g. no NodeSource setup script).
> Plan B works on the existing Node 22. Only add what is missing:

```bash
# PM2 (keeps the app running) — new, used only by Plan B's process
$ npm install -g pm2
# Certbot + git — only if missing (check: certbot --version ; git --version)
$ apt install -y certbot python3-certbot-nginx git
```
Do **not** run `apt upgrade` as part of this — that updates every package the live project uses.

---

## Step 5 — Create the database

Make two random secrets and **save them in a password manager**:
```bash
$ openssl rand -hex 20     # → DB_PASSWORD
$ openssl rand -hex 48     # → JWT_SECRET
```
```bash
$ sudo mysql
```
```sql
CREATE DATABASE planbfm CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'planbfm_app'@'localhost' IDENTIFIED BY 'DB_PASSWORD';
GRANT ALL PRIVILEGES ON planbfm.* TO 'planbfm_app'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

---

## Step 6 — Download the code and configure it

```bash
$ sudo mkdir -p /var/www/planbfm && sudo chown $USER:$USER /var/www/planbfm
$ git clone github-planbfm:anuradhapathirana-aws/PBFacilityManagement.git /var/www/planbfm
$ cd /var/www/planbfm
$ cp server/.env.example server/.env
$ nano server/.env
```
Replace the whole file with (fill in your values; `Ctrl+O` Enter to save, `Ctrl+X` to exit):
```ini
NODE_ENV="production"
HOST="127.0.0.1"
PORT=4000
DATABASE_URL="mysql://planbfm_app:DB_PASSWORD@localhost:3306/planbfm"
CLIENT_ORIGIN="https://planbfacilitymanagement.com,https://www.planbfacilitymanagement.com"
JWT_SECRET="JWT_SECRET"
JWT_EXPIRES_IN="8h"
SEED_ADMIN_NAME="YOUR NAME"
SEED_ADMIN_EMAIL="YOUR_ADMIN_EMAIL"
SEED_ADMIN_PASSWORD="A_STRONG_PASSWORD"
SEED_DEMO_STAFF="false"
TZ_OFFSET_MINUTES=240
```
```bash
$ chmod 600 server/.env
$ npm ci
$ npm run build
$ npm run db:deploy        # creates the tables
$ npm run db:seed          # creates your admin login
```
After the first login works, remove the `SEED_ADMIN_PASSWORD` line from `server/.env`.

---

## Step 7 — Start the app with PM2

```bash
$ pm2 start deploy/ecosystem.config.cjs
$ pm2 save
$ pm2 startup              # prints ONE command starting with "sudo env PATH=..." → copy & run it
$ curl -I http://127.0.0.1:4000/        # expect: HTTP/1.1 200 OK
```
If not 200: `pm2 logs planbfm --lines 50`.

---

## Step 7b — Private test before the domain exists (optional, zero impact)

On your **PC** (new PowerShell window), open a secure tunnel to the app:
```
ssh -N -L 4000:127.0.0.1:4000 root@YOUR_VPS_IP
```
Enter the server password; the window then looks frozen — that's the tunnel running. Keep it open and visit
`http://localhost:4000` (website) and `http://localhost:4000/admin` (admin) in your browser.
Close the window (or `Ctrl+C`) to stop. Nothing on the server changes; only you can see it.

## Step 8 — Connect the domain in Nginx  *(after the domain is bought and Step 1 is done)*

```bash
$ sudo cp deploy/nginx-planbfm.conf /etc/nginx/sites-available/planbfacilitymanagement.com
$ sudo ln -s /etc/nginx/sites-available/planbfacilitymanagement.com /etc/nginx/sites-enabled/planbfacilitymanagement.com
$ sudo nginx -t            # MUST say "syntax is ok" + "test is successful"
$ sudo systemctl reload nginx
```
If `nginx -t` fails, **do not reload**. Remove the link (`sudo rm /etc/nginx/sites-enabled/planbfacilitymanagement.com`)
and ask for help. Your other site keeps running.

Open `http://planbfacilitymanagement.com` → you should see the site (no padlock yet).

---

## Step 9 — HTTPS (free SSL certificate)

Only after Step 1 DNS shows your VPS IP:
```bash
$ sudo certbot --nginx -d planbfacilitymanagement.com -d www.planbfacilitymanagement.com
```
Enter your email, agree, and choose **redirect** if asked. Certificates renew automatically
(check: `sudo certbot renew --dry-run`).

---

## Step 10 — Firewall (only if Step 0 showed `Status: inactive`)

```bash
$ sudo ufw allow OpenSSH          # FIRST — otherwise you lock yourself out
$ sudo ufw allow 'Nginx Full'
$ sudo ufw enable
```
If ufw is already active, just run `sudo ufw allow 'Nginx Full'`.

**This VPS (checked 2026-11-08):** ufw is already active and allows OpenSSH, 80 and 443 → **skip this step**.

---

## Step 11 — Check

- `https://planbfacilitymanagement.com` → landing page with padlock
- `https://planbfacilitymanagement.com/admin` → admin login → sign in
- `http://YOUR_VPS_IP:4000` from your PC → must **not** open (app is private behind Nginx)

---

## Updating the site later

On your PC: commit and `git push`. Then on the VPS:
```bash
$ bash /var/www/planbfm/deploy/deploy.sh
```

## Daily database backup (recommended)

```bash
$ mkdir -p ~/backups
$ crontab -e
```
Add this line (backs up at 2 AM, keeps 14 days). Replace DB_PASSWORD:
```
0 2 * * * mysqldump -u planbfm_app -pDB_PASSWORD --no-tablespaces planbfm | gzip > ~/backups/planbfm-$(date +\%F).sql.gz && find ~/backups -name '*.sql.gz' -mtime +14 -delete
```
Copy backups off the server now and then (e.g. WinSCP), in case the VPS itself fails.

## Useful commands

| What | Command |
|---|---|
| App status / restart | `pm2 status` · `pm2 restart planbfm` |
| App logs | `pm2 logs planbfm --lines 100` |
| Nginx errors | `sudo tail -n 50 /var/log/nginx/error.log` |
| Test Nginx config | `sudo nginx -t` |
