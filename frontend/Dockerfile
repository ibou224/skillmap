FROM node:22-alpine

WORKDIR /app

# Copie des dépendances en premier (optimise le cache)
COPY package.json package-lock.json* ./
RUN npm install

# Copie du reste du code
COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]