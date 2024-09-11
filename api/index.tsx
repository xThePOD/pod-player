import { Button, Frog } from 'frog';
import { devtools } from 'frog/dev';
import { serveStatic } from 'frog/serve-static';
import { handle } from 'frog/vercel';
import { neynar } from 'frog/middlewares';

export const app = new Frog({
  assetsPath: '/',
  basePath: '/api',
  title: 'Frog Frame with Sharing',
}).use(
  neynar({
    apiKey: '0D6B6425-87D9-4548-95A2-36D107C12421',
    features: ['interactor'],
  })
);

app.frame('/', (c) => {
  const { buttonValue } = c;
  
  const fruitSelected = buttonValue && ['apples', 'oranges', 'bananas'].includes(buttonValue);
  const isSharing = buttonValue && buttonValue.startsWith('share_');

  let message = '';
  if (isSharing) {
    const selectedFruit = buttonValue.split('_')[1];
    message = `I like ${selectedFruit.toUpperCase()}! Follow me, the creator!`;
  }

  return c.res({
    image: (
      <div
        style={{
          alignItems: 'center',
          background: 'linear-gradient(to right, #432889, #17101F)',
          backgroundSize: '100% 100%',
          display: 'flex',
          flexDirection: 'column',
          flexWrap: 'nowrap',
          height: '100%',
          justifyContent: 'center',
          textAlign: 'center',
          width: '100%',
        }}
      >
        <div
          style={{
            color: 'white',
            fontSize: 60,
            fontStyle: 'normal',
            letterSpacing: '-0.025em',
            lineHeight: 1.4,
            marginTop: 30,
            padding: '0 120px',
            whiteSpace: 'pre-wrap',
          }}
        >
          {isSharing
            ? `Ready to share: ${message}`
            : fruitSelected
            ? `Nice choice. ${buttonValue!.toUpperCase()}!!`
            : 'Welcome! Select your favorite fruit!'}
        </div>
      </div>
    ),
    intents: 
      isSharing
        ? [
            <Button.Redirect location={`https://warpcast.com/~/compose?text=${encodeURIComponent(message)}`}>Post to Farcaster</Button.Redirect>,
            <Button value="apples">Apples</Button>,
            <Button value="oranges">Oranges</Button>,
            <Button.Reset>Reset</Button.Reset>,
          ]
        : fruitSelected
        ? [
            <Button value={`share_${buttonValue}`}>Share on Farcaster</Button>,
            <Button value="apples">Apples</Button>,
            <Button value="oranges">Oranges</Button>,
            <Button value="bananas">Bananas</Button>,
          ]
        : [
            <Button value="apples">Apples</Button>,
            <Button value="oranges">Oranges</Button>,
            <Button value="bananas">Bananas</Button>,
            <Button.Reset>Cancel</Button.Reset>,
          ],
  });
});

const isProduction = process.env.NODE_ENV === 'production';
devtools(app, isProduction ? { assetsPath: '/.frog' } : { serveStatic });

export const GET = handle(app);
export const POST = handle(app);