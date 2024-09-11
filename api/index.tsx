import { Button, Frog } from 'frog';
import { devtools } from 'frog/dev';
import { serveStatic } from 'frog/serve-static';
import { handle } from 'frog/vercel';
import axios from 'axios'; // Using axios to send HTTP requests to Neynar API
import { neynar } from 'frog/middlewares';

// Initialize the Neynar API for Farcaster integration
export const app = new Frog({
  assetsPath: '/',
  basePath: '/api',
  title: 'Frog Frame with Sharing',
}).use(
  neynar({
    apiKey: '0D6B6425-87D9-4548-95A2-36D107C12421', // Replace with your actual Neynar API key
    features: ['interactor', 'cast'], // Enable interactor and cast features
  })
);

// Function to publish the cast using the Neynar API
async function publishCast(message: string) {
  const apiKey = '0D6B6425-87D9-4548-95A2-36D107C12421'; // Replace with your Neynar API key

  try {
    const response = await axios.post(
      'https://hub-api.neynar.com/v1/cast', // Neynar API endpoint to publish cast
      {
        text: message,   // Prewritten message to be casted
        interactor: true // Enables interaction with the cast
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}` // Add authorization header
        }
      }
    );
    console.log('Cast published successfully:', response.data); // Log the response
    return response.data;
  } catch (error) {
    console.error('Error publishing cast:', error); // Log any errors
    return null;
  }
}

// Main frame logic
app.frame('/', async (c) => {
  const { buttonValue } = c;
  
  // Check if a fruit is selected and if the sharing option is active
  const fruitSelected = buttonValue && ['apples', 'oranges', 'bananas'].includes(buttonValue);
  const isSharing = buttonValue && buttonValue.startsWith('share_');

  let message = '';
  if (isSharing) {
    const selectedFruit = buttonValue.split('_')[1]; // Get the selected fruit from the buttonValue
    message = `I like ${selectedFruit.toUpperCase()}! Follow me, the creator!`; // Prewritten cast message
  }

  // If the user clicks the "Post to Farcaster" button, publish the cast
  if (buttonValue === 'post_to_farcaster') {
    const result = await publishCast(message); // Call the publishCast function
    if (result) {
      return c.res({ image: 'Cast posted successfully!' });
    } else {
      return c.res({ image: 'Error posting the cast.' });
    }
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
            ? `Ready to share: ${message}` // Display the prewritten cast message
            : fruitSelected
            ? `Nice choice. ${buttonValue!.toUpperCase()}!!` // Display the selected fruit
            : 'Welcome! Select your favorite fruit!'} // Default welcome message
        </div>
      </div>
    ),
    intents: 
      isSharing
        ? [
            <Button value="post_to_farcaster">Post to Farcaster</Button>, // Button to post the cast
            <Button value="apples">Apples</Button>,
            <Button value="oranges">Oranges</Button>,
            <Button.Reset>Reset</Button.Reset>, // Button to reset the frame
          ]
        : fruitSelected
        ? [
            <Button value={`share_${buttonValue}`}>Share on Farcaster</Button>, // Button to share the selected fruit
            <Button value="apples">Apples</Button>,
            <Button value="oranges">Oranges</Button>,
            <Button value="bananas">Bananas</Button>,
          ]
        : [
            <Button value="apples">Apples</Button>, // Button to select apples
            <Button value="oranges">Oranges</Button>, // Button to select oranges
            <Button value="bananas">Bananas</Button>, // Button to select bananas
            <Button.Reset>Cancel</Button.Reset>, // Button to cancel the selection
          ],
  });
});

// Enable development tools and serve static assets
const isProduction = process.env.NODE_ENV === 'production';
devtools(app, isProduction ? { assetsPath: '/.frog' } : { serveStatic });

export const GET = handle(app);
export const POST = handle(app);
