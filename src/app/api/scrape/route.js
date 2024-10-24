import { google } from "googleapis";
import { NextResponse } from "next/server";
import { YoutubeTranscript } from "youtube-transcript";

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

    const timeAgo = new Date();
    timeAgo.setHours(timeAgo.getHours() - 24);

    // First search with minimal data to get just top 10 videos
    const searchResponse = await youtube.search.list({
      part: ["id"],
      q: keyword,
      maxResults: 10, // Reduced from 50 to 10
      order: "viewCount", // Changed from date to viewCount to get popular videos directly
      publishedAfter: timeAgo.toISOString(),
      type: ["video"],
    });

    // Single batch request for top 10 videos
    const videoIds = searchResponse.data.items.map((item) => item.id.videoId);
    const videoDetailsResponse = await youtube.videos.list({
      part: ["statistics", "snippet", "contentDetails"],
      id: videoIds,
    });

    // Process videos without additional sorting
    const videos = await Promise.all(
      videoDetailsResponse.data.items.map(async (videoDetails) => {
        const videoId = videoDetails.id;

        let captions = "";
        try {
          const transcript = await YoutubeTranscript.fetchTranscript(videoId);
          captions = transcript.map((item) => item.text).join(" ");
        } catch (error) {
          console.error(`Error fetching captions for video ${videoId}:`, error);
        }

        return {
          name: videoDetails.snippet.title,
          description: videoDetails.snippet.description,
          publishedAt: new Date(
            videoDetails.snippet.publishedAt
          ).toLocaleString(),
          viewCount: videoDetails.statistics.viewCount,
          link: `https://www.youtube.com/watch?v=${videoId}`,
          captions,
          videoDetail: videoDetails,
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
