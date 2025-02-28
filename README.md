# UOC Assistant
An AI support assistant platform for the Universitat Oberta de Catalunya (UOC) built with Docker, implementing a Retrieval Augmented Generation (RAG) approach to provide immediate support to students.

## Architecture
The project consists of several containerized services:
- **assistant**: Built using Node.js, exposes an Express.js API server that interfaces with OpenAI API for AI processing and RAG functionality, as well as with the Database.
- **discord**: Built using Node.js, provides a Discord bot service with interactive chat functionality as the user interface.
- **mysql**: Database server for persistent storage of OpenAI, Discord and File data.

## Key Features
- **Instant Responses**: Provides real-time access to UOC information
- **Context-Aware Up-to-Date Suport**: Understands the specific context of each question, providing valuable responses.
- **Reduced Response Time**: Optimizes workflow to expedite query resolution.
- **Reduced Load on Traditional Support**: Handles common queries automatically
- **Innovative Support Service**: Aligns with expectations of a modern digital environment

## Getting Started
### Prerequisites
1. Docker and Docker Compose
2. OpenAI API Key [OpenAI Help - Find API Key Article](https://help.openai.com/en/articles/4936850-where-do-i-find-my-openai-api-key) and [OpenAI Platform - API Keys](https://platform.openai.com/api-keys)
3. Discord Server Setup
- Create Server
- Enable Community
- Create AI Channel
- Create Admin Role
4. Discord Application Setup (Explain how to create / add the bot, get tokens) [Discord Developers](https://discord.com/developers/applications)
- Create App
- Invite to Server
5. GitHub Repository for the Dataset (GH Personal Access Token)

### Configuration
Copy the `.env.example` template to `.env` and configure the environment variables:
```
cp .env.example .env
```

## Running the Application
### Production Mode
Start the complete application stack:
```
docker compose up -d discord
docker compose up --build --force-recreate assistant discord
```
This will:
- Start `mysql` (waits for its healtcheck to pass).
- Start `assistant` (waits for its healtcheck to pass).
- Finally, start `discord`.

### Database Backups
Run an on-demand backup:
```
# Make sure MySQL is running first
docker compose up -d mysql
# Then execute the backup script
docker compose exec mysql /etc/mysql/backup.sh
```
This will:
- Store the backup in `./backups/[DATE]/[DATABASE]-[TIME].sql`

### Viewing Logs
```
docker compose logs -f
docker compose logs -f <service_name>
```
Service name can be: `assistant`, `discord`, `mysql`

## Project Structure
```
containers/
├── assistant/         # Node - Express API service
│   ├── src/           # Source code
│   │   ├── models/    # Data models
│   │   ├── routes/    # API endpoints
│   │   ├── utils/     # Utility functions
│   │   ├── app.js     # Main application
│   │   └── config.js  # Configuration
├── discord/           # Node - Discord bot integration
│   ├── src/           # Bot source code
├── mysql/             # MySQL Database
│   ├── schema.sql     # Database schema
│   ├── backup.sh      # Backup script
backups/               # Database backups directory
.env.example           # Environment variable template
docker-compose.yml     # Container configuration
```

## Maintenance
- The application uses healtchecks to ensure proper startup sequence.
- Services automatically restart on failure.
- Database backups can be scheduled using external cron jobs or run on demand.

## Project Background
This project was developed as a final degree project (TFG) for the Multimedia Degree at UOC. It aims to improve the student experience by reducing wait times for support queries and providing immediate answers to common questions.

Complete Project Info: [TFG Pau Serrat Gutiérrez]()

## Author
Pau Serrat Gutiérrez