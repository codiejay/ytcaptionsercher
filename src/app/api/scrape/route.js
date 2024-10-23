// pages/api/youtube.js
import { google } from "googleapis";
import { NextResponse } from "next/server";

const youtube = google.youtube({
  version: "v3",
  auth: "AIzaSyBsbFLelmiDV5mXxd5p2roJRoWaSTuYUx0",
});

/**
 * @param {Request} req
 * @returns {Promise<NextResponse>}
 */
export async function POST(req) {
  try {
    const { keyword } = await req.json();

    if (!keyword) {
      return NextResponse.json(
        { error: "Keyword is required" },
        { status: 400 }
      );
    }

    // Kinda calculate 24 hours ago from now
    const timeAgo = new Date();
    timeAgo.setHours(timeAgo.getHours() - 24);

    // Search for videos
    const searchResponse = await youtube.search.list({
      part: ["id", "snippet"],
      q: keyword,
      maxResults: 10,
      order: "date",
      publishedAfter: timeAgo.toISOString(),
      type: ["video"],
    });

    const videos = await Promise.all(
      searchResponse.data.items.map(async (item) => {
        const videoId = item.id.videoId;

        // Get video details
        const videoResponse = await youtube.videos.list({
          part: ["contentDetails", "snippet"],
          id: [videoId],
        });

        // Get captions
        let captions = "";
        try {
          const captionResponse = await youtube.captions.list({
            part: ["snippet"],
            videoId,
          });

          if (captionResponse.data.items?.length) {
            const captionTrack = await youtube.captions.download({
              id: captionResponse.data.items[0].id,
            });
            captions = captionTrack.data;
          }
        } catch (error) {
          console.error(`Error fetching captions for video ${videoId}:`, error);
        }

        const videoDetails = videoResponse.data.items[0];
        console.log(videoDetails);
        return {
          name: videoDetails.snippet.title,
          description: videoDetails.snippet.description,
          duration: videoDetails.contentDetails.duration.replace("PT", ""),
          captions,
        };
      })
    );

    return NextResponse.json({ videos });
  } catch (error) {
    console.error("YouTube API Error:", error);
    return NextResponse.json(
      { error: "Error fetching YouTube data" },
      { status: 500 }
    );
  }
}
