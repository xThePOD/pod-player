/** @jsxImportSource frog/jsx */
import { Button, Frog } from 'frog';
import { handle } from 'frog/vercel';
import { neynar } from 'frog/middlewares';
import axios from 'axios';

const app = new Frog({
  basePath: '/api',
  imageOptions: { width: 1200, height: 630 },
  title: 'Music NFT Viewer',
}).use(
  neynar({
    apiKey: 'NEYNAR_FROG_FM',
    features: ['interactor', 'cast'],
  })
);

app.frame('/', (c) => {
  return c.res({
    image: 'YOUR_IMAGE_URL',
    imageAspectRatio: '1.91:1',
    intents: [<Button action="/view-nft">View Music NFT</Button>],
  });
});

app.frame('/view-nft', async (c) => {
  const nftMetadata = await axios.get('YOUR_NFT_METADATA_URL');
  return c.res({
    image: nftMetadata.data.image,
    imageAspectRatio: '1.91:1',
    intents: [<Button action="/">Back</Button>],
  });
});

export const GET = handle(app);
export const POST = handle(app);

// Ensure this line is present to export the app object
export default app;
