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

## Step 0 — Look before changing anything (read-only)

Connect: on Windows, open PowerShell → `ssh root@YOUR_VPS_IP` (or your user instead of root).

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

1. On github.com → **New repository** → name `planb-website` → **Private** → do NOT add README → Create.
2. In the project folder on your PC (VS Code terminal):
```bash
git remote add origin https://github.com/YOUR_GITHUB_USER/planb-website.git
git push -u origin main
```
`server/.env`, `node_modules` and `dist` are in `.gitignore`, so passwords never go to GitHub.

---

## Step 3 — Let the VPS read the private repo (deploy key)

```bash
$ ssh-keygen -t ed25519 -C "planb-vps" -f ~/.ssh/planb_deploy -N ""
$ cat ~/.ssh/planb_deploy.pub
```
Copy the printed line → GitHub repo → **Settings → Deploy keys → Add deploy key** → title `VPS`,
paste, leave "Allow write access" **off** → Add.

```bash
$ cat >> ~/.ssh/config <<'EOF'
Host github-planb
  HostName github.com
  User git
  IdentityFile ~/.ssh/planb_deploy
  IdentitiesOnly yes
EOF
$ ssh -T github-planb        # answer "yes"; expect "...successfully authenticated..."
```

---

## Step 4 — Install what is missing

Skip any item Step 0 showed is already installed (Node must be **20 or newer**).

```bash
$ sudo apt update
# Node.js 20
$ curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
$ sudo apt install -y nodejs
# PM2 (keeps the app running)
$ sudo npm install -g pm2
# Nginx, MySQL, Certbot, git
$ sudo apt install -y nginx mysql-server certbot python3-certbot-nginx git
```

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
CREATE DATABASE cleaningos CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'planb_app'@'localhost' IDENTIFIED BY 'DB_PASSWORD';
GRANT ALL PRIVILEGES ON cleaningos.* TO 'planb_app'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

---

## Step 6 — Download the code and configure it

```bash
$ sudo mkdir -p /var/www/planb && sudo chown $USER:$USER /var/www/planb
$ git clone github-planb:YOUR_GITHUB_USER/planb-website.git /var/www/planb
$ cd /var/www/planb
$ cp server/.env.example server/.env
$ nano server/.env
```
Replace the whole file with (fill in your values; `Ctrl+O` Enter to save, `Ctrl+X` to exit):
```ini
NODE_ENV="production"
HOST="127.0.0.1"
PORT=4000
DATABASE_URL="mysql://planb_app:DB_PASSWORD@localhost:3306/cleaningos"
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
If not 200: `pm2 logs planb --lines 50`.

---

## Step 8 — Connect the domain in Nginx

```bash
$ sudo cp deploy/nginx-planb.conf /etc/nginx/sites-available/planb
$ sudo ln -s /etc/nginx/sites-available/planb /etc/nginx/sites-enabled/planb
$ sudo nginx -t            # MUST say "syntax is ok" + "test is successful"
$ sudo systemctl reload nginx
```
If `nginx -t` fails, **do not reload**. Remove the link (`sudo rm /etc/nginx/sites-enabled/planb`)
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

---

## Step 11 — Check

- `https://planbfacilitymanagement.com` → landing page with padlock
- `https://planbfacilitymanagement.com/admin` → admin login → sign in
- `http://YOUR_VPS_IP:4000` from your PC → must **not** open (app is private behind Nginx)

---

## Updating the site later

On your PC: commit and `git push`. Then on the VPS:
```bash
$ bash /var/www/planb/deploy/deploy.sh
```

## Daily database backup (recommended)

```bash
$ mkdir -p ~/backups
$ crontab -e
```
Add this line (backs up at 2 AM, keeps 14 days). Replace DB_PASSWORD:
```
0 2 * * * mysqldump -u planb_app -pDB_PASSWORD --no-tablespaces cleaningos | gzip > ~/backups/cleaningos-$(date +\%F).sql.gz && find ~/backups -name '*.sql.gz' -mtime +14 -delete
```
Copy backups off the server now and then (e.g. WinSCP), in case the VPS itself fails.

## Useful commands

| What | Command |
|---|---|
| App status / restart | `pm2 status` · `pm2 restart planb` |
| App logs | `pm2 logs planb --lines 100` |
| Nginx errors | `sudo tail -n 50 /var/log/nginx/error.log` |
| Test Nginx config | `sudo nginx -t` |
