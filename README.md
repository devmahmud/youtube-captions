# YouTube Captions

A simple utility to fetch YouTube video captions programmatically. This library retrieves captions in plain text or structured format for specified video IDs.

## Features

- Fetch captions for any YouTube video with available subtitles.
- Supports multiple languages.
- Returns captions in both structured and plain text formats.

## Installation

You can install the package via npm:

```bash
npm install youtube-captions
```

Or using Yarn:

```bash
yarn add youtube-captions
```

Or with pnpm:

```bash
pnpm add youtube-captions
```

## Usage

### Importing the Function

You can import the `getVideoCaptions` function in your project as follows:

```javascript
import getVideoCaptions from 'youtube-captions';
// or for CommonJS
const getVideoCaptions = require('youtube-captions');
```

### Fetching Captions

To fetch captions for a specific video, call the function with the video ID and optional configuration:

```javascript
const videoId = 'jNQXAC9IVRw';
const captions = await getVideoCaptions(videoId, { lang: 'en' });

console.log(captions);
```

### Caption Configuration Options

The `getVideoCaptions` function accepts the following optional parameters:

- `lang` (string): Specify the language of the captions (e.g., 'en' for English).
- `plainText` (boolean): If set to true, the captions will be returned in plain text format.

### Example

```javascript
const videoId = 'jNQXAC9IVRw';
const captions = await getVideoCaptions('jNQXAC9IVRw', { lang: 'en', plainText: true });

console.log(captions);
```

## Error Handling

The `getVideoCaptions` function may throw errors for various reasons:

- **Invalid Video ID**: If the provided video ID is invalid.
- **Captions Disabled**: If captions are disabled for the video.
- **No Captions Available**: If there are no available captions for the video.
- **Request Limit Exceeded**: If YouTube is receiving too many requests from your IP.

### Example Error Handling

```javascript
try {
  await getVideoCaptions('invalid_id');
} catch (error) {
  console.error('Error fetching captions:', error.message);
}
```

## Testing

This library includes tests using Vitest. To run the tests, execute:

```bash
npm test
```

## Contributing

Contributions are welcome! Please feel free to submit a pull request or open an issue to discuss improvements or bugs.

## License

This project is licensed under the MIT License.
