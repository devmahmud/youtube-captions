import { describe, it, expect } from 'vitest';
import getVideoCaptions from '../src/index';

describe('getVideoCaptions', () => {
  it('should return captions for the valid video ID jNQXAC9IVRw', async () => {
    const captions = await getVideoCaptions('jNQXAC9IVRw', { lang: 'en' });

    expect(captions).toHaveLength(6);
    expect(captions).toEqual([
      {
        text: 'All right, so here we are, in front of the\nelephants',
        duration: 2.16,
        offset: 1.2,
        lang: 'en',
      },
      {
        text: 'the cool thing about these guys is that they\nhave really...',
        duration: 2.656,
        offset: 5.318,
        lang: 'en',
      },
      { text: 'really really long trunks', duration: 4.642, offset: 7.974, lang: 'en' },
      { text: 'and that&amp;#39;s cool', duration: 1.751, offset: 12.616, lang: 'en' },
      { text: '(baaaaaaaaaaahhh!!)', duration: 1.312, offset: 14.421, lang: 'en' },
      {
        text: 'and that&amp;#39;s pretty much all there is to\nsay',
        duration: 2,
        offset: 16.881,
        lang: 'en',
      },
    ]);
  });
  it('should fail for the invalid video ID', async () => {
    await expect(getVideoCaptions('invalid_id', { lang: 'en' })).rejects.toThrow(
      'Unable to retrieve YouTube video ID.'
    );
  });

  it('should throw error for disabled captions', async () => {
    await expect(getVideoCaptions('LeAltgu_pbM', { lang: 'en' })).rejects.toThrow(
      'Captions are disabled for this video'
    );
  });
});
