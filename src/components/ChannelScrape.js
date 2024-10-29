import { SearchIcon } from "@chakra-ui/icons";
import { Button, Flex, Heading, Input, Spinner } from "@chakra-ui/react";
import { useState } from "react";
import { FaYoutube } from "react-icons/fa";
import { ChannelVideoCard } from "./VideoCard";
export const ChannelScrape = ({}) => {
  const [channelName, setChannelName] = useState("");
  const [isChannelLoading, setIsChannelLoading] = useState(false);
  const [error, setError] = useState("");
  const [channelVideos, setChannelVideos] = useState([]);

  const searchChannel = async () => {
    if (!channelName.trim()) {
      setError("Please enter a channel name");
      return;
    }

    setIsChannelLoading(true);
    setError("");

    try {
      const response = await fetch("/api/channelScrape", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ channelName }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch videos");
      }

      const data = await response.json();
      setChannelVideos(data.videos);
      console.log(data.videos);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsChannelLoading(false);
    }
  };

  return (
    <>
      {error && (
        <div style={{ color: "red", marginBottom: "10px" }}>{error}</div>
      )}
      <Flex gap={4} mt="12">
        <Input
          placeholder="Enter Channel Name..."
          value={channelName}
          onChange={(e) => setChannelName(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && searchChannel()}
          flex={1}
        />
        <Button
          onClick={searchChannel}
          isDisabled={isChannelLoading}
          minW="100px"
          leftIcon={isChannelLoading ? <Spinner size="sm" /> : <SearchIcon />}
        >
          {isChannelLoading ? "Searching" : "Search"}
        </Button>
      </Flex>
      <Heading mt="12" mb="4" display="flex" alignItems="center" gap={2}>
        <FaYoutube /> Youtube Videos
      </Heading>
      <Flex flexWrap="wrap" gap={4}>
        {channelVideos.length > 0 &&
          channelVideos.map((video, index) => (
            <ChannelVideoCard video={video} index={index} key={index} />
          ))}
      </Flex>
    </>
  );
};
