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
      maxResults: 250, // Increased to 250
      order: "date",
      publishedAfter: timeAgo.toISOString(),
      type: ["video"],
    });

    // Get video details including view count
    const videoDetailsResponse = await youtube.videos.list({
      part: ["statistics", "snippet", "contentDetails"],
      id: searchResponse.data.items.map((item) => item.id.videoId),
    });

    // Sort videos by view count and get top 10
    const topVideos = videoDetailsResponse.data.items
      .sort(
        (a, b) =>
          parseInt(b.statistics.viewCount) - parseInt(a.statistics.viewCount)
      )
      .slice(0, 10);

    const videos = await Promise.all(
      topVideos.map(async (videoDetails) => {
        const videoId = videoDetails.id;

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

        return {
          name: videoDetails.snippet.title,
          description: videoDetails.snippet.description,
          duration: videoDetails.contentDetails.duration.replace("PT", ""),
          viewCount: videoDetails.statistics.viewCount,
          link: `https://www.youtube.com/watch?v=${videoId}`,
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
