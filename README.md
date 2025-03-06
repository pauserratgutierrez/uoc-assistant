# UOC Assistant
An AI support assistant platform for the Universitat Oberta de Catalunya (UOC) built with Docker, implementing a Retrieval Augmented Generation (RAG) approach to provide immediate support to students.

## Project Background
This project was developed as a final degree project (TFG) for the Multimedia Degree at UOC. It aims to improve the student experience by reducing wait times for support queries and providing immediate answers to common questions.

Complete Project Info: [TFG Pau Serrat Gutiérrez]()

## Architecture
The project consists of several containerized services:
- **assistant**: Built using Node.js, exposes an Express.js API server that interfaces with the OpenAI API (for AI processing and RAG functionality) as well as with the internal MySQL Database.
- **discord**: Built using Node.js, executes the Discord Bot interacting with the Discord API to provide the Discord user interface for interactive chat functionality.
- **mysql**: Database server for persistent storage of multiple data from OpenAI, Discord and Files.

## Key Features
- **Instant Responses**: Provides real-time access to UOC information
- **Context-Aware Up-to-Date Suport**: Understands the specific context of each question, providing valuable responses.
- **Reduced Response Time**: Optimizes workflow to expedite query resolution.
- **Reduced Load on Traditional Support**: Handles common queries automatically
- **Innovative Support Service**: Aligns with expectations of a modern digital environment

## Getting Started
### Prerequisites
1. Install [Docker](https://docs.docker.com/engine/install/) and [Docker Compose](https://docs.docker.com/compose/install/)
2. Setup OpenAI:
- Get an [API Key](https://help.openai.com/en/articles/4936850-where-do-i-find-my-openai-api-key)
- Setup [Prepaid Billing](https://help.openai.com/en/articles/8264644-how-can-i-set-up-prepaid-billing)
3. Setup a Discord Account:
- [Create account](https://support.discord.com/hc/en-us/articles/360033931551)
- Enable [Developer Mode](https://help.mee6.xyz/support/solutions/articles/101000482629)
4. Create a [Discord Server](https://support.discord.com/hc/en-us/articles/204849977)
5. Specific Discord Server Configuration:
- Create a normal text channel for the AI Assistant (copy Channel ID)
- Create an Admin Role (copy Role ID)
6. Setup [Discord Developers Application](https://discord.com/developers/applications)
- Create App
- Invite to Server
- Get Tokens
7. GitHub Repository for the Dataset (GH Personal Access Token)

### Configuration
1. Copy environment example file
```
cp .env.example .env
```
2. Populate it
```
nano .env
```

## Running the Application
### Develop
```
docker image prune -all
docker builder prune
docker compose build --no-cache
```

### Production
`docker compose up -d`
1. Start `mysql` (waits for its healtcheck to pass).
2. Start `assistant` (waits for its healtcheck to pass).
3. Starts `discord`.

### MySQL Scripts
```
# Do a Backup
# Stored in ./containers/mysql/backups/[DATE]/[DATABASE]-[TIME].sql.gz
docker compose exec mysql /etc/mysql/backup.sh
# Load a Backup
docker compose exec mysql /etc/mysql/restore.sh /backups/[DATE]/[DATABASE]-[TIME].sql.gz
```

### Viewing Logs
```
docker compose logs -f <service_name>
# assistant, discord or mysql
```

## Project Structure
```
containers/
├── assistant/            # Node - Express API service
│   ├── src/              # Source code
│       ├── controllers/  #
│   │   ├── models/       #
│   │   ├── routes/       # API endpoints
│   │   ├── utils/        # Utility functions
│   │   ├── app.js        # Entry point
│   │   └── config.js     #
├── discord/              # Node - Discord APP integration
│   ├── src/              # Source code
├── mysql/                # MySQL - Database
│   ├── backups/          # Dumps directory
│   ├── scripts/          # Management scripts
│   │   ├── backup.sh     # Create DB Dumps
│   │   └── restore.sh    # Import DB Dumps
│   ├── schema.sql        #
│   └── my.cnf            # Configuration
.env                      # Environment values
.env.example              # Environment template
docker-compose.yml        # Container configuration
```

## Maintenance
- The application uses healtchecks to ensure proper startup sequence.
- Services automatically restart on failure.
- Database backups can be scheduled using external cron jobs or run on demand.