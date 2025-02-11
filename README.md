Sui AI Agent Typhoon Hackathon

Wolf game is a data labelling text adventure, where you help Wolf find his way back home. A mini-game of Space Paws.

## Integrations

Atoma - Using DeepSeek-R1 via Atoma to analyze sentiment of tweets to filter accuracy of user inputs, scores lower than 75% against the sentiment of the LLM will be marked as failing the game checkpoint(https://github.com/livinwater/spacepaws-wolf-game/blob/main/app/api/evaluate/route.ts)

Sui - Uploading of game states to Walrus, so that players can continue from the previous playthroughs
(https://github.com/livinwater/spacepaws-wolf-game/blob/main/app/api/walrus/latest/route.ts)

## Demo Video




## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.


