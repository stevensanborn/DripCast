
# DripCast


## DripCast is video platform that explores how micropayments can be used to better monetize on the Solana blockchain.


Live Demo on Devnet:
https://drip-cast.vercel.app




## onchain
written in anchor and rust , the entire code can be found in  /anchor . The app is deployed on devnet 
cd  anchor/
anchor build



## offchain 
the off chain application is written in typescript , using Postgres via drizzle orm, react, nextjs , and uses trpc .
for running localhost and webhooks ngrok is used :

bun run dev:all // runs both nextjs but also runs ngrok to listen for webhooks


### Video
Video integration is with MUX - this was chosen to speed up development . 
Webhooks are integrated in order to trigger updates to server for processing

### Database
The database it Postgress . Hosted by Neon. Drizzle ORM is used to speed up developement yet allow SQL style queries

### server 
Nextjs is used. TRPC is implemented to prefetch , call  and invalidate queries 

### Oath
For simlification Clerk is used to handle oath integration . Webhooks listen for updates to the user






