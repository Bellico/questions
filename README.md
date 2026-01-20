This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Environment Variables

#### Create a **`.env`** file

```bash
# You can use https://neon.tech/
DATABASE_URL = "postgresql://*******"

# https://resend.com/
RESEND_API_KEY = "*******"

# For production https://next-auth.js.org/configuration/options
# Example : openssl rand -base64 32
NEXTAUTH_SECRET = "*******"

# Use for generate share link
PUBLIC_URL = "https://yourdomain.com"

# Use for magic link
NO_REPLY = "noreply@questions-editor.fr"
```

## Use a local database

#### Create a postgre database with docker

```
docker run --name postgres -e POSTGRES_DB=questions -e POSTGRES_USER=Bellico -e POSTGRES_PASSWORD=***** -p 5432:5432 -d postgres
```

#### Override **`.env`** with a **`.env.local`**

```bash
DATABASE_URL = "postgresql://Bellico:*****@localhost:5432/questions"
```

#### Migrate the local database

```bash
npx prisma migrate deploy
(npx prisma db seed)
```

## Use docker-compose

#### Override **`.env`** with a **`.env.docker`**

```bash
# Service postgres
POSTGRES_HOST = "questions-base"
POSTGRES_DB = "questions"
POSTGRES_USER = "Bellico"
POSTGRES_PASSWORD = "*******"

# Service next-app
DATABASE_URL = postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:5432/${POSTGRES_DB}

# If your app is deployed
NEXTAUTH_URL = "yourdomain.com"
```

#### Build from docker-compose.yml

```bash
docker-compose -f docker-compose.yml up -d --build

# app
# docker build -t bellico/questions-editor:latest .
# docker push bellico/questions-editor:latest

# jobs
# docker build -t bellico/questions-editor-jobs:latest -f Dockerfile.jobs .
# docker push bellico/questions-editor-jobs:latest
```

## Run project


```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Update prisma schema

```bash
npx prisma validate
npx prisma migrate dev --name migration_name
npx prisma migrate deploy or npx prisma db push
(npx prisma generate)
```
### Reset database

```bash
npx prisma migrate reset
```
### Squashing migrations

```bash
# > Delete migrations folder
npx prisma migrate dev --name init --create-only
npx prisma migrate resolve --applied xxxx_init
```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
