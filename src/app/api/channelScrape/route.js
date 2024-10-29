import { google } from "googleapis";
import { NextResponse } from "next/server";
import { YoutubeTranscript } from "youtube-transcript";

const youtube = google.youtube({
  version: "v3",
  auth: "AIzaSyBsbFLelmiDV5mXxd5p2roJRoWaSTuYUx0",
});

export async function POST(req) {
  try {
    const { channelName } = await req.json();

    if (!channelName) {
      return NextResponse.json(
        { error: "Channel name is required" },
        { status: 400 }
      );
    }

    // First, find the channel ID
    const channelResponse = await youtube.search.list({
      part: ["id"],
      q: channelName,
      type: ["channel"],
      maxResults: 1,
    });

    if (!channelResponse.data.items.length) {
      return NextResponse.json({ error: "Channel not found" }, { status: 404 });
    }

    const channelId = channelResponse.data.items[0].id.channelId;

    // Then get the channel's recent videos
    const searchResponse = await youtube.search.list({
      part: ["id"],
      channelId: channelId,
      maxResults: 10,
      order: "date", // Get most recent videos
      type: ["video"],
    });

    // Get detailed video information
    const videoIds = searchResponse.data.items.map((item) => item.id.videoId);
    const videoDetailsResponse = await youtube.videos.list({
      part: ["statistics", "snippet", "contentDetails"],
      id: videoIds,
    });

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
          channelTitle: videoDetails.snippet.channelTitle,
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
